import { Module } from '@nestjs/common';
import { RolesGuard } from '../common/roles.guard';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';
@Module({ controllers: [UnitsController], providers: [UnitsService, RolesGuard] })
export class UnitsModule {}
