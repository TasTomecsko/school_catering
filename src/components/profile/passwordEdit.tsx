"use client"

import { ChangePassword } from "@/types/users/changePassword";
import { changePasswordSchema } from "@/zod/users";
import { useRouter } from "next/navigation";
import { useState } from "react"
import { string, z } from "zod";

export default function PasswordEdit() {
    const [passwordData, setPasswordData] = useState<ChangePassword>({
        oldPassword: "",
        newPassword: ""
    });

    const [zodErrors, setZodErrors] = useState({
        oldPassErrors: [] as string[],
        newPassErrors: [] as string[]
    });

    const [formError, setFormError] = useState("");
                              
    const router = useRouter();

    return (
        <div className="max-w-md mx-auto mt-10 border p-6 rounded-xl shadow-lg">
        <form 
            className="flex flex-col gap-4"
            onSubmit={async (e) => {
                e.preventDefault();
                setZodErrors({
                    oldPassErrors: [],
                    newPassErrors: []
                });
                try {
                    changePasswordSchema.parse(passwordData);

                    const res = await fetch("/api/profile/password", {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({passwordData: passwordData})
                    });

                    if (!res.ok) {
                        var data = await res.json();
                        setFormError(data.error);
                    }
                    else {
                        router.push(`/profile`);
                    }
                }
                catch (error) {
                    if (error instanceof z.ZodError) {
                        var issues = error.issues;
                        var oldPass = [] as string[], newPass = [] as string[];
                        issues.map((issue) => {
                            if (issue.path.includes("oldPassword")) {
                                oldPass.push(issue.message);
                            }
                            else if (issue.path.includes("newPassword")) {
                                newPass.push(issue.message);
                            }
                        });

                        setZodErrors({
                            oldPassErrors: oldPass,
                            newPassErrors: newPass
                        });
                    }
                    else {
                        console.log(error);
                    }
                }
            }}
        >
            <div>
                <label htmlFor="oldPassword" className="block text-gray-800 font-medium mb-1">
                    Régi jelszó
                </label>
                <input
                    id="oldPassword"
                    type="password"
                    onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                    className="w-full bg-white text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                {(zodErrors.oldPassErrors.length > 0) && <div>
                    {zodErrors.oldPassErrors.map((message, key) => (
                        <p key={key} className="text-base text-red-700">{message}</p>
                    ))}
                </div>}
            </div>
    
            <div>
                <label htmlFor="newPassword" className="block text-gray-800 font-medium mb-1">
                    Új jelszó
                </label>
                <input
                    id="newPassword"
                    type="password"
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full bg-white text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                {(zodErrors.newPassErrors.length > 0) && <div>
                    {zodErrors.newPassErrors.map((message, key) => (
                        <p key={key} className="text-base text-red-700">{message}</p>
                    ))}
                </div>}
            </div>
            <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-400 p-2 rounded-lg text-black"
            >
                Jelszó mentése
            </button>
            {(formError) && 
            <div>
                <p className="text-base text-center text-white bg-red-700 p-2 rounded-xl">
                    {formError}
                </p>
            </div>}
        </form>
        </div>
    )
}