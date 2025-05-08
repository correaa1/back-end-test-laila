import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'sua_chave_secreta_super_segura',
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const { sub: id } = payload;
      const user = await this.usersService.findById(id);

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      return user;
    } catch (error) {
      console.error('Erro na validação do token JWT:', error.message);
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
} 