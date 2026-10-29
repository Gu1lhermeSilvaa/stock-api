import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovementType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, MinLength, Max } from 'class-validator';
import { Type } from 'class-transformer';
export class CreateMovementDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() productId: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() unitId: string;
  @ApiProperty({ enum: MovementType, example: MovementType.ENTRADA }) @IsEnum(MovementType) type: MovementType;
  @ApiProperty({ example: 100, minimum: 1 }) @IsInt() @Min(1) quantity: number;
  @ApiPropertyOptional({ example: 'Reposição semanal' }) @IsOptional() @IsString() @MinLength(2) @MaxLength(300) reason?: string;
}
export class StockQueryDto {
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() productId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() unitId?: string;
  @ApiPropertyOptional({ example: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ example: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
}
