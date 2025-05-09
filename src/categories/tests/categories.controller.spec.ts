import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from '../categories.controller';
import { CategoriesService } from '../categories.service';
import { User } from '../../users/entities/user.entity';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const userId = 'user-id';
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

  const mockCategory = {
    id: categoryId,
    name: 'Test Category',
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a category', async () => {
      // Arrange
      const createCategoryDto = { name: 'New Category' };
      mockCategoriesService.create.mockResolvedValue({
        id: categoryId,
        ...createCategoryDto,
        userId,
      });

      // Act
      const result = await controller.create(createCategoryDto, mockUser);

      // Assert
      expect(mockCategoriesService.create).toHaveBeenCalledWith(
        createCategoryDto,
        userId,
      );
      expect(result).toHaveProperty('id', categoryId);
    });
  });

  describe('findAll', () => {
    it('should return all categories for a user', async () => {
      // Arrange
      mockCategoriesService.findAll.mockResolvedValue([mockCategory]);

      // Act
      const result = await controller.findAll(mockUser);

      // Assert
      expect(mockCategoriesService.findAll).toHaveBeenCalledWith(userId);
      expect(result).toEqual([mockCategory]);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      // Arrange
      mockCategoriesService.findOne.mockResolvedValue(mockCategory);

      // Act
      const result = await controller.findOne(categoryId, mockUser);

      // Assert
      expect(mockCategoriesService.findOne).toHaveBeenCalledWith(
        categoryId,
        userId,
      );
      expect(result).toEqual(mockCategory);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      // Arrange
      const updateCategoryDto = { name: 'Updated Category' };
      mockCategoriesService.update.mockResolvedValue({
        ...mockCategory,
        ...updateCategoryDto,
      });

      // Act
      const result = await controller.update(
        categoryId,
        updateCategoryDto,
        mockUser
      );

      // Assert
      expect(mockCategoriesService.update).toHaveBeenCalledWith(
        categoryId,
        updateCategoryDto,
        userId,
      );
      expect(result).toHaveProperty('name', 'Updated Category');
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      // Arrange
      const successMessage = { message: 'Categoria removida com sucesso' };
      mockCategoriesService.remove.mockResolvedValue(successMessage);

      // Act
      const result = await controller.remove(categoryId, mockUser);

      // Assert
      expect(mockCategoriesService.remove).toHaveBeenCalledWith(
        categoryId,
        userId,
      );
      expect(result).toEqual(successMessage);
    });
  });
}); 