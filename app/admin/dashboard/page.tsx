import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import UserManagementTable from "@/components/UserManagementTable"
import { LogOut } from "lucide-react"
import { logout } from "@/app/actions"

export default async function AdminDashboard() {
    const session = await auth()

    // Verify role just in case middleware fails or direct access
    if (session?.user?.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
    })

    const serializedUsers = users.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    }))

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-gray-400 mt-2">Manage user access and approvals.</p>
                    </div>

                    <form action={async () => {
                        'use server'
                        await logout()
                    }}>
                        <button type="submit" className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-700 transition-colors">
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </form>
                </header>

                <main>
                    <UserManagementTable users={serializedUsers} />
                </main>
            </div>
        </div>
    )
}
