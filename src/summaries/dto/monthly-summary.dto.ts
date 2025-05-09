import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class MonthlySummaryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  @IsNotEmpty({ message: 'Mês é obrigatório' })
  month: number;

  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  @IsNotEmpty({ message: 'Ano é obrigatório' })
  year: number;
} 