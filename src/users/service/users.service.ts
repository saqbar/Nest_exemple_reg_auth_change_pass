import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { sanitizeInput } from '../../app/functions/validate-data';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from '../entities/users.entity';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,
  ) {}

  async createUser(body: any) {
    try {
      for (const key in body) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
          body[key] = sanitizeInput(body[key]);
        }
      }
      const findUser = await this.usersRepository.findOne({
        where: { email: body.email || body.login },
      });
      if (findUser) {
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }
      try {
        const res = await this.usersRepository.save({
          login: body.login,
          email: body.email,
          password: await hash(body.password, 10),
          role: 'user',
        });

        const payload = {
          id: res.id,
          login: res.email,
          email: res.email,
          role: body.role,
        };

        return {
          status: 'success',
          access_token: await this.jwtService.signAsync(payload),
          role: res.role,
        };
      } catch (e) {
        throw new HttpException('error to create user', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async login(body: any) {
    try {
      for (const key in body) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
          body[key] = sanitizeInput(body[key]);
        }
      }
      const user = await this.usersRepository.findOne({
        where: { login: body.login },
      });
      if (!user) {
        throw new HttpException(
          'Invalid login or password',
          HttpStatus.BAD_REQUEST,
        );
      }
      const check = await compare(body.password, user.password);
      if (!check) {
        throw new HttpException(
          'Invalid login or password',
          HttpStatus.BAD_REQUEST,
        );
      }
      const payload = {
        id: user.id,
        login: user.login,
        email: user.email,
        role: user.role,
      };
      return {
        status: 'success',
        access_token: await this.jwtService.signAsync(payload),
        role: user.role,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async changePassword(userObj: any, body: any) {
    try {
      for (const key in body) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
          body[key] = sanitizeInput(body[key]);
        }
      }
      const user = await this.usersRepository.findOne({
        where: { id: userObj.id },
      });
      if (
        !user ||
        user.login !== userObj.login ||
        user.email !== userObj.email
      ) {
        throw new HttpException('something went wrong', HttpStatus.BAD_REQUEST);
      }
      const check = await compare(body.password, user.password);
      if (!check) {
        throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
      }
      const hash_new_pass = await hash(body.newPassword, 10);
      await this.usersRepository.update(user.id, {
        password: hash_new_pass,
      });
      return {
        status: 'success',
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
