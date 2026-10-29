import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
export class CreateUnitDto {
  @ApiProperty({ example: 'LOJA-CENTRO' }) @IsString() @MinLength(2) @MaxLength(40) code: string;
  @ApiProperty({ example: 'Loja Centro' }) @IsString() @MinLength(2) @MaxLength(120) name: string;
}
