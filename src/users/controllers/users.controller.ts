import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post, Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../service/users.service';
import {
  ChangePasswordDto,
  CreateUserDto,
  LoginUserDto,
} from '../dto/user.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersGuard } from '../guards/user.guard';
import {
  validateChangePassword,
  validateLogin,
  validateRegister,
} from '../../app/functions/validate-data';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create user' })
  @Post('create_user')
  async createUser(@Body() body: CreateUserDto, @Res() res) {
    try {
      validateRegister(body);
      body.email.trim().toLowerCase();

      const result = await this.usersService.createUser(body);
      if (result) {
        return res.status(HttpStatus.OK).json(result);
        // return res.status(HttpStatus.OK).json('User created');
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOperation({ summary: 'Login user' })
  @Post('login')
  async login(@Body() body: LoginUserDto, @Res() res) {
    try {
      validateLogin(body);
      const result = await this.usersService.login(body);
      if (result) {
        return res.status(HttpStatus.OK).json(result);
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(UsersGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  @Post('change_password')
  async changePassword(
    @Req() req,
    @Body() body: ChangePasswordDto,
    @Res() res,
  ) {
    try {
      validateChangePassword(body);
      const result = await this.usersService.changePassword(req.user, body);
      if (result) {
        return res.status(HttpStatus.OK).json(result);
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
