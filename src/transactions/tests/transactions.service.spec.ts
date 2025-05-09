import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository, Between } from 'typeorm';
import { TransactionsService } from '../transactions.service';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { CategoriesService } from '../../categories/categories.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let transactionsRepository: Repository<Transaction>;
  let categoriesService: CategoriesService;

  const userId = 'user-id';
  const categoryId = 'category-id';
  const transactionId = 'transaction-id';

  const mockTransaction = {
    id: transactionId,
    title: 'Test Transaction',
    amount: 100,
    type: TransactionType.INCOME,
    date: new Date('2025-05-10'),
    userId,
    categoryId,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: {
      id: categoryId,
      name: 'Test Category',
      userId,
    },
  };

  const mockTransactionsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockCategoriesService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionsRepository,
        },
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    transactionsRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
    categoriesService = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a transaction', async () => {
      // Arrange
      const createTransactionDto = {
        title: 'New Transaction',
        amount: 100,
        type: TransactionType.INCOME,
        date: new Date('2025-05-10'),
        categoryId,
      };
      mockCategoriesService.findOne.mockResolvedValue({ id: categoryId, userId });
      mockTransactionsRepository.create.mockReturnValue({
        ...createTransactionDto,
        userId,
      });
      mockTransactionsRepository.save.mockResolvedValue({
        id: transactionId,
        ...createTransactionDto,
        userId,
      });

      // Act
      const result = await service.create(createTransactionDto, userId);

      // Assert
      expect(mockCategoriesService.findOne).toHaveBeenCalledWith(categoryId, userId);
      expect(mockTransactionsRepository.create).toHaveBeenCalledWith({
        ...createTransactionDto,
        userId,
      });
      expect(mockTransactionsRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id', transactionId);
    });
  });

  describe('findAll', () => {
    it('should return all transactions for a user', async () => {
      // Arrange
      mockTransactionsRepository.find.mockResolvedValue([mockTransaction]);

      // Act
      const result = await service.findAll(userId);

      // Assert
      expect(mockTransactionsRepository.find).toHaveBeenCalledWith({
        where: { userId },
        relations: ['category'],
        order: { date: 'DESC' },
        take: undefined,
        skip: undefined,
      });
      expect(result).toEqual([mockTransaction]);
    });

    it('should filter transactions by categoryId', async () => {
      // Arrange
      mockTransactionsRepository.find.mockResolvedValue([mockTransaction]);

      // Act
      await service.findAll(userId, { categoryId });

      // Assert
      expect(mockTransactionsRepository.find).toHaveBeenCalledWith({
        where: { userId, categoryId },
        relations: ['category'],
        order: { date: 'DESC' },
        take: undefined,
        skip: undefined,
      });
    });

    it('should filter transactions by type', async () => {
      // Arrange
      const type = TransactionType.INCOME;
      mockTransactionsRepository.find.mockResolvedValue([mockTransaction]);

      // Act
      await service.findAll(userId, { type });

      // Assert
      expect(mockTransactionsRepository.find).toHaveBeenCalledWith({
        where: { userId, type },
        relations: ['category'],
        order: { date: 'DESC' },
        take: undefined,
        skip: undefined,
      });
    });

    it('should filter transactions by date range', async () => {
      // Arrange
      const startDate = '2025-05-01';
      const endDate = '2025-05-31';
      mockTransactionsRepository.find.mockResolvedValue([mockTransaction]);

      // Act
      await service.findAll(userId, { startDate, endDate });

      // Assert
      expect(mockTransactionsRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            date: expect.any(Object),
          }),
        }),
      );
    });

    it('should apply pagination', async () => {
      // Arrange
      const page = 2;
      const pageSize = 10;
      mockTransactionsRepository.find.mockResolvedValue([mockTransaction]);

      // Act
      await service.findAll(userId, { page, pageSize });

      // Assert
      expect(mockTransactionsRepository.find).toHaveBeenCalledWith({
        where: { userId },
        relations: ['category'],
        order: { date: 'DESC' },
        take: 10,
        skip: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', async () => {
      // Arrange
      mockTransactionsRepository.findOne.mockResolvedValue(mockTransaction);

      // Act
      const result = await service.findOne(transactionId, userId);

      // Assert
      expect(mockTransactionsRepository.findOne).toHaveBeenCalledWith({
        where: { id: transactionId },
        relations: ['category'],
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException when transaction not found', async () => {
      // Arrange
      mockTransactionsRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(transactionId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when transaction belongs to another user', async () => {
      // Arrange
      mockTransactionsRepository.findOne.mockResolvedValue({
        ...mockTransaction,
        userId: 'another-user-id',
      });

      // Act & Assert
      await expect(service.findOne(transactionId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update a transaction', async () => {
      // Arrange
      const updateTransactionDto = { title: 'Updated Transaction' };
      mockTransactionsRepository.findOne.mockResolvedValue(mockTransaction);
      mockTransactionsRepository.update.mockResolvedValue({ affected: 1 });

      // Act
      await service.update(transactionId, updateTransactionDto, userId);

      // Assert
      expect(mockTransactionsRepository.findOne).toHaveBeenCalledWith({
        where: { id: transactionId },
        relations: ['category'],
      });
      expect(mockTransactionsRepository.update).toHaveBeenCalledWith(
        transactionId,
        updateTransactionDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a transaction', async () => {
      // Arrange
      mockTransactionsRepository.findOne.mockResolvedValue(mockTransaction);
      mockTransactionsRepository.delete.mockResolvedValue({ affected: 1 });

      // Act
      const result = await service.remove(transactionId, userId);

      // Assert
      expect(mockTransactionsRepository.findOne).toHaveBeenCalledWith({
        where: { id: transactionId },
        relations: ['category'],
      });
      expect(mockTransactionsRepository.delete).toHaveBeenCalledWith(
        transactionId,
      );
      expect(result).toEqual({ message: 'Lançamento removido com sucesso' });
    });
  });
}); 