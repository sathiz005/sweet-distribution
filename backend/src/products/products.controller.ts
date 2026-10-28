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
import { ProductsService } from "./products.service";
@Controller("products")
export class ProductsController {
  constructor(
    private products: ProductsService,
    private auth: AuthService,
  ) {}
  @Get() list() {
    return this.products.list();
  }
  @Post() create(@Body() body: any, @Headers("authorization") header?: string) {
    this.auth.verify(header);
    return this.products.create(body);
  }
  @Patch(":id") update(
    @Param("id") id: string,
    @Body() body: any,
    @Headers("authorization") header?: string,
  ) {
    this.auth.verify(header);
    return this.products.update(id, body);
  }
  @Delete(":id") remove(
    @Param("id") id: string,
    @Headers("authorization") header?: string,
  ) {
    this.auth.verify(header);
    return this.products.remove(id);
  }
}
