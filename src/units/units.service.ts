import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUnitDto } from './dto';
@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}
  create(dto: CreateUnitDto) { return this.prisma.unit.create({ data: { ...dto, code: dto.code.trim().toUpperCase(), name: dto.name.trim() } }); }
  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.prisma.$transaction([this.prisma.unit.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { name: 'asc' }, include: { _count: { select: { balances: true } } } }), this.prisma.unit.count()]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
