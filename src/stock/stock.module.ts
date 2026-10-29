import { Module } from '@nestjs/common';
import { RolesGuard } from '../common/roles.guard';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
@Module({ controllers: [StockController], providers: [StockService, RolesGuard] })
export class StockModule {}
