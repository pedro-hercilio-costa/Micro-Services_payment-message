import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreditCard, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CreditCardService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('NOTIFICATION_SERVICE') private rabbitClient: ClientProxy,
  ) { }

  async create(data: Prisma.CreditCardCreateInput): Promise<CreditCard> {
    const creditCard = await this.prisma.creditCard.create(data);
    this.sendRegisterPaymentNotification(JSON.stringify(creditCard));
    this.processPayment(creditCard);
    return creditCard;
  }

  async processPayment(payment: CreditCard) {
    setTimeout(() => {
      this.sendConfirmationPaymentNotification(JSON.stringify(payment));
    }, 10000);
  }
  sendRegisterPaymentNotification(message: string) {
    try {
      this.rabbitClient.emit('register', {
        id: randomUUID(),
        data: { notification: message },
      });
    } catch (error) {
      console.error(error);
    }
  }

  sendConfirmationPaymentNotification(message: string) {
    try {
      this.rabbitClient.emit('confirmation', {
        id: randomUUID(),
        data: { notification: message },
      });
    } catch (error) {
      console.error(error);
    }
  }
}