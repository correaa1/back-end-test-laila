import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from '../transactions.controller';
import { TransactionsService } from '../transactions.service';
import { TransactionType } from '../entities/transaction.entity';
import { User } from '../../users/entities/user.entity';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: TransactionsService;

  const userId = 'user-id';
  const transactionId = 'transaction-id';
  const categoryId = 'category-id';

  // Mock do usuário completo
  const mockUser: User = {
    id: userId,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed_password',
    createdAt: new Date(),
    updatedAt: new Date(),
    categories: [],
    transactions: []
  };

  const mockTransaction = {
    id: transactionId,
    title: 'Test Transaction',
    amount: 100,
    type: TransactionType.INCOME,
    date: new Date('2025-05-10'),
    userId,
    categoryId,
    category: {
      id: categoryId,
      name: 'Test Category',
      userId,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTransactionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get<TransactionsService>(TransactionsService);
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
      mockTransactionsService.create.mockResolvedValue({
        id: transactionId,
        ...createTransactionDto,
        userId,
      });

      // Act
      const result = await controller.create(createTransactionDto, mockUser);

      // Assert
      expect(mockTransactionsService.create).toHaveBeenCalledWith(
        createTransactionDto,
        userId,
      );
      expect(result).toHaveProperty('id', transactionId);
    });
  });

  describe('findAll', () => {
    it('should return all transactions for a user', async () => {
      // Arrange
      mockTransactionsService.findAll.mockResolvedValue([mockTransaction]);

      // Act
      const result = await controller.findAll(mockUser);

      // Assert
      expect(mockTransactionsService.findAll).toHaveBeenCalledWith(userId, {});
      expect(result).toEqual([mockTransaction]);
    });

    it('should pass query parameters to the service', async () => {
      // Arrange
      mockTransactionsService.findAll.mockResolvedValue([mockTransaction]);

      // Act - usando os tipos corretos para page e pageSize (number)
      await controller.findAll(
        mockUser,
        categoryId,
        'RECEITA',
        '2025-05-01',
        '2025-05-31',
        2,  // page como number
        10  // pageSize como number
      );

      // Assert
      expect(mockTransactionsService.findAll).toHaveBeenCalledWith(userId, {
        categoryId,
        type: 'RECEITA',
        startDate: '2025-05-01',
        endDate: '2025-05-31',
        page: 2,
        pageSize: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', async () => {
      // Arrange
      mockTransactionsService.findOne.mockResolvedValue(mockTransaction);

      // Act
      const result = await controller.findOne(transactionId, mockUser);

      // Assert
      expect(mockTransactionsService.findOne).toHaveBeenCalledWith(
        transactionId,
        userId,
      );
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('update', () => {
    it('should update a transaction', async () => {
      // Arrange
      const updateTransactionDto = { title: 'Updated Transaction' };
      mockTransactionsService.update.mockResolvedValue({
        ...mockTransaction,
        ...updateTransactionDto,
      });

      // Act
      const result = await controller.update(
        transactionId,
        updateTransactionDto,
        mockUser
      );

      // Assert
      expect(mockTransactionsService.update).toHaveBeenCalledWith(
        transactionId,
        updateTransactionDto,
        userId,
      );
      expect(result).toHaveProperty('title', 'Updated Transaction');
    });
  });

  describe('remove', () => {
    it('should remove a transaction', async () => {
      // Arrange
      const successMessage = { message: 'Lançamento removido com sucesso' };
      mockTransactionsService.remove.mockResolvedValue(successMessage);

      // Act
      const result = await controller.remove(transactionId, mockUser);

      // Assert
      expect(mockTransactionsService.remove).toHaveBeenCalledWith(
        transactionId,
        userId,
      );
      expect(result).toEqual(successMessage);
    });
  });
}); 