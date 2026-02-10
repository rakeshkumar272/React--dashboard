import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { LogOut, LayoutDashboard, FileText, Settings, ShieldAlert } from "lucide-react"
import { logout } from "@/app/actions"

export default async function Dashboard() {
    const session = await auth()

    // Redirect if not logged in
    if (!session?.user) {
        redirect('/')
    }

    const { user } = session

    // Redirect Admin to admin dashboard (optional, but good UX)
    if (user.role === 'ADMIN') {
        redirect('/admin/dashboard')
    }

    if (user.status !== 'APPROVED') {
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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 flex flex-col">
                <div className="mb-8">
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">MyApp</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 font-medium">
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Overview</span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                        <FileText className="w-5 h-5" />
                        <span>Documents</span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
                    </a>
                </nav>

                <div className="pt-8 border-t border-gray-100 dark:border-gray-700 mt-auto">
                    <div className="flex items-center space-x-3 mb-6 px-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user.name || 'User'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                    </div>

                    <form action={async () => {
                        'use server'
                        await logout()
                    }}>
                        <button type="submit" className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg dark:hover:bg-gray-700 transition-colors">
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold">Welcome back!</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Here is what is happening with your account.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-4">Account Status</h3>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-green-500">Active</span>
                            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                                <Check className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-4">Member Since</h3>
                        <div className="flex items-center justify-between">
                            {/* Assuming user.createdAt relies on DB fetch but session might not have it unless added to Token. 
                                For now, simplified UI. 
                            */}
                            <span className="text-xl font-bold">Recently</span>
                            <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-100 dark:border-gray-700 text-center">
                    <div className="max-w-md mx-auto">
                        <h3 className="text-xl font-bold mb-4">Your dashboard is ready 🚀</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            This is a protected area. Only approved users can see this content.
                        </p>
                        <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                            Explore Features
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Check({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12" /></svg>
    )
}

function Clock({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    )
}
