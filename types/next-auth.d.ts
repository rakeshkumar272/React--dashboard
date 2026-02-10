import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"
import { Role, Status } from "@prisma/client"

declare module "next-auth" {
    interface Session {
        user: {
            role: Role
            status: Status
        } & DefaultSession["user"]
    }

    interface User {
        role: Role
        status: Status
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: Role
        status: Status
    }
}
