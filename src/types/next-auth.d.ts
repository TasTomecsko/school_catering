import { Role } from "@/generated/prisma";
import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: number;
            //name: string; TODO: DELETE IF NOT NEEDED
            role: Role;
        }
    }

    interface User {
        id: number;
        role: Role;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: number;
        role: Role;
    }
}