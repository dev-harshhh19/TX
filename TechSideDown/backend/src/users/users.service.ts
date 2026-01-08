import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
        const createdUser = new this.userModel({
            ...createUserDto,
            password: hashedPassword,
        });
        return createdUser.save();
    }

    async findOne(username: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ username }).exec();
    }

    async findOneByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec();
    }

    async addEventToUser(userId: string, eventId: string): Promise<User | null> {
        return this.userModel
            .findByIdAndUpdate(
                userId,
                { $addToSet: { registeredEvents: new Types.ObjectId(eventId) } },
                { new: true },
            )
            .exec();
    }

    async findByEvent(eventId: string): Promise<User[]> {
        return this.userModel.find({ registeredEvents: new Types.ObjectId(eventId) }).exec();
    }

    async updatePoints(userId: string, points: number): Promise<User | null> {
        return this.userModel.findByIdAndUpdate(
            userId,
            { $inc: { points: points } },
            { new: true }
        ).exec();
    }

    async findAll(): Promise<User[]> {
        return this.userModel.find().select('-password').exec();
    }
}
