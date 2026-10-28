import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
@Injectable()
export class OrdersService {
  constructor(private db: PrismaService) {}
  list() {
    return this.db.order.findMany({
      include: { items: { include: { product: true } }, payments: true },
      orderBy: { createdAt: "desc" },
    });
  }
  create(data: any) {
    return this.db.order.create({
      data: {
        customerName: data.customerName,
        companyName: data.companyName,
        notes: data.notes,
        orderDate: new Date(data.orderDate),
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
          })),
        },
      },
      include: { items: { include: { product: true } }, payments: true },
    });
  }
  update(id: string, data: any) {
    return this.db.order.update({
      where: { id },
      data: {
        customerName: data.customerName,
        companyName: data.companyName,
        notes: data.notes,
        orderDate: data.orderDate ? new Date(data.orderDate) : undefined,
      },
    });
  }
  updateDelivery(items: { id: string; delivered: number }[]) {
    return this.db.$transaction(
      items.map((item) =>
        this.db.orderItem.update({
          where: { id: item.id },
          data: { delivered: Number(item.delivered) },
        }),
      ),
    );
  }
  addPayment(orderId: string, amount: number) {
    return this.db.payment.create({
      data: { orderId, amount: Number(amount) },
    });
  }
  remove(id: string) {
    return this.db.order.delete({ where: { id } });
  }
}
