import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { compare, hash } from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(payload: SignupDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existing) {
      throw new UnauthorizedException('User already exists');
    }

    const passwordHash = await hash(payload.password, 10);
    const user = await this.prisma.user.create({
      data: { email: payload.email, passwordHash, lastLoginAt: new Date() },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.issueToken(user.id, user.email);
  }

  async login(payload: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await compare(payload.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.issueToken(user.id, user.email);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }
    return { id: user.id, email: user.email };
  }

  private issueToken(userId: string, email: string) {
    return this.jwtService.sign({ sub: userId, email }, { expiresIn: '7d' });
  }
}
