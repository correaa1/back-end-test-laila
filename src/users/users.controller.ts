import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile() {
    return { message: 'Perfil do usuário será implementado' };
  }
} 