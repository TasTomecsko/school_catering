import Link from "next/link";

interface Props {
    studentId: number;
    menuId: number;
    startDate: string;
    endDate: string;
    orderStartDates: string[];
}

export default function MenuNavCard(props: Props) {
    const hasOrdered = props.orderStartDates.includes(props.startDate)

    return (
        <Link href={`/students/${props.studentId}/availableMenus/${props.menuId}`}>
            <div 
                className="bg-white shadow-md rounded-xl p-6 border 
                    border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
            >
                <p className="text-lg">
                    Kezdő dátum: {props.startDate}
                </p>
                <p className="text-lg">
                    Befejező dátum: {props.endDate}
                </p>
                <p className="text-lg mt-2">{hasOrdered ? "Rendelt ✅" : "Még nem rendelt ❌"}</p>
            </div>
        </Link>
    )
}