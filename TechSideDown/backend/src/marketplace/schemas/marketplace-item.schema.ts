import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type MarketplaceItemDocument = MarketplaceItem & Document;

@Schema({ timestamps: true })
export class MarketplaceItem {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true, enum: ['auction', 'sale'] })
    type: string;

    @Prop()
    price: number; // For sale items

    @Prop()
    startingBid: number; // For auction items

    @Prop({ default: 0 })
    currentBid: number; // For auction items

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    highestBidder: User;

    @Prop()
    endTime: Date;

    @Prop({ required: true, enum: ['active', 'sold', 'expired'], default: 'active' })
    status: string;

    @Prop()
    image: string;
}

export const MarketplaceItemSchema = SchemaFactory.createForClass(MarketplaceItem);
