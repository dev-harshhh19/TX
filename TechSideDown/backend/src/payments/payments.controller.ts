import { Controller, Post, Body, Request, UseGuards, Get, Patch, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';
import { CreatePaymentOrderDto, VerifyPaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('create-order')
    async createOrder(@Request() req, @Body() createPaymentDto: CreatePaymentOrderDto) {
        return this.paymentsService.createOrder(req.user.userId, createPaymentDto.eventId, createPaymentDto.amount);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('verify')
    async verifyPayment(@Request() req, @Body() verifyPaymentDto: VerifyPaymentDto) {
        return this.paymentsService.verifyPayment(req.user.userId, verifyPaymentDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async findAll() {
        return this.paymentsService.findAll();
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.paymentsService.updateStatus(id, status);
    }
}
