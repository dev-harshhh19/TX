import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Razorpay = require('razorpay');
import * as crypto from 'crypto';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class PaymentsService {
    private razorpayInstance: Razorpay;

    constructor(
        @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
        private configService: ConfigService,
        private usersService: UsersService,
        private transactionsService: TransactionsService,
    ) {
        this.razorpayInstance = new Razorpay({
            key_id: this.configService.get<string>('RAZORPAY_KEY_ID') || 'YOUR_KEY_ID',
            key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET') || 'YOUR_KEY_SECRET',
        });
    }

    async createOrder(userId: string, eventId: string, amount: number) {
        const options = {
            amount: amount * 100, // amount in the smallest currency unit
            currency: 'INR',
            receipt: `receipt_order_${Date.now()}`,
        };

        try {
            const order = await this.razorpayInstance.orders.create(options);

            const newPayment = new this.paymentModel({
                razorpayOrderId: order.id,
                amount: amount,
                currency: 'INR',
                status: 'pending',
                userId,
                eventId,
            });
            await newPayment.save();

            await this.transactionsService.create(userId, 'PAYMENT', 'INITIATED', { orderId: order.id, amount, eventId });

            return order;
        } catch (error) {
            await this.transactionsService.create(userId, 'PAYMENT', 'INITIATION_FAILED', { error: error.message, eventId }, 'FAILED');
            throw new BadRequestException('Could not create Razorpay order');
        }
    }

    async verifyPayment(userId: string, verifyPaymentDto: any) {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, eventId } = verifyPaymentDto;

        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', this.configService.get<string>('RAZORPAY_KEY_SECRET') || 'YOUR_KEY_SECRET')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpaySignature) {
            // Update payment status
            await this.paymentModel.findOneAndUpdate(
                { razorpayOrderId: razorpayOrderId },
                {
                    razorpayPaymentId,
                    razorpaySignature,
                    status: 'success'
                }
            );

            // Register user for event
            await this.usersService.addEventToUser(userId, eventId);

            await this.transactionsService.create(userId, 'PAYMENT', 'SUCCESS', { razorpayPaymentId, eventId, amount: 0 }); // Fetch amount if needed
            await this.transactionsService.create(userId, 'EVENT', 'REGISTERED', { eventId, paymentId: razorpayPaymentId });

            return { status: 'success', message: 'Payment verified and User registered' };
        } else {
            await this.paymentModel.findOneAndUpdate(
                { razorpayOrderId: razorpayOrderId },
                { status: 'failed' }
            );
            await this.transactionsService.create(userId, 'PAYMENT', 'FAILED', { razorpayOrderId, reason: 'Invalid Signature' }, 'FAILED');
            throw new BadRequestException('Invalid signature');
        }
    }
    async findAll(): Promise<Payment[]> {
        return this.paymentModel.find().populate('userId').populate('eventId').sort({ createdAt: -1 }).exec();
    }

    async updateStatus(id: string, status: string): Promise<Payment | null> {
        const payment = await this.paymentModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
        if (status === 'success' && payment) {
            await this.usersService.addEventToUser(payment.userId.toString(), payment.eventId.toString());
            await this.transactionsService.create(payment.userId.toString(), 'PAYMENT', 'MANUAL_SUCCESS', { paymentId: payment._id, eventId: payment.eventId });
        }
        return payment;
    }
}
