"use client"

import EditUser from "@/types/users/editUser";
import { updateUserSchema } from "@/zod/users";
import { useRouter } from "next/navigation";
import { useState } from "react"
import { z } from "zod";

interface Props {
    id: number;
    firstName: string;
    lastName: string;
}

export default function StudentDataEditor(params: Props) {
    const [userData, setUserData] = useState<EditUser>({
        firstName: params.firstName,
        lastName: params.lastName
    });

    const [zodErrors, setZodErrors] = useState({
        firstNameErrors: [] as string[],
        lastNameErrors: [] as string[]
    });

    const [formError, setFormError] = useState("");
                          
    const router = useRouter();

    return (
        <div className="max-w-md mx-auto mt-10 border p-6 rounded-xl shadow-lg">
            <form
                className="flex flex-col gap-4"
                onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                        updateUserSchema.parse(userData);
                        
                        const res = await fetch(`/api/student/${params.id}`, {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({studentData: userData})
                        });

                        if (!res.ok) {
                            var data = await res.json();
                            setFormError(data.error);
                        }
                        else {
                            router.push(`/students`);
                        }
                    }
                    catch (error) {
                        setZodErrors({
                            firstNameErrors: [],
                            lastNameErrors: []
                        });

                        if (error instanceof z.ZodError) {
                            var issues = error.issues;
                            var firstName = [] as string[], lastName = [] as string[];
                            issues.map((issue) => {
                                if(issue.path.includes("firstName")) {
                                    firstName.push(issue.message);
                                }
                                else if(issue.path.includes("lastName")) {
                                    lastName.push(issue.message);
                                }
                            });
    
                            setZodErrors({
                                firstNameErrors: firstName,
                                lastNameErrors: lastName
                            });
                        }
                        else {
                            console.log(error)
                        }
                    }
                }}
            >
                <div>
                    <label htmlFor="lastName" className="block text-gray-800 font-medium mb-1">
                        Vezetéknév
                    </label>
                    <input
                        id="lastName"
                        type="text"
                        value={userData.lastName}
                        onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                        className="w-full bg-white text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    {(zodErrors.firstNameErrors.length > 0) && <div>
                        {zodErrors.firstNameErrors.map((message, key) => (
                            <p key={key} className="text-base text-red-700">{message}</p>
                        ))}
                    </div>}
                </div>
                
                <div>
                    <label htmlFor="firstName" className="block text-gray-800 font-medium mb-1">
                        Keresztnév
                    </label>
                    <input
                        id="firstName"
                        type="text"
                        value={userData.firstName}
                        onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                        className="w-full bg-white text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    {(zodErrors.lastNameErrors.length > 0) && <div>
                        {zodErrors.lastNameErrors.map((message, key) => (
                            <p key={key} className="text-base text-red-700">{message}</p>
                        ))}
                    </div>}
                </div>
                <button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-400 p-2 rounded-lg text-black"
                >
                    Adatok mentése
                </button>
                {(formError) && 
                <div>
                    <p className="text-base text-center text-white bg-red-700 p-2 rounded-xl">
                        {formError}
                    </p>
                </div>}
            </form>
        </div>
    );
}