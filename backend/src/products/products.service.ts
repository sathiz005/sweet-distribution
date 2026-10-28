import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
@Injectable()
export class ProductsService {
  constructor(private db: PrismaService) {}
  list() {
    return this.db.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
  }
  create(data: any) {
    return this.db.product.create({
      data: {
        name: data.name,
        packLabel: data.packLabel,
        price: Number(data.price),
        type: data.type === "COMBO" ? "COMBO" : "SWEET",
        components: data.components || undefined,
      },
    });
  }
  update(id: string, data: any) {
    return this.db.product.update({
      where: { id },
      data: {
        name: data.name,
        packLabel: data.packLabel,
        price: Number(data.price),
        type: data.type === "COMBO" ? "COMBO" : "SWEET",
        components: data.components || undefined,
      },
    });
  }
  remove(id: string) {
    return this.db.product.update({ where: { id }, data: { active: false } });
  }
}
