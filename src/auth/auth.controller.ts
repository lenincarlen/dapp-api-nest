import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './guard/auth.guard';
import { Public } from './decorators/auth.decorator';
import { LoginDto } from './dto/login.dto';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guard/roles.guard';
import { UserActiveInterface } from '../common/interfaces/user-active.interface';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { RegisterDto } from './dto/register.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

interface RequestWithUser extends Request {
  user: {
    email: string;
    role: string;
  };
}

@Controller('auth')
  @ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')

  register(
    @Body()
    registerDto: RegisterDto,
  ) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  signIn(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Get('profile')
  getProfile(@Request() req, @ActiveUser() user: UserActiveInterface) {
    return this.authService.profile(user.id);
  }
}
