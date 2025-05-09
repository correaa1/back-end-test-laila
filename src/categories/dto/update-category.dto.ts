import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome da categoria é obrigatório' })
  name: string;
} 