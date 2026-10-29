import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, AuthUser } from '../common/current-user.decorator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CreateMovementDto, StockQueryDto } from './dto';
import { StockService } from './stock.service';
@ApiTags('Estoque') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('estoques')
export class StockController {
  constructor(private service: StockService) {}
  @Post('movimentacoes') @Roles(Role.ATENDENTE, Role.GERENTE, Role.ADMIN) @ApiOperation({ summary: 'Registrar entrada ou saída de estoque' }) create(@Body() dto: CreateMovementDto, @CurrentUser() user: AuthUser) { return this.service.createMovement(dto, user.id); }
  @Get('saldos') @Roles(Role.CLIENTE, Role.ATENDENTE, Role.COZINHA, Role.GERENTE, Role.ADMIN) @ApiOperation({ summary: 'Consultar saldo por produto e/ou unidade' }) @ApiQuery({ name: 'productId', required: false }) @ApiQuery({ name: 'unitId', required: false }) @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'limit', required: false }) getBalances(@Query() query: StockQueryDto) { return this.service.getBalances(query); }
  @Get('movimentacoes') @Roles(Role.ATENDENTE, Role.GERENTE, Role.ADMIN) @ApiOperation({ summary: 'Consultar histórico de movimentações' }) @ApiQuery({ name: 'productId', required: false }) @ApiQuery({ name: 'unitId', required: false }) @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'limit', required: false }) getMovements(@Query() query: StockQueryDto) { return this.service.getMovements(query); }
}
