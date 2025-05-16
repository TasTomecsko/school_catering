interface Props {
    code: string;
    description: string;
}

export default function CalendarMealCard(props: Props) {
    return (
        <div className="mb-2">
            <p className="text-xl font-medium mb-1">{props.code}</p>
            <p className="text-lg font-light">{props.description}</p>
        </div>
    )
}