"use client"

import { useState } from "react";
import { Role } from "@/generated/prisma";
import StudentInfo from "@/types/users/studentInfo";
import ParentInfo from "@/types/users/parentInfo";
import EditUser from "@/types/users/editUser";
import Select from "react-select";
import { parentInfoSchema, studentInfoSchema, updateUserSchema } from "@/zod/users";
import { z } from "zod";
import { useRouter } from "next/navigation";

interface Props {
    id: number,
    userRole: Role,
    firstName: string,
    lastName: string,
    parentDetails: {
        emailAddress: string,
        billingAddress: string
    } | null,
    studentParentEmailAddresses: string[]
    parentEmailAddresses : { value: string, label: string }[]
}

export default function UpdateUserForm(props: Props) {
    const { id, userRole, firstName, lastName, parentDetails } = props;

    const [userInfo, setUserInfo] = useState<EditUser>({
        firstName: firstName,
        lastName: lastName
    });
    const [studentInfo, setStudentInfo] = useState<StudentInfo>({
        parentEmail: props.studentParentEmailAddresses
    });
    const [parentInfo, setParentInfo] = useState<ParentInfo>({
        email: parentDetails?.emailAddress || "",
        billingAddress: parentDetails?.billingAddress || ""
    });
    const [role] = useState<Role>(userRole);

    const [zodErrors, setZodErrors] = useState({
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
                        firstNameErrors: [],
                        lastNameErrors: [],
                        parentEmailErrors: [],
                        emailErrors: [],
                        billingAddressErrors: []
                    });
                    try {
                        if (role == Role.PARENT) {
                            const combined = updateUserSchema.merge(parentInfoSchema);
                            combined.parse({...userInfo, ...parentInfo});
                        }
                        else if (role == Role.STUDENT) {
                            const combined = updateUserSchema.merge(studentInfoSchema);
                            combined.parse({...userInfo, ...studentInfo});
                        }
                        else {
                            updateUserSchema.parse(userInfo);
                        }

                        const res = await fetch(`/api/user/${id}`, {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({userInfo: userInfo, studentInfo: studentInfo, parentInfo: parentInfo, role: userRole}),
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
                            var firstName = [] as string[], lastName = [] as string[], parentEmail = [] as string[], 
                                email = [] as string[], billingAddress = [] as string[];
                            issues.map((issue) => {
                                if(issue.path.includes("firstName")) {
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
                    <label htmlFor="lastName" className="block text-gray-800 font-medium mb-1">Vezetéknév</label>
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Vezetéknév"
                        value={userInfo.lastName}
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
                        value={userInfo.firstName}
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
                    <label htmlFor="parentEmail" className="block text-gray-800 font-medium mb-1">Szülő(k) e-mail címe(i):</label>
                    <Select
                        options={props.parentEmailAddresses}
                        value={Array.from(studentInfo.parentEmail.map((email) => ({value: email, label: email})))}
                        isMulti
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
                        value={parentInfo.email}
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
                        value={parentInfo.billingAddress}
                        onChange={(e) => setParentInfo({ ...parentInfo, billingAddress: e.target.value })}
                        className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    {(zodErrors.billingAddressErrors.length > 0) && <div>
                        {zodErrors.billingAddressErrors.map((message, key) => (
                            <p key={key} className="text-base text-red-700">{message}</p>
                        ))}
                    </div>}
                </div>}
                <button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-400 p-2 rounded-lg text-black"
                >
                    Felhasználó módosítása
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