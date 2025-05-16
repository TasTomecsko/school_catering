"use client"

import { useState } from "react";
import CreateUser from "@/types/users/createUser";
import { Role } from "@/generated/prisma";
import StudentInfo from "@/types/users/studentInfo";
import ParentInfo from "@/types/users/parentInfo";
import Select from "react-select";
import { createUserSchema, parentInfoSchema, studentInfoSchema } from "@/zod/users";
import { z } from "zod";
import { useRouter } from "next/navigation";

export default function CreateUserForm(props: { emailAddresses: { value: string, label: string }[] }) {
    const [userInfo, setUserInfo] = useState<CreateUser>({
        username: "",
        password: "",
        firstName: "",
        lastName: ""
    });
    const [studentInfo, setStudentInfo] = useState<StudentInfo>({
        parentEmail: []
    });
    const [parentInfo, setParentInfo] = useState<ParentInfo>({
        email: "",
        billingAddress: ""
    });
    const [role, setRole] = useState<Role>(Role.PARENT);

    const [zodErrors, setZodErrors] = useState({
        usernameErrors: [] as string[],
        passwordErrors: [] as string[],
        firstNameErrors: [] as string[],
        lastNameErrors: [] as string[],
        parentEmailErrors: [] as string[],
        emailErrors: [] as string[],
        billingAddressErrors: [] as string[]
    });

    const [formError, setFormError] = useState("");
              
    const router = useRouter();

    return (
        <div className="max-w-md mx-auto mt-10 border p-6 rounded-xl shadow-lg">
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    setZodErrors({
                        usernameErrors: [],
                        passwordErrors: [],
                        firstNameErrors: [],
                        lastNameErrors: [],
                        parentEmailErrors: [],
                        emailErrors: [],
                        billingAddressErrors: []
                    });
                    try {
                        if (role === Role.PARENT) {
                            const combined = createUserSchema.merge(parentInfoSchema);
                            combined.parse({...userInfo, ...parentInfo});
                        }
                        else if (role === Role.STUDENT) {
                            const combined = createUserSchema.merge(studentInfoSchema);
                            combined.parse({...userInfo, ...studentInfo})
                        }
                        else {
                            createUserSchema.parse(userInfo);
                        }

                        const res = await fetch("/api/user", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({userInfo: userInfo, parentInfo: parentInfo, studentInfo: studentInfo, role})
                        });

                        if (!res.ok) {
                            var data = await res.json();
                            setFormError(data.error);
                        }
                        else {
                            router.push(`/users`);
                        }
                    }
                    catch (error) {
                        if (error instanceof z.ZodError) {
                            var issues = error.issues;
                            var username = [] as string[], password = [] as string[], 
                                firstName = [] as string[], lastName = [] as string[], parentEmail = [] as string[], 
                                email = [] as string[], billingAddress = [] as string[];
                            issues.map((issue) => {
                                if(issue.path.includes("username")) {
                                    username.push(issue.message);
                                }
                                else if(issue.path.includes("password")) {
                                    password.push(issue.message);
                                }
                                else if(issue.path.includes("firstName")) {
                                    firstName.push(issue.message);
                                }
                                else if(issue.path.includes("lastName")) {
                                    lastName.push(issue.message);
                                }
                                else if(issue.path.includes("parentEmail")) {
                                    parentEmail.push(issue.message);
                                }
                                else if(issue.path.includes("email")) {
                                    email.push(issue.message);
                                }
                                else if(issue.path.includes("billingAddress")) {
                                    billingAddress.push(issue.message);
                                }
                            });

                            setZodErrors({
                                usernameErrors: username,
                                passwordErrors: password,
                                firstNameErrors: firstName,
                                lastNameErrors: lastName,
                                parentEmailErrors: parentEmail,
                                emailErrors: email,
                                billingAddressErrors: billingAddress
                            });
                        }
                        else {
                            console.log(error);
                        }
                    }
                }}
                className="flex flex-col gap-4"
            >
                <div>
                    <label htmlFor="username" className="block text-gray-800 font-medium mb-1">Felhasználónév</label>
                    <input
                        type="text"
                        name="username"
                        placeholder="Felhasználónév"
                        onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value.toUpperCase() })}
                        className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 uppercase"
                        maxLength={8}
                        minLength={8}
                    />
                    {(zodErrors.usernameErrors.length > 0) && <div>
                        {zodErrors.usernameErrors.map((message, key) => (
                            <p key={key} className="text-base text-red-700">{message}</p>
                        ))}
                    </div>}
                </div>
                <div>
                    <label htmlFor="password" className="block text-gray-800 font-medium mb-1">Jelszó</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Jelszó"
                        onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
                        className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        minLength={10}
                    />
                    {(zodErrors.passwordErrors.length > 0) && <div>
                        {zodErrors.passwordErrors.map((message, key) => (
                            <p key={key} className="text-base text-red-700">{message}</p>
                        ))}
                    </div>}
                </div>
                <div>
                    <label htmlFor="lastName" className="block text-gray-800 font-medium mb-1">Vezetéknév</label>
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Vezetéknév"
                        onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
                        className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    {(zodErrors.lastNameErrors.length > 0) && <div>
                        {zodErrors.lastNameErrors.map((message, key) => (
                            <p key={key} className="text-base text-red-700">{message}</p>
                        ))}
                    </div>}
                </div>
                <div>
                    <label htmlFor="firstName" className="block text-gray-800 font-medium mb-1">Keresztnév</label>
                    <input
                        type="text"
                        name="firstName"
                        placeholder="Keresztnév"
                        onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value })}
                        className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    {(zodErrors.firstNameErrors.length > 0) && <div>
                        {zodErrors.firstNameErrors.map((message, key) => (
                            <p key={key} className="text-base text-red-700">{message}</p>
                        ))}
                    </div>}
                </div>
                {(role === Role.STUDENT) && <div>
                    <label htmlFor="parentEmail" className="block text-gray-800 font-medium mb-1">Szülő(k) E-mail címe(i)</label>
                    <Select
                        options={props.emailAddresses}
                        isMulti
                        id="parentEmail"
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={(e) => {
                            const selectedParents = Array.from(e).map((parent) => parent.value);
                            setStudentInfo({ ...studentInfo, parentEmail: selectedParents });
                        }}
                        styles={{
                            control: (base, state) => ({
                            ...base,
                            backgroundColor: '#f3f4f6',
                            color: '#1f2937',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.375rem',
                            boxShadow: 'none',
                            borderColor: state.isFocused ? '#facc15' : 'transparent',
                            borderWidth: '3px',
                            '&:hover': {
                                borderColor: state.isFocused ? '#facc15' : 'transparent'
                            }
                            }),
                            multiValueLabel: (base) => ({
                            ...base,
                            color: '#1f2937'
                            }),
                            multiValueRemove: (base) => ({
                            ...base,
                            color: '#1f2937',
                            ':hover': {
                                backgroundColor: '#facc15',
                                color: 'black'
                            }
                            })
                        }}
                    />
                    {(zodErrors.parentEmailErrors.length > 0) && <div>
                        {zodErrors.parentEmailErrors.map((message, key) => (
                            <p key={key} className="text-base text-red-700">{message}</p>
                        ))}
                    </div>}
                </div>}
                {(role === Role.PARENT) && <div>
                    <label htmlFor="emailAddress" className="block text-gray-800 font-medium mb-1">E-mail cím</label>
                    <input
                        type="email"
                        name="emailAddress"
                        placeholder="E-mail cím"
                        onChange={(e) => setParentInfo({ ...parentInfo, email: e.target.value })}
                        className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    {(zodErrors.emailErrors.length > 0) && <div>
                        {zodErrors.emailErrors.map((message, key) => (
                            <p key={key} className="text-base text-red-700">{message}</p>
                        ))}
                    </div>}
                </div>}
                {(role === Role.PARENT) && <div>
                    <label htmlFor="billingAddress" className="block text-gray-800 font-medium mb-1">Számlázási cím</label>
                    <input
                        type="text"
                        name="billingAddress"
                        placeholder="Számlázási cím"
                        onChange={(e) => setParentInfo({ ...parentInfo, billingAddress: e.target.value })}
                        className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    {(zodErrors.billingAddressErrors.length > 0) && <div>
                        {zodErrors.billingAddressErrors.map((message, key) => (
                            <p key={key} className="text-base text-red-700">{message}</p>
                        ))}
                    </div>}
                </div>}
                <div>
                    <label htmlFor="role" className="block text-gray-800 font-medium mb-1">Szerepkör</label>
                    <select
                        name="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as Role)}
                        className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                        <option value={Role.ADMIN}>Adminisztrátor</option>
                        <option value={Role.STUDENT}>Tanuló</option>
                        <option value={Role.PARENT}>Szülő</option>
                        <option value={Role.KITCHEN_WORKER}>Konyhai dolgozó</option>
                    </select>
                </div>
                <button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-400 p-2 rounded-lg text-black"
                >
                    Felhasználó létrehozása
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