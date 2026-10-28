import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { OrdersService } from "./orders.service";
@Controller("orders")
export class OrdersController {
  constructor(
    private orders: OrdersService,
    private auth: AuthService,
  ) {}
  @Get() list() {
    return this.orders.list();
  }
  @Post() create(@Body() body: any, @Headers("authorization") header?: string) {
    this.auth.verify(header);
    return this.orders.create(body);
  }
  @Patch(":id") update(
    @Param("id") id: string,
    @Body() body: any,
    @Headers("authorization") header?: string,
  ) {
    this.auth.verify(header);
    return this.orders.update(id, body);
  }
  @Patch(":id/delivery") delivery(
    @Body() body: { items: { id: string; delivered: number }[] },
    @Headers("authorization") header?: string,
  ) {
    this.auth.verify(header);
    return this.orders.updateDelivery(body.items);
  }
  @Post(":id/payments") payment(
    @Param("id") id: string,
    @Body() body: { amount: number },
    @Headers("authorization") header?: string,
  ) {
    this.auth.verify(header);
    return this.orders.addPayment(id, body.amount);
  }
  @Delete(":id") remove(
    @Param("id") id: string,
    @Headers("authorization") header?: string,
  ) {
    this.auth.verify(header);
    return this.orders.remove(id);
  }
}
