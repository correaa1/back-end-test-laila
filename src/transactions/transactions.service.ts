import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private categoriesService: CategoriesService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto, userId: string) {
    // Verificar se a categoria existe e pertence ao usuário
    await this.categoriesService.findOne(createTransactionDto.categoryId, userId);
    
    // Criar a transação
    const transaction = this.transactionsRepository.create({
      ...createTransactionDto,
      userId,
    });
    
    return this.transactionsRepository.save(transaction);
  }

  async findAll(userId: string, filters: { 
    categoryId?: string, 
    type?: string,
    startDate?: string,
    endDate?: string,
    page?: number,
    pageSize?: number
  } = {}) {
    this.logger.log(`Consultando transações do usuário ${userId} com filtros: ${JSON.stringify(filters)}`);
    
    // Criar o objeto de condições para a consulta
    const where: any = { userId };
    
    // Adicionar filtros opcionais se forem fornecidos
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    
    if (filters.type) {
      where.type = filters.type;
    }
    
    // Adicionar filtro por intervalo de datas, se fornecido
    if (filters.startDate && filters.endDate) {
      this.logger.log(`Filtrando transações por data: ${filters.startDate} a ${filters.endDate}`);
      where.date = Between(new Date(filters.startDate), new Date(filters.endDate));
    }
    
    // Configurar paginação se fornecida
    const take = filters.pageSize ? filters.pageSize : undefined;
    const skip = (filters.page && filters.pageSize) ? (filters.page - 1) * filters.pageSize : undefined;
    
    // Usar a abordagem padrão com relations, que é mais simples e legível
    const transactions = await this.transactionsRepository.find({
      where,
      relations: ['category'],
      order: { date: 'DESC' },
      take,
      skip
    });
    
    return transactions;
  }

  async findOne(id: string, userId: string) {
    // Usar também a abordagem padrão para buscar por ID
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
      relations: ['category']
    });
    
    if (!transaction) {
      throw new NotFoundException(`Lançamento com ID ${id} não encontrado`);
    }
    
    // Verificar se a transação pertence ao usuário
    if (transaction.userId !== userId) {
      throw new ForbiddenException('Acesso negado a este lançamento');
    }
    
    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto, userId: string) {
    // Verificar se a transação existe e pertence ao usuário
    await this.findOne(id, userId);
    
    // Se a categoria foi alterada, verificar se a nova categoria existe e pertence ao usuário
    if (updateTransactionDto.categoryId) {
      await this.categoriesService.findOne(updateTransactionDto.categoryId, userId);
    }
    
    // Atualizar a transação
    await this.transactionsRepository.update(id, updateTransactionDto);
    
    // Retornar a transação atualizada
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string) {
    // Verificar se a transação existe e pertence ao usuário
    await this.findOne(id, userId);
    
    // Remover a transação
    await this.transactionsRepository.delete(id);
    
    return { message: 'Lançamento removido com sucesso' };
  }
} 