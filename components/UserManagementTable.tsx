'use client'

import { updateUserStatus, deleteUser } from "@/app/actions"
import { startTransition, useOptimistic, useState } from "react"
import { Check, X, Trash2, Clock } from "lucide-react"

type User = {
    id: string
    name: string | null
    email: string
    role: 'ADMIN' | 'USER'
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    createdAt: Date | string
    updatedAt: Date | string
}

export default function UserManagementTable({ users }: { users: User[] }) {
    const [optimisticUsers, addOptimisticUser] = useOptimistic(
        users,
        (state: User[], updatedUser: User) => {
            return state.map((user) => (user.id === updatedUser.id ? updatedUser : user))
        }
    )

    async function handleStatusUpdate(userId: string, newStatus: 'APPROVED' | 'REJECTED') {
        // Optimistic update
        const user = users.find(u => u.id === userId)
        if (user) {
            startTransition(() => {
                addOptimisticUser({ ...user, status: newStatus })
            })
        }

        try {
            const result = await updateUserStatus(userId, newStatus)
            if (result && 'error' in result) {
                alert(`Error: ${result.error}`)
            }
        } catch (e) {
            console.error("Action failed:", e)
            alert("Failed to update status. Please try again.")
        }
    }

    async function handleDelete(userId: string) {
        if (!confirm('Are you sure you want to delete this user?')) return
        try {
            const result = await deleteUser(userId)
            if (result && 'error' in result) {
                alert(`Error: ${result.error}`)
            }
        } catch (e) {
            console.error("Delete action failed:", e)
            alert("Failed to delete user.")
        }
    }

    return (
        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-900 border-b border-gray-700 text-gray-400 text-sm uppercase">
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {optimisticUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-750 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-white">{user.name || 'No Name'}</div>
                                    <div className="text-sm text-gray-400">{user.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                        ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={user.status} />
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {user.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(user.id, 'APPROVED')}
                                                className="inline-flex p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
                                                title="Approve"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(user.id, 'REJECTED')}
                                                className="inline-flex p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                                                title="Reject"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                    {user.status === 'REJECTED' && (
                                        <button
                                            onClick={() => handleStatusUpdate(user.id, 'APPROVED')}
                                            className="inline-flex p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
                                            title="Re-Approve"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="inline-flex p-2 bg-gray-700 text-gray-400 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors ml-2"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {optimisticUsers.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'APPROVED':
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                    <Check className="w-3 h-3 mr-1" />
                    Active
                </span>
            )
        case 'PENDING':
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                </span>
            )
        case 'REJECTED':
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                    <X className="w-3 h-3 mr-1" />
                    Rejected
                </span>
            )
        default:
            return null
    }
}
