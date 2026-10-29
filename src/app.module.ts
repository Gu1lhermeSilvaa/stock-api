import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { UnitsModule } from './units/units.module';
import { StockModule } from './stock/stock.module';
@Module({ imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, ProductsModule, UnitsModule, StockModule] })
export class AppModule {}
