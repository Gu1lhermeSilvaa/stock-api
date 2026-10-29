import { Body, Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto';
@ApiTags('Produtos') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('produtos')
export class ProductsController {
  constructor(private service: ProductsService) {}
  @Post() @Roles(Role.GERENTE, Role.ADMIN) @ApiOperation({ summary: 'Cadastrar produto' }) create(@Body() dto: CreateProductDto) { return this.service.create(dto); }
  @Get() @ApiOperation({ summary: 'Listar produtos com paginação' }) @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'limit', required: false }) @ApiQuery({ name: 'search', required: false }) findAll(@Query('page') page = '1', @Query('limit') limit = '20', @Query('search') search?: string) { return this.service.findAll(this.pageNum(page, 1, 100000), this.pageNum(limit, 20, 100), search); }
  @Get(':id') @ApiOperation({ summary: 'Consultar produto e saldos' }) findOne(@Param('id', ParseUUIDPipe) id: string) { return this.service.findOne(id); }
  @Patch(':id') @Roles(Role.GERENTE, Role.ADMIN) @ApiOperation({ summary: 'Atualizar produto' }) update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) { return this.service.update(id, dto); }
  private pageNum(value: string, fallback: number, max: number) { const n = Number(value); return Number.isInteger(n) && n >= 1 && n <= max ? n : fallback; }
}
