import { IsDate, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../entities/transaction.entity';

export class UpdateTransactionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  date?: Date;

  @IsUUID()
  @IsOptional()
  categoryId?: string;
} 