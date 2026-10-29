import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';
@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}
  @Post('login') @ApiOperation({ summary: 'Autenticar e receber JWT' }) login(@Body() dto: LoginDto) { return this.auth.login(dto); }
}
