'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['ADMIN', 'USER']).default('USER'),
})

export async function register(formData: FormData) {
    const validatedFields = RegisterSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role'),
    })

    if (!validatedFields.success) {
        return { error: 'Invalid fields' }
    }

    const { email, password, role } = validatedFields.data
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return { error: 'Email already in use' }
        }

        const status = role === 'ADMIN' ? 'APPROVED' : 'PENDING'

        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
                status,
            },
        })

        return { success: 'User created!' }
    } catch (error) {
        return { error: 'Something went wrong!' }
    }
}

export async function toggleUserStatus(userId: string, currentStatus: string) {
    // Only verify admin status if using Auth guard in component or middleware, 
    // but good to check here too if possible, though 'auth()' call might be tricky in server action if not careful.
    // For now assuming the caller is authorized. Best practice is to check auth() here.

    const session = await (await import("@/auth")).auth()

    if (session?.user?.role !== 'ADMIN') {
        return { error: "Unauthorized" }
    }

    const newStatus = currentStatus === 'PENDING' ? 'APPROVED' : 'PENDING' // Simple toggle for now, or explicit set?
    // Requirement says: "Approve/Reject". So maybe explicit actions.
    // But "toggleUserStatus" was in prompt.
    // Let's make it flexible or specific.
    // I'll implement `updateStatus` instead.
    return { error: "Use specific status update" }
}

export async function updateUserStatus(userId: string, newStatus: 'APPROVED' | 'REJECTED' | 'PENDING') {
    const session = await (await import("@/auth")).auth()
    if (session?.user?.role !== 'ADMIN') {
        console.error("Update status failed: Unauthorized")
        return { error: "Unauthorized" }
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { status: newStatus },
        })
        revalidatePath('/admin/dashboard')
        console.log(`User ${userId} status updated to ${newStatus}`)
        return { success: `User ${newStatus.toLowerCase()}!` }
    } catch (error) {
        console.error("Update status failed:", error)
        return { error: "Failed to update status" }
    }
}

export async function deleteUser(userId: string) {
    const session = await (await import("@/auth")).auth()
    if (session?.user?.role !== 'ADMIN') {
        console.error("Delete failed: Unauthorized")
        return { error: "Unauthorized" }
    }

    try {
        await prisma.user.delete({
            where: { id: userId },
        })
        revalidatePath('/admin/dashboard')
        console.log(`User ${userId} deleted successfully`)
        return { success: "User deleted" }
    } catch (error) {
        console.error("Delete failed:", error)
        return { error: "Failed to delete user" }
    }
}

export async function logout() {
    const { signOut } = await import("@/auth")
    await signOut({ redirectTo: '/' })
}
