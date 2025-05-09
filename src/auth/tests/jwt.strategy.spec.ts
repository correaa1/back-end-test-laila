import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { UsersService } from '../../users/users.service';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let usersService: UsersService;

  const mockUser = {
    id: 'test-id',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed_password',
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return user when JWT payload is valid', async () => {
      // Arrange
      const payload = { sub: 'test-id', email: 'test@example.com' };
      mockUsersService.findById.mockResolvedValue(mockUser);

      // Act
      const result = await jwtStrategy.validate(payload);

      // Assert
      expect(mockUsersService.findById).toHaveBeenCalledWith(payload.sub);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      const payload = { sub: 'nonexistent-id', email: 'test@example.com' };
      mockUsersService.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(jwtStrategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUsersService.findById).toHaveBeenCalledWith(payload.sub);
    });

    it('should throw UnauthorizedException when service throws error', async () => {
      // Arrange
      const payload = { sub: 'test-id', email: 'test@example.com' };
      mockUsersService.findById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(jwtStrategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUsersService.findById).toHaveBeenCalledWith(payload.sub);
    });
  });
}); 