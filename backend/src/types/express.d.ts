import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface UserTokenPayload extends JwtPayload {
      userId: string;
      role: string;
      email: string;
    }

    interface Request {
      user?: UserTokenPayload;
    }
  }
}

export {};
