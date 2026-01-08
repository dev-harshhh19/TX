import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { CreateItemDto, PlaceBidDto } from './dto/create-item.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('marketplace')
export class MarketplaceController {
    constructor(private readonly marketplaceService: MarketplaceService) { }

    @Get()
    findAll() {
        return this.marketplaceService.findAll();
    }

    @Post()
    // @UseGuards(AuthGuard('jwt')) // Admin only realistically, but for now open
    create(@Body() createItemDto: CreateItemDto) {
        return this.marketplaceService.create(createItemDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/bid')
    placeBid(@Param('id') id: string, @Body() placeBidDto: PlaceBidDto, @Request() req) {
        return this.marketplaceService.placeBid(id, req.user.userId, placeBidDto.amount);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/buy')
    buyItem(@Param('id') id: string, @Request() req) {
        return this.marketplaceService.buyItem(id, req.user.userId);
    }
}
