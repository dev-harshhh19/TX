import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: 'user' })
    role: string;

    @Prop()
    college: string;

    @Prop({ type: [String], default: [] })
    team: string[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Event' }] })
    registeredEvents: Types.ObjectId[];

    @Prop({ default: 0 })
    points: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
