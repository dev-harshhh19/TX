import { IsString, IsEnum, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateItemDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsEnum(['auction', 'sale'])
    type: string;

    @IsOptional()
    @IsNumber()
    price?: number;

    @IsOptional()
    @IsNumber()
    startingBid?: number;

    @IsOptional()
    @IsDateString()
    endTime?: Date;

    @IsOptional()
    @IsString()
    image?: string;
}

export class PlaceBidDto {
    @IsNumber()
    amount: number;
}
