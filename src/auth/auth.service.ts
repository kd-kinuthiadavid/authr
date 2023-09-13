import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string) {
    const user = await this.usersService.findByEmail(email);
    return user;
  }

  async validateUserByUsername(username: string, password: string) {
    const users = await this.usersService.findByUsername(username);

    if (!users[0]) {
      this.logger.error(
        `couldn't find a user with the provided username and password`,
        'validateUserByUsername',
      );
      throw new NotFoundException('User Does Not Exist', {
        cause: new Error(),
        description: `couldn't find a user with the provided username and password`,
      });
    }

    const user = users[0];
    if (user.password) {
      const doesPasswordMatch = await this.usersService.comparePasswords(
        password,
        user.password,
      );

      if (doesPasswordMatch === false) {
        this.logger.error("Passwords don't match ");
        throw new BadRequestException('Invalid Password', {
          cause: new Error(),
          description: 'Passwords do not match',
        });
      }

      return user;
    }
    return user;
  }

  async generateToken(username: string, email: string) {
    return {
      access_token: this.jwtService.sign({ username, email }),
    };
  }
}
