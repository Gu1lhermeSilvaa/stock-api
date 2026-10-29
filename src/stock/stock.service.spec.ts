import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { MovementType, Prisma } from '@prisma/client';
import { StockService } from './stock.service';

const PRODUCT_ID = '4ff85043-58be-4172-8ec2-709804e347bb';
const UNIT_ID = '223c142c-48df-4850-99e9-de89c084f9ac';
const USER_ID = 'd699b020-6358-4d83-8e5e-18c8a82ef69a';

describe('StockService', () => {
  let service: StockService;
  let tx: any;
  let prisma: any;

  beforeEach(() => {
    tx = {
      stockBalance: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        updateMany: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      stockMovement: { create: jest.fn() },
    };
    prisma = {
      product: { findUnique: jest.fn().mockResolvedValue({ id: PRODUCT_ID, active: true }) },
      unit: { findUnique: jest.fn().mockResolvedValue({ id: UNIT_ID, active: true }) },
      stockBalance: { findMany: jest.fn(), count: jest.fn() },
      stockMovement: { findMany: jest.fn(), count: jest.fn() },
      $transaction: jest.fn(),
    };
    service = new StockService(prisma);
  });

  describe('createMovement', () => {
    const entrada = { productId: PRODUCT_ID, unitId: UNIT_ID, type: MovementType.ENTRADA, quantity: 100, reason: 'Reposição' };
    const saida = { productId: PRODUCT_ID, unitId: UNIT_ID, type: MovementType.SAIDA, quantity: 30, reason: 'Venda' };

    beforeEach(() => {
      prisma.$transaction.mockImplementation((cb: any) => cb(tx));
    });

    it('recusa quantidade menor ou igual a zero', async () => {
      await expect(service.createMovement({ ...entrada, quantity: 0 }, USER_ID)).rejects.toThrow(BadRequestException);
    });

    it('retorna 404 quando o produto não existe', async () => {
      prisma.product.findUnique.mockResolvedValue(null);
      await expect(service.createMovement(entrada, USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('retorna 404 quando a unidade está inativa', async () => {
      prisma.unit.findUnique.mockResolvedValue({ id: UNIT_ID, active: false });
      await expect(service.createMovement(entrada, USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('entrada cria o saldo inicial e registra a movimentação', async () => {
      tx.stockBalance.upsert.mockResolvedValue({ quantity: 100 });
      tx.stockMovement.create.mockResolvedValue({ id: 'mov-1', balanceAfter: 100 });

      const result = await service.createMovement(entrada, USER_ID);

      expect(tx.stockBalance.upsert).toHaveBeenCalled();
      expect(tx.stockMovement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ type: MovementType.ENTRADA, quantity: 100, balanceAfter: 100, userId: USER_ID }),
      });
      expect(result.balance.quantity).toBe(100);
    });

    it('saída sem saldo prévio retorna 409', async () => {
      tx.stockBalance.findUnique.mockResolvedValue(null);
      await expect(service.createMovement(saida, USER_ID)).rejects.toThrow(ConflictException);
      expect(tx.stockMovement.create).not.toHaveBeenCalled();
    });

    it('saída maior que o saldo retorna 409 e não registra movimentação', async () => {
      tx.stockBalance.findUnique.mockResolvedValue({ quantity: 10 });
      tx.stockBalance.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.createMovement({ ...saida, quantity: 500 }, USER_ID)).rejects.toThrow('Estoque insuficiente');
      expect(tx.stockMovement.create).not.toHaveBeenCalled();
    });

    it('saída válida reduz o saldo e grava balanceAfter', async () => {
      tx.stockBalance.findUnique.mockResolvedValue({ quantity: 100 });
      tx.stockBalance.updateMany.mockResolvedValue({ count: 1 });
      tx.stockBalance.findUniqueOrThrow.mockResolvedValue({ quantity: 70 });
      tx.stockMovement.create.mockResolvedValue({ id: 'mov-2', balanceAfter: 70 });

      const result = await service.createMovement(saida, USER_ID);

      expect(tx.stockMovement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ type: MovementType.SAIDA, quantity: 30, balanceAfter: 70 }),
      });
      expect(result.balance.quantity).toBe(70);
    });

    it('converte conflito de concorrência (P2034) em 409', async () => {
      prisma.$transaction.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('conflito', { code: 'P2034', clientVersion: 'test' }),
      );
      await expect(service.createMovement(entrada, USER_ID)).rejects.toThrow('Conflito de concorrência');
    });
  });

  describe('getBalances', () => {
    beforeEach(() => {
      prisma.$transaction.mockImplementation((queries: Promise<any>[]) => Promise.all(queries));
    });

    it('filtra por produto e unidade e calcula a paginação', async () => {
      prisma.stockBalance.findMany.mockResolvedValue([{ id: 'b1', quantity: 100 }]);
      prisma.stockBalance.count.mockResolvedValue(45);

      const result = await service.getBalances({ productId: PRODUCT_ID, unitId: UNIT_ID } as any);

      expect(prisma.stockBalance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { productId: PRODUCT_ID, unitId: UNIT_ID }, skip: 0, take: 20 }),
      );
      expect(result.pagination).toEqual({ page: 1, limit: 20, total: 45, totalPages: 3 });
    });

    it('limita o limit a no máximo 100', async () => {
      prisma.stockBalance.findMany.mockResolvedValue([]);
      prisma.stockBalance.count.mockResolvedValue(0);

      const result = await service.getBalances({ limit: 5000 } as any);

      expect(result.pagination.limit).toBe(100);
    });
  });
});