import type { PayloadType } from "../utils/generateToken.ts";

declare global {
    namespace Express {
        interface Request {
            user: PayloadType
        }
    }
}