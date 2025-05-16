"use client"

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoginDetails } from "@/types/users/loginDetails";
import { loginSchema } from "@/zod/users";
import { z } from "zod";

export default function LogIn() {
    const [loginInfo, setLoginInfo] = useState<LoginDetails>({
        username: "",
        password: ""
    });
    const router = useRouter();
    const [zodErrors, setZodErrors] = useState({
        usernameErrors: [] as string[],
        passwordErrors: [] as string[]
    });
    const [loginError, setLoginError] = useState("");

    return (
        <div>
            <div className="pl-2.5 mb-8">
                <h1 className="text-2xl font-medium py-2">Bejelentkezés</h1>
            </div>
            <div className="max-w-md mx-auto mt-10 border p-6 rounded-xl shadow-lg">            
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    setZodErrors({
                        usernameErrors: [],
                        passwordErrors: []
                    });
                    setLoginError("");
                    try {
                        loginSchema.parse(loginInfo);
                        const username = loginInfo.username as string;
                        const password = loginInfo.password as string;
                        
                        const res = await fetch(`/api/authPrecheck`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({loginInfo: loginInfo})
                        });

                        if (!res.ok) {
                            var data = await res.json();
                            setLoginError(data.error);
                        }
                        else {
                            await signIn("credentials", { username, password, redirect: false });
                            router.refresh();
                        }
                    }
                    catch (error) {
                        if (error instanceof z.ZodError) {
                            var messages = error.issues;
                            var username = [] as string[], password = [] as string[];
                            messages.map((message) => {
                                if (message.path.includes("username")) {
                                    username.push(message.message);
                                }
                                else if (message.path.includes("password")) {
                                    password.push(message.message);
                                }
                            });

                            setZodErrors({
                                usernameErrors: username,
                                passwordErrors: password
                            });
                        }
                        else {
                            console.log(error)
                        }
                    }
                }}
                className="flex flex-col gap-4"
                >
                    <div>
                        <label htmlFor="username" className="block text-gray-800 font-medium mb-1">Felhasználónév</label>
                        <input id="username" type="text" onChange={(e) => setLoginInfo({...loginInfo, username: e.target.value})} 
                            className="w-full bg-white text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            maxLength={8}
                        />
                        {(zodErrors.usernameErrors.length > 0) && <div>
                            {zodErrors.usernameErrors.map((message, key) => (
                                <p key={key} className="text-base text-red-700">{message}</p>
                            ))}
                        </div>}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-gray-800 font-medium mb-1">Jelszó</label>
                        <input id="password" type="password" onChange={(e) => setLoginInfo({...loginInfo, password: e.target.value})} 
                            className="w-full bg-white text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                        {(zodErrors.passwordErrors.length > 0) && <div>
                            {zodErrors.passwordErrors.map((message, key) => (
                                <p key={key} className="text-base text-red-700">{message}</p>
                            ))}
                        </div>}
                    </div>
                    <button 
                        type="submit"
                        className="bg-yellow-500 hover:bg-yellow-400 p-2 rounded-lg text-black"
                    >
                        Bejelentkezés
                    </button>
                    {(loginError) && <div>
                        <p className="text-base text-center text-white bg-red-700 p-2 rounded-xl">
                            {loginError}
                        </p>
                    </div>}
                </form>
            </div>
        </div>
    )
}