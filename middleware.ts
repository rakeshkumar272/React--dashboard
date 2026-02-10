import NextAuth from "next-auth"
import { auth } from "@/auth"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { nextUrl } = req
    const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard')
    const isAdminRoute = nextUrl.pathname.startsWith('/admin')
    const isAuthRoute = nextUrl.pathname === '/' // Assuming unified login page

    if (isAuthRoute) {
        if (isLoggedIn) {
            if (req.auth?.user.role === 'ADMIN') {
                return Response.redirect(new URL('/admin/dashboard', nextUrl))
            }
            // Check status but let them proceed to dashboard to see "Pending" screen if needed?
            // Requirement says: "If not approved, show 'Waiting for Approval' screen."
            // So redirect to dashboard is fine, dashboard logic handles it.
            return Response.redirect(new URL('/dashboard', nextUrl))
        }
        return // Allow access to login page
    }

    if (!isLoggedIn && (isDashboardRoute || isAdminRoute)) {
        return Response.redirect(new URL('/', nextUrl))
    }

    if (isAdminRoute && req.auth?.user.role !== 'ADMIN') {
        return Response.redirect(new URL('/dashboard', nextUrl))
    }

    // Dashboard check: "restricted to status: 'APPROVED'"?
    // Requirement text says: "Dashboard must feature a 'User Management' table... User Path: If not approved, show 'Waiting for Approval' screen."
    // If I block dashboard access entirely for pending users, where do I show the "Waiting" screen?
    // Let's assume /dashboard is accessible but renders different content based on status.
    // However, user specifically said: "/dashboard/* should be restricted to status: 'APPROVED'".
    // This implies creating a separate route for pending? Or maybe checking status inside handler?
    // If I redirect pending users away from /dashboard to /pending-approval, that's cleaner.

    // Let's check requirement: "User Path: Register -> Login -> If not approved, show a 'Waiting for Approval' screen."
    // If I restrict /dashboard to approved, then pending users need somewhere else to go.
    // I will modify plan slightly: Redirect Pending to /pending-approval.
    // Or simpler: /dashboard checks status and shows <PendingScreen /> if not approved.
    // But middleware restriction is usually better for security.

    // Let's stick to simple dashboard component check for now as it's more flexible for UI.
    // But requirement says "Middleware to protect routes... /dashboard/* restricted to approved".
    // I'll add logic: if pending, redirect to /pending or show different page. Next.js middleware limited capability to render.
    // So redirect logic is best.

    // I'll update middleware to:
    // If visiting /dashboard/* and status !== APPROVED -> Redirect to /waiting-approval
    // If visiting /waiting-approval and status === APPROVED -> Redirect to /dashboard

    // Wait, let's keep it simple. Let dashboard handle it for now to avoid redirect loops, OR create specific route.
    // I'll implementing the dashboard page to handle the "Pending" state, effectively "rendering" the pending screen.
    // The middleware restriction might be interpreted as "data access" restriction.
    // I'll leave strictly blocking middleware for now unless user insists.
    // Actually, user explicitly said: "/dashboard/* should be restricted to status: 'APPROVED'".
    // So I MUST restrict it.
    // Where do pending users go?
    // I'll create a `/status` or `/pending` page.

    if (isDashboardRoute && req.auth?.user.role !== 'ADMIN' && req.auth?.user.status !== 'APPROVED') {
        // Redirect to a dedicated status page if needed, or maybe just let them see a specific "not approved" page.
        // But if /dashboard is restricted, I can't show it there.
        // I'll redirect to /pending.
        return Response.redirect(new URL('/pending', nextUrl))
    }

    return
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
