import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private transactionsService: TransactionsService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(username);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user.toObject();
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user._id, role: user.role };
        await this.transactionsService.create(user._id, 'USER', 'LOGIN', { username: user.username });
        return {
            access_token: this.jwtService.sign(payload),
            userId: user._id,
            username: user.username,
            role: user.role,
            points: user.points,
        };
    }

    async register(createUserDto: CreateUserDto) {
        const existingUser = await this.usersService.findOne(createUserDto.username);
        if (existingUser) throw new ConflictException('Username already taken');

        const existingEmail = await this.usersService.findOneByEmail(createUserDto.email);
        if (existingEmail) throw new ConflictException('Email already taken');

        const newUser = await this.usersService.create(createUserDto);
        await this.transactionsService.create((newUser as any)._id.toString(), 'USER', 'REGISTER', { email: newUser.email, college: newUser.college });
        return newUser;
    }
}
