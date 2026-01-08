import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceItem, MarketplaceItemSchema } from './schemas/marketplace-item.schema';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: MarketplaceItem.name, schema: MarketplaceItemSchema }]),
        UsersModule,
    ],
    controllers: [MarketplaceController],
    providers: [MarketplaceService],
})
export class MarketplaceModule { }
