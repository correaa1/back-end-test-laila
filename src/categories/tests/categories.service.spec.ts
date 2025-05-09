import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories.service';
import { Category } from '../entities/category.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoriesRepository: Repository<Category>;
  let transactionsRepository: Repository<Transaction>;

  const userId = 'user-id';
  const categoryId = 'category-id';

  const mockCategory = {
    id: categoryId,
    name: 'Test Category',
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategoriesRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockTransactionsRepository = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoriesRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionsRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    categoriesRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
    transactionsRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a category', async () => {
      // Arrange
      const createCategoryDto = { name: 'New Category' };
      mockCategoriesRepository.create.mockReturnValue({
        ...createCategoryDto,
        userId,
      });
      mockCategoriesRepository.save.mockResolvedValue({
        id: categoryId,
        ...createCategoryDto,
        userId,
      });

      // Act
      const result = await service.create(createCategoryDto, userId);

      // Assert
      expect(mockCategoriesRepository.create).toHaveBeenCalledWith({
        ...createCategoryDto,
        userId,
      });
      expect(mockCategoriesRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id', categoryId);
    });
  });

  describe('findAll', () => {
    it('should return all categories for a user', async () => {
      // Arrange
      mockCategoriesRepository.find.mockResolvedValue([mockCategory]);

      // Act
      const result = await service.findAll(userId);

      // Assert
      expect(mockCategoriesRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { name: 'ASC' },
      });
      expect(result).toEqual([mockCategory]);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      // Arrange
      mockCategoriesRepository.findOne.mockResolvedValue(mockCategory);

      // Act
      const result = await service.findOne(categoryId, userId);

      // Assert
      expect(mockCategoriesRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      // Arrange
      mockCategoriesRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(categoryId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when category belongs to another user', async () => {
      // Arrange
      mockCategoriesRepository.findOne.mockResolvedValue({
        ...mockCategory,
        userId: 'another-user-id',
      });

      // Act & Assert
      await expect(service.findOne(categoryId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      // Arrange
      const updateCategoryDto = { name: 'Updated Category' };
      mockCategoriesRepository.findOne.mockResolvedValue(mockCategory);
      mockCategoriesRepository.update.mockResolvedValue({ affected: 1 });

      // Act
      await service.update(categoryId, updateCategoryDto, userId);

      // Assert
      expect(mockCategoriesRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(mockCategoriesRepository.update).toHaveBeenCalledWith(
        categoryId,
        updateCategoryDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      // Arrange
      mockCategoriesRepository.findOne.mockResolvedValue(mockCategory);
      mockTransactionsRepository.count.mockResolvedValue(0);
      mockCategoriesRepository.delete.mockResolvedValue({ affected: 1 });

      // Act
      const result = await service.remove(categoryId, userId);

      // Assert
      expect(mockCategoriesRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(mockTransactionsRepository.count).toHaveBeenCalledWith({
        where: { categoryId },
      });
      expect(mockCategoriesRepository.delete).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual({ message: 'Categoria removida com sucesso' });
    });

    it('should not remove a category with associated transactions', async () => {
      // Arrange
      mockCategoriesRepository.findOne.mockResolvedValue(mockCategory);
      mockTransactionsRepository.count.mockResolvedValue(1);

      // Act & Assert
      await expect(service.remove(categoryId, userId)).rejects.toThrow(
        ConflictException
      );
      // Verificar que o método delete não foi chamado
      expect(mockCategoriesRepository.delete).not.toHaveBeenCalled();
    });
  });
}); 