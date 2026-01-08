import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MarketplaceItem, MarketplaceItemDocument } from './schemas/marketplace-item.schema';
import { CreateItemDto } from './dto/create-item.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class MarketplaceService {
    constructor(
        @InjectModel(MarketplaceItem.name) private itemModel: Model<MarketplaceItemDocument>,
        private usersService: UsersService,
    ) { }

    async create(createItemDto: CreateItemDto): Promise<MarketplaceItem> {
        const newItem = new this.itemModel(createItemDto);
        if (createItemDto.type === 'auction') {
            newItem.currentBid = createItemDto.startingBid || 0;
        }
        return newItem.save();
    }

    async findAll(): Promise<MarketplaceItem[]> {
        return this.itemModel.find({ status: 'active' }).populate('highestBidder', 'username').exec();
    }

    async findOne(id: string): Promise<MarketplaceItem> {
        const item = await this.itemModel.findById(id).populate('highestBidder', 'username').exec();
        if (!item) throw new NotFoundException('Item not found');
        return item;
    }

    async placeBid(itemId: string, userId: string, amount: number): Promise<MarketplaceItem> {
        const item = await this.itemModel.findById(itemId);
        if (!item) throw new NotFoundException('Item not found');
        if (item.type !== 'auction') throw new BadRequestException('This item is not for auction');
        if (item.status !== 'active') throw new BadRequestException('Auction is not active');
        if (item.endTime && new Date() > item.endTime) throw new BadRequestException('Auction has ended');
        if (amount <= item.currentBid) throw new BadRequestException('Bid must be higher than current bid');

        const user = await this.usersService.findById(userId);
        if (!user) throw new NotFoundException('User not found');
        if ((user.points || 0) < amount) throw new BadRequestException('Insufficient points');

        // Refund previous bidder
        if (item.highestBidder) {
            // We need to fetch the previous bidder's ID. Since it's a ref, logic depends on if populated or not.
            // Mongoose might store it as ObjectId.
            await this.usersService.updatePoints(item.highestBidder.toString(), item.currentBid);
        }

        // Deduct from new bidder
        await this.usersService.updatePoints(userId, -amount);

        // Update item
        item.currentBid = amount;
        item.highestBidder = user;
        return item.save();
    }

    async buyItem(itemId: string, userId: string): Promise<MarketplaceItem> {
        const item = await this.itemModel.findById(itemId);
        if (!item) throw new NotFoundException('Item not found');
        if (item.type !== 'sale') throw new BadRequestException('This item is not for sale');
        if (item.status !== 'active') throw new BadRequestException('Item is not available');

        const user = await this.usersService.findById(userId);
        if (!user) throw new NotFoundException('User not found');
        if ((user.points || 0) < item.price) throw new BadRequestException('Insufficient points');

        // Deduct points
        await this.usersService.updatePoints(userId, -item.price);

        // Update item
        item.status = 'sold';
        item.highestBidder = user; // Mark buyer as highest bidder/owner essentially
        return item.save();
    }
}
