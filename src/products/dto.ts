import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
export class CreateProductDto {
  @ApiProperty({ example: 'CAF-500', maxLength: 60 }) @IsString() @MinLength(2) @MaxLength(60) sku: string;
  @ApiProperty({ example: 'Café 500 g' }) @IsString() @MinLength(2) @MaxLength(120) name: string;
  @ApiPropertyOptional({ example: 'Pacote de café torrado e moído' }) @IsOptional() @IsString() @MaxLength(500) description?: string;
}
export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({ example: true }) @IsOptional() @IsBoolean() active?: boolean;
}
