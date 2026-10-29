import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto';
@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}
  create(dto: CreateProductDto) { return this.prisma.product.create({ data: { ...dto, sku: dto.sku.trim().toUpperCase(), name: dto.name.trim() } }); }
  async findAll(page = 1, limit = 20, search?: string) {
    const where = search ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { sku: { contains: search, mode: 'insensitive' as const } }] } : {};
    const [data, total] = await this.prisma.$transaction([this.prisma.product.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }), this.prisma.product.count({ where })]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  async findOne(id: string) { const product = await this.prisma.product.findUnique({ where: { id }, include: { balances: { include: { unit: true } } } }); if (!product) throw new NotFoundException('Produto não encontrado.'); return product; }
  async update(id: string, dto: UpdateProductDto) { await this.findOne(id); return this.prisma.product.update({ where: { id }, data: { ...dto, ...(dto.sku ? { sku: dto.sku.trim().toUpperCase() } : {}), ...(dto.name ? { name: dto.name.trim() } : {}) } }); }
}
