import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { MovementType, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateMovementDto, StockQueryDto } from './dto';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async createMovement(dto: CreateMovementDto, userId: string) {
    if (dto.quantity <= 0) throw new BadRequestException('A quantidade deve ser maior que zero.');
    const [product, unit] = await Promise.all([
      this.prisma.product.findUnique({ where: { id: dto.productId } }),
      this.prisma.unit.findUnique({ where: { id: dto.unitId } }),
    ]);
    if (!product || !product.active) throw new NotFoundException('Produto não encontrado ou inativo.');
    if (!unit || !unit.active) throw new NotFoundException('Unidade não encontrada ou inativa.');

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Upsert cria o saldo inicial para entradas; saída sem saldo é recusada.
        if (dto.type === MovementType.ENTRADA) {
          const balance = await tx.stockBalance.upsert({
            where: { productId_unitId: { productId: dto.productId, unitId: dto.unitId } },
            create: { productId: dto.productId, unitId: dto.unitId, quantity: dto.quantity },
            update: { quantity: { increment: dto.quantity } },
          });
          const movement = await tx.stockMovement.create({ data: { productId: dto.productId, unitId: dto.unitId, userId, type: dto.type, quantity: dto.quantity, balanceAfter: balance.quantity, reason: dto.reason } });
          return { movement, balance };
        }

        const current = await tx.stockBalance.findUnique({ where: { productId_unitId: { productId: dto.productId, unitId: dto.unitId } } });
        if (!current) throw new ConflictException('Não existe saldo para este produto nesta unidade. Registre uma entrada primeiro.');
        // Atualização condicional evita saldo negativo mesmo com saídas concorrentes.
        const updated = await tx.stockBalance.updateMany({
          where: { productId: dto.productId, unitId: dto.unitId, quantity: { gte: dto.quantity } },
          data: { quantity: { decrement: dto.quantity } },
        });
        if (updated.count !== 1) throw new ConflictException('Estoque insuficiente para realizar esta saída.');
        const balance = await tx.stockBalance.findUniqueOrThrow({ where: { productId_unitId: { productId: dto.productId, unitId: dto.unitId } } });
        const movement = await tx.stockMovement.create({ data: { productId: dto.productId, unitId: dto.unitId, userId, type: dto.type, quantity: dto.quantity, balanceAfter: balance.quantity, reason: dto.reason } });
        return { movement, balance };
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2034') throw new ConflictException('Conflito de concorrência no estoque. Tente novamente.');
      throw e;
    }
  }

  async getBalances(query: StockQueryDto) {
    const where = { ...(query.productId ? { productId: query.productId } : {}), ...(query.unitId ? { unitId: query.unitId } : {}) };
    const page = Math.max(1, query.page || 1), limit = Math.min(100, Math.max(1, query.limit || 20));
    const [data, total] = await this.prisma.$transaction([
      this.prisma.stockBalance.findMany({ where, include: { product: true, unit: true }, orderBy: [{ unit: { name: 'asc' } }, { product: { name: 'asc' } }], skip: (page - 1) * limit, take: limit }),
      this.prisma.stockBalance.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getMovements(query: StockQueryDto) {
    const where = { ...(query.productId ? { productId: query.productId } : {}), ...(query.unitId ? { unitId: query.unitId } : {}) };
    const page = Math.max(1, query.page || 1), limit = Math.min(100, Math.max(1, query.limit || 20));
    const [data, total] = await this.prisma.$transaction([
      this.prisma.stockMovement.findMany({ where, include: { product: true, unit: true, user: { select: { id: true, name: true, email: true, role: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.stockMovement.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
