"use client"

import { Role } from "@/generated/prisma";
import EditUser from "@/types/users/editUser";
import ParentInfo from "@/types/users/parentInfo";
import { parentInfoSchema, updateUserSchema } from "@/zod/users";
import { useRouter } from "next/navigation";
import { useState } from "react"
import { z } from "zod";

interface Props {
    firstName: string;
    lastName: string;
    emailAddress: string | undefined;
    billingAddress: string | undefined;
    role: Role
}

export default function UserDataEditor(params: Props) {
    const [userData, setUserData] = useState<EditUser>({
        firstName: params.firstName,
        lastName: params.lastName
    });

    const [parentDetails, setParentDetails] = useState<ParentInfo>({
        email: params.emailAddress ? params.emailAddress : "",
        billingAddress: params.billingAddress ? params.billingAddress : ""
    });

    const [zodErrors, setZodErrors] = useState({
        firstNameErrors: [] as string[],
        lastNameErrors: [] as string[],
        emailErrors: [] as string[],
        billingAddressErrors: [] as string[]
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
                        firstNameErrors: [],
                        lastNameErrors: [],
                        emailErrors: [],
                        billingAddressErrors: []
                    });
                    try {
                        if(params.role === Role.PARENT) {
                            const combined = updateUserSchema.merge(parentInfoSchema);
                            combined.parse({...userData, ...parentDetails});
                            parentInfoSchema.parse(parentDetails);
                        }
                        else {
                            updateUserSchema.parse(userData);
                        }

                        const res = await fetch("/api/profile/userData", {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                userData: userData,
                                parentData: parentDetails
                            })
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
                            var firstName = [] as string[], lastName = [] as string[],
                                email = [] as string[], billingAddress = [] as string[];
                            issues.map((issue) => {
                                if(issue.path.includes("firstName")) {
                                    firstName.push(issue.message);
                                }
                                else if(issue.path.includes("lastName")) {
                                    lastName.push(issue.message);
                                }
                                else if(issue.path.includes("email")) {
                                    email.push(issue.message);
                                }
                                else if(issue.path.includes("billingAddress")) {
                                    billingAddress.push(issue.message);
                                }
                            });
    
                            setZodErrors({
                                firstNameErrors: firstName,
                                lastNameErrors: lastName,
                                emailErrors: email,
                                billingAddressErrors: billingAddress
                            });
                        }
                        else {
                            console.log(error);
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
                    {(zodErrors.lastNameErrors.length > 0) && <div>
                        {zodErrors.lastNameErrors.map((message, key) => (
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
                    {(zodErrors.firstNameErrors.length > 0) && <div>
                        {zodErrors.firstNameErrors.map((message, key) => (
                            <p key={key} className="text-base text-red-700">{message}</p>
                        ))}
                    </div>}
                </div>
        
                {(params.role === Role.PARENT) &&
                <div>
                    <label htmlFor="email" className="block text-gray-800 font-medium mb-1">
                        Email-cím
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={parentDetails.email}
                        onChange={(e) => setParentDetails({...parentDetails, email: e.target.value})}
                        className="w-full bg-white text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    {(zodErrors.emailErrors.length > 0) && <div>
                        {zodErrors.emailErrors.map((message, key) => (
                            <p key={key} className="text-base text-red-700">{message}</p>
                        ))}
                    </div>}
                </div>
                }
        
                {(params.role === Role.PARENT) &&
                <div>
                    <label htmlFor="billing" className="block text-gray-800 font-medium mb-1">
                        Számlázási cím
                    </label>
                    <input
                        id="billing"
                        type="text"
                        value={parentDetails.billingAddress}
                        onChange={(e) => setParentDetails({...parentDetails, billingAddress: e.target.value})}
                        className="w-full bg-white text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    {(zodErrors.billingAddressErrors.length > 0) && <div>
                        {zodErrors.billingAddressErrors.map((message, key) => (
                            <p key={key} className="text-base text-red-700">{message}</p>
                        ))}
                    </div>}
                </div>
                }
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