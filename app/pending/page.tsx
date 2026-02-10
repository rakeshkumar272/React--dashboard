import { logout } from "@/app/actions"
import { ShieldAlert } from "lucide-react"

export default function PendingPage() {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-800 p-8 rounded-2xl shadow-xl text-center border border-gray-700">
                <div className="w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Account Pending Approval</h1>
                <p className="text-gray-400 mb-8">
                    Your account is currently under review by an admnistrator.
                    You will gain access to the dashboard once approved.
                </p>
                <form action={async () => {
                    'use server'
                    await logout()
                }}>
                    <button type="submit" className="text-indigo-400 hover:text-indigo-300 font-medium">
                        Sign out and try again later
                    </button>
                </form>
            </div>
        </div>
    )
}
