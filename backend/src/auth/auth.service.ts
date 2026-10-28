import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService) {}

  async login(username: string, password: string) {
    const valid =
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD;

    if (!valid) {
      throw new UnauthorizedException("Invalid username or password");
    }

    return {
      token: this.jwt.sign({ role: "admin", username }),
      expiresIn: "8h",
    };
  }

  verify(header?: string) {
    try {
      const token = header?.replace("Bearer ", "");
      if (!token || this.jwt.verify(token).role !== "admin") throw new Error();
    } catch {
      throw new UnauthorizedException("Administrator login required");
    }
  }
}
