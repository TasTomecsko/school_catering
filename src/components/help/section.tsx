import React from "react";

interface Props {
    sectionTitle: string;
    steps: {step: string | React.ReactNode, subSteps?: {subStep: string}[]}[];
}

export default function HelpSection(props: Props) {
    return (
        <div className="mb-8">
            <h1 className="text-2xl font-medium">{props.sectionTitle}</h1>
            <ul className="list-decimal list-inside text-lg">
                {props.steps.map((item, id) => (
                    <li key={id}>
                        {item.step}
                        {(item.subSteps) &&
                            <ul className="list-decimal list-inside pl-4">
                                {item.subSteps.map((subItem, subId) => (
                                    <li key={subId} className="text-base">{subItem.subStep}</li>
                                ))}
                            </ul>
                        }
                    </li>
                ))}
            </ul>
        </div>
    )
}