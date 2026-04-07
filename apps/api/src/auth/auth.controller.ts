import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthJwtPayload } from './jwt.strategy';

const COOKIE_NAME = 'auth_token';
const COOKIE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async signup(
    @Body() payload: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.signup(payload);
    this.setCookie(res, token);
    return { ok: true };
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async login(
    @Body() payload: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.login(payload);
    this.setCookie(res, token);
    return { ok: true };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
    });
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request & { user: AuthJwtPayload }) {
    return this.authService.me(req.user.sub);
  }

  private setCookie(res: Response, token: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: COOKIE_TTL_MS,
    });
  }
}
