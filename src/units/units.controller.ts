import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CreateUnitDto } from './dto';
import { UnitsService } from './units.service';
@ApiTags('Unidades') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('unidades')
export class UnitsController {
  constructor(private service: UnitsService) {}
  @Post() @Roles(Role.GERENTE, Role.ADMIN) @ApiOperation({ summary: 'Cadastrar unidade de estoque' }) create(@Body() dto: CreateUnitDto) { return this.service.create(dto); }
  @Get() @ApiOperation({ summary: 'Listar unidades com paginação' }) @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'limit', required: false }) findAll(@Query('page') p = '1', @Query('limit') l = '20') { const page = Number(p), limit = Number(l); return this.service.findAll(Number.isInteger(page) && page > 0 ? page : 1, Number.isInteger(limit) && limit > 0 && limit <= 100 ? limit : 20); }
}
