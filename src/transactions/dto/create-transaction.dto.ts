import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty({ message: 'Título é obrigatório' })
  title: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Valor é obrigatório' })
  amount: number;

  @IsEnum(TransactionType, { message: 'Tipo deve ser RECEITA ou DESPESA' })
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  type: TransactionType;

  @Type(() => Date)
  @IsDate({ message: 'Data inválida' })
  @IsNotEmpty({ message: 'Data é obrigatória' })
  date: Date;

  @IsUUID()
  @IsNotEmpty({ message: 'Categoria é obrigatória' })
  categoryId: string;
} 