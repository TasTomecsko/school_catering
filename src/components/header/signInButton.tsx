"use client"

import { signIn } from "next-auth/react";

export default function SignInButton() {
    return (
        <button onClick={async () => await signIn()}>Bejelentkezés</button>
    )
}