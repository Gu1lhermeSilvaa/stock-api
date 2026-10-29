import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { LoginDto } from './login.dto';
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {}
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user || !user.active || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException('E-mail ou senha inválidos.');
    const access_token = await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role }, { expiresIn: (this.config.get<string>('JWT_EXPIRES_IN') ?? '1h') as any });
    return { access_token, token_type: 'Bearer', expires_in: this.config.get<string>('JWT_EXPIRES_IN') ?? '1h', user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }
}
