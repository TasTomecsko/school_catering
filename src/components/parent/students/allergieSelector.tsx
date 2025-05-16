"use client"

import AllergyDetails from "@/types/student/allergyDetails";
import { studentAllergySchema } from "@/zod/studentAllergies";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Select from "react-select";
import { z } from "zod";

interface Params {
    studentId: number,
    studentAllergiesIdList: number[], 
    allergieList: { value: number, label: string }[]
}

export default function AllergieSelector(params: Params) {
    const [studentAllergies, setStudentAllergies] = useState<AllergyDetails>({
        allergyIdList: params.studentAllergiesIdList
    });

    const [zodErrors, setZodErrors] = useState({
        allergyIdListErrors: [] as string[]
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
                        studentAllergySchema.parse(studentAllergies);

                        const res = await fetch(`/api/student/${params.studentId}/allergies`, {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({selectedAllergies: studentAllergies})
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
                            allergyIdListErrors: []
                        });

                        if (error instanceof z.ZodError) {
                            var issues = error.issues;
                            var allergies = [] as string[];
                            issues.map((issue) => {
                                if(issue.path.includes("allergyIdList")) {
                                    allergies.push(issue.message);
                                }
                            });
    
                            setZodErrors({
                                allergyIdListErrors: allergies
                            });
                        }
                        else {
                            console.log(error);
                        }
                    }
                }}
            >
                <div>
                    <label htmlFor="allergens" className="block text-gray-800 font-medium mb-1">
                        Allergiák
                    </label>
                    <Select
                        options={params.allergieList}
                        isMulti
                        className="basic-multi-select"
                        classNamePrefix="select"
                        value={Array.from(studentAllergies.allergyIdList.map((id) => 
                            ({ value: id, label: params.allergieList.find(allergy => allergy.value === id)?.label })))
                        }
                        onChange={(e) => {
                            const selectedAllergies = Array.from(e).map((allergen) => allergen.value);
                            setStudentAllergies({ ...studentAllergies, allergyIdList: selectedAllergies });
                        }}
                        placeholder={"Allergének megadása"}
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
                    {(zodErrors.allergyIdListErrors.length > 0) && <div>
                        {zodErrors.allergyIdListErrors.map((message, key) => (
                            <p key={key} className="text-base text-red-700">{message}</p>
                        ))}
                    </div>}
                </div>
                <button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-400 p-2 rounded-lg text-black"
                >
                    Diák allergiáinak módosítása
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