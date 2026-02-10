'use client'

import { useState } from 'react'
import { authenticate } from '@/app/lib/actions'
import { register } from '@/app/actions'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'

export default function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const router = useRouter()

    async function handleRegister(formData: FormData) {
        setSuccess(null)
        setError(null)
        const res = await register(formData)
        if (res?.error) {
            setError(res.error)
        } else if (res?.success) {
            setSuccess(res.success)
            // Ideally switch to login mode or auto login
            setIsLogin(true)
        }
    }

    async function handleLogin(formData: FormData) {
        setError(null)
        try {
            await authenticate(undefined, formData)
            // NextAuth redirects automatically on success, usually to '/' or callbackUrl
        } catch (e) {
            setError('Invalid credentials')
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-900 text-white">
            {/* Left side - Welcome / Branding */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 items-center justify-center p-12">
                <div className="max-w-md text-center">
                    <h1 className="text-4xl font-extrabold mb-6">Welcome to Dashboard</h1>
                    <p className="text-lg text-indigo-100 mb-8">
                        Secure role-based access control with seamless approval workflows.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 text-indigo-200">
                            <span className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                            <span>Register as Admin or User</span>
                        </div>
                        <div className="flex items-center space-x-3 text-indigo-200">
                            <span className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                            <span>Wait for approval (User)</span>
                        </div>
                        <div className="flex items-center space-x-3 text-indigo-200">
                            <span className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                            <span>Access your dashboard</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </h2>
                        <p className="text-gray-400">
                            {isLogin ? 'Access your dashboard' : 'Get started with us'}
                        </p>
                    </div>

                    {/* Toggle Login/Register */}
                    <div className="flex bg-gray-700 p-1 rounded-lg mb-8">
                        <button
                            onClick={() => { setIsLogin(true); setError(null); setSuccess(null); }}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${isLogin ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setError(null); setSuccess(null); }}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${!isLogin ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                            Register
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg mb-6 text-sm">
                            {success}
                        </div>
                    )}

                    <form action={isLogin ? handleLogin : handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        {!isLogin && (
                            <div className="flex items-center space-x-2 mt-2">
                                <input type="hidden" name="role" value={isAdmin ? 'ADMIN' : 'USER'} />
                                <input
                                    type="checkbox"
                                    id="admin-check"
                                    checked={isAdmin}
                                    onChange={(e) => setIsAdmin(e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor="admin-check" className="text-sm text-gray-300 select-none">Register as Admin?</label>
                            </div>
                        )}
                        {/* Hidden input for role if unchecked, default USER is handled by checkbox value absence? No. 
                            If checkbox is unchecked, value isn't sent. Server default is USER. 
                            If checked, value is sent as ADMIN. Correct.
                        */}

                        <SubmitButton isLogin={isLogin} />
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-400">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                            {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function SubmitButton({ isLogin }: { isLogin: boolean }) {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
            {pending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                isLogin ? 'Sign In' : 'Create Account'
            )}
        </button>
    )
}
