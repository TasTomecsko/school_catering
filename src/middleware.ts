import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@/generated/prisma";

export async function middleware(request: NextRequest) {
    const session = await auth();

    //Védett oldalak definiálása
    const protectedPaths = ["/menus", "/users", "/profile", "/students", "/todaysMeal"];
    const isPortected = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

    if (isPortected && !session)
        return NextResponse.redirect(new URL("/login", request.url));

    if (session && request.nextUrl.pathname.startsWith("/login"))
        return NextResponse.redirect(new URL("/", request.url));

    //Az API elérési utak védelme
    if (request.nextUrl.pathname.startsWith("/api/menu") && session?.user.role !== Role.ADMIN)
        return NextResponse.json({message: "Unathorized"}, {status: 403});
    else if (request.nextUrl.pathname.startsWith("/api/user") && session?.user.role !== Role.ADMIN)
        return NextResponse.json({message: "Unathorized"}, {status: 403});
    else if (request.nextUrl.pathname.startsWith("/api/student") && session?.user.role !== Role.PARENT)
        return NextResponse.json({message: "Unathorized"}, {status: 403});
    else if (request.nextUrl.pathname.startsWith("api/profile") && session?.user.role === Role.STUDENT)
        return NextResponse.json({message: "Unathorized"}, {status: 403});

    //Védett oldalak szerep szerinti leosztása
    const noStudentPaths = ["/profile"]
    const parentPaths = ["/students"]
    const adminPaths = ["/menus", "/users"];
    const studnetPaths = ["/todaysMeal"];
    const kitchenPaths = ["/orders"];

    const isAdminRequired = adminPaths.some((path) => request.nextUrl.pathname.startsWith(path));
    const isParentRequired = parentPaths.some((path) => request.nextUrl.pathname.startsWith(path))
    const noStudentAllowed = noStudentPaths.some((path) => request.nextUrl.pathname.startsWith(path));
    const isStudentRequired = studnetPaths.some((path) => request.nextUrl.pathname.startsWith(path));
    const isKitchenRequired = kitchenPaths.some((path) => request.nextUrl.pathname.startsWith(path));

    //Szerephez kötött weblap elérés megvalósítása
    if (isAdminRequired && session?.user.role !== Role.ADMIN)
        return NextResponse.redirect(new URL("/forbidden", request.url));

    if (noStudentAllowed && session?.user.role === Role.STUDENT)
        return NextResponse.redirect(new URL("/forbidden", request.url));

    if (isParentRequired && session?.user.role !== Role.PARENT)
        return NextResponse.redirect(new URL("/forbidden", request.url));

    if (isStudentRequired && session?.user.role !== Role.STUDENT)
        return NextResponse.redirect(new URL("/forbidden", request.url));

    if (isKitchenRequired && session?.user.role !== Role.KITCHEN_WORKER)
        return NextResponse.redirect(new URL("/forbidden", request.url));

    return NextResponse.next();
}

export const config = {
    matchers: [
        "/menus/:path*",
        "/users/:path*",
        "/profile/:path*",
        "/student/:path*",
        "/todaysMeal/:path*",
        "/orders/:path*",
        "/api/:path*"
    ]
}