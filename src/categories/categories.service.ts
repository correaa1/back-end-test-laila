import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Transaction } from '../transactions/entities/transaction.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string) {
    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      userId,
    });
    
    return this.categoriesRepository.save(category);
  }

  async findAll(userId: string) {
    return this.categoriesRepository.find({
      where: { userId },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, userId: string) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
    });
    
    if (!category) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada`);
    }
    
    // Verificar se a categoria pertence ao usuário
    if (category.userId !== userId) {
      throw new ForbiddenException('Acesso negado a esta categoria');
    }
    
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, userId: string) {
    // Verificar se a categoria existe e pertence ao usuário
    await this.findOne(id, userId);
    
    // Atualizar a categoria
    await this.categoriesRepository.update(id, updateCategoryDto);
    
    // Retornar a categoria atualizada
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string) {
    // Verificar se a categoria existe e pertence ao usuário
    await this.findOne(id, userId);
    
    // Verificar se existem transações usando esta categoria
    const transactionsCount = await this.transactionsRepository.count({
      where: { categoryId: id }
    });
    
    if (transactionsCount > 0) {
      throw new ConflictException(
        `Não é possível excluir esta categoria porque ela está sendo usada em ${transactionsCount} transação(ões). ` +
        `Remova ou altere as transações associadas antes de excluir a categoria.`
      );
    }
    
    // Remover a categoria
    await this.categoriesRepository.delete(id);
    
    return { message: 'Categoria removida com sucesso' };
  }
} 