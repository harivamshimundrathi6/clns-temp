import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const userRole = (req.auth?.user as any)?.role?.toLowerCase();

    const isAuthRoute = nextUrl.pathname.startsWith("/api/auth");
    const isAdminRoute = nextUrl.pathname.startsWith("/dashboard/admin");
    const isMaintenanceApi = nextUrl.pathname.startsWith("/api/admin/maintenance");
    const isPublicRoute =
        nextUrl.pathname === "/" ||
        nextUrl.pathname.startsWith("/(marketing)") ||
        nextUrl.pathname === "/login" ||
        nextUrl.pathname === "/signup" ||
        nextUrl.pathname.startsWith("/affiliation") ||
        nextUrl.pathname.startsWith("/services") ||
        nextUrl.pathname.startsWith("/about") ||
        nextUrl.pathname.startsWith("/contact") ||
        nextUrl.pathname.startsWith("/careers");
    const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");

    // Always allow API auth routes and the maintenance API itself
    if (isAuthRoute || isMaintenanceApi) {
        return;
    }

    // Maintenance check removed to prevent Vercel Edge Runtime crashes (MIDDLEWARE_INVOCATION_FAILED)


    if (isDashboardRoute) {
        if (!isLoggedIn) {
            if (nextUrl.pathname.startsWith("/dashboard/developer")) {
                return NextResponse.redirect(new URL("/developer-login", nextUrl));
            }
            return NextResponse.redirect(new URL("/login", nextUrl));
        }

        // Block advocates who are pending verification or rejected
        const userStatus = (req.auth?.user as any)?.status?.toUpperCase();
        if (userStatus === "PENDING_VERIFICATION" || userStatus === "REJECTED") {
            // Allow developer access regardless of status
            const userEmail = (req.auth?.user as any)?.email;
            const developerEmail = process.env.DEVELOPER_EMAIL;
            if (userEmail !== developerEmail) {
                return NextResponse.redirect(new URL("/pending-approval", nextUrl));
            }
        }

        // Role-based access control
        const userEmail = (req.auth?.user as any)?.email;
        const developerEmail = process.env.DEVELOPER_EMAIL; // Set this in .env

        // Redirect /dashboard/admin requests to /dashboard/developer
        if (nextUrl.pathname.startsWith("/dashboard/admin")) {
            if (userRole === "admin" || userEmail === developerEmail) {
                return NextResponse.redirect(new URL("/dashboard/developer", nextUrl));
            }
            return NextResponse.redirect(new URL(`/dashboard/${userRole}`, nextUrl));
        }

        if (nextUrl.pathname.startsWith("/dashboard/developer")) {
            console.log("Middleware Dev Check:", { userEmail, developerEmail, auth: req.auth });
            if (userRole !== "admin" && userEmail !== developerEmail) {
                // If not admin role and not the exact developer email, redirect to signup
                return NextResponse.redirect(new URL("/signup", nextUrl));
            }
            // Developer is allowed to access developer routes
            return; 
        }

        if (nextUrl.pathname.startsWith("/dashboard/advocate") && userRole !== "advocate") {
            return NextResponse.redirect(new URL(`/dashboard/${userRole}`, nextUrl));
        }
        if (nextUrl.pathname.startsWith("/dashboard/client") && userRole !== "client") {
            return NextResponse.redirect(new URL(`/dashboard/${userRole}`, nextUrl));
        }
        if (nextUrl.pathname.startsWith("/dashboard/student") && userRole !== "student") {
            return NextResponse.redirect(new URL(`/dashboard/${userRole}`, nextUrl));
        }
    }

    return;
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
