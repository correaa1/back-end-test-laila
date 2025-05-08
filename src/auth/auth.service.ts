import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    // Verificar se já existe um usuário com o mesmo email
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    
    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }
    
    // Criar o novo usuário
    const user = await this.usersService.create(createUserDto);
    
    // Gerar token JWT
    const accessToken = this.generateToken(user);
    
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
    };
  }

  async login(loginDto: LoginDto) {
    // Validar credenciais do usuário
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    
    // Gerar token JWT
    const accessToken = this.generateToken(user);
    
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
    };
  }

  async validateUser(email: string, password: string) {
    // Buscar usuário pelo email
    const user = await this.usersService.findByEmail(email);
    
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    
    return null;
  }

  private generateToken(user: any): string {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    
    // Definir expiração do token para 24 horas (em segundos)
    const expiresIn = 86400;
    
    // Retorna apenas o token, sem informações adicionais
    return this.jwtService.sign(payload, { expiresIn });
  }
} 