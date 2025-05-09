import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction, TransactionType } from '../transactions/entities/transaction.entity';

@Injectable()
export class SummariesService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async getMonthlySummary(userId: string, month: number, year: number) {
    // Calcular o primeiro e último dia do mês para filtrar as transações
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Buscar todas as transações do mês
    const transactions = await this.transactionsRepository.find({
      where: {
        userId,
        date: Between(startDate, endDate),
      },
    });
    
    // Calcular totais
    let income = 0;
    let expense = 0;
    
    transactions.forEach(transaction => {
      if (transaction.type === TransactionType.INCOME) {
        income += Number(transaction.amount);
      } else if (transaction.type === TransactionType.EXPENSE) {
        expense += Number(transaction.amount);
      }
    });
    
    // Calcular o saldo (receitas - despesas)
    const balance = income - expense;
    
    return {
      month,
      year,
      income,
      expense,
      balance,
    };
  }
} 