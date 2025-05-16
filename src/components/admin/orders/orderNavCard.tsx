import Link from "next/link";

interface Props {
    orderId: number;
    menuId: number;
    studentUsername: string;
    studentFirstName: string;
    studentLastName: string;
}

export default function OrderNavCard(props: Props) {
    return (
        <Link href={`/menus/${props.menuId}/orders/${props.orderId}`}>
            <div className="bg-white shadow-md rounded-xl p-4 mb-4 border border-gray-200 hover:bg-gray-100">
                <p className="text-lg">Felhasználónév: {props.studentUsername}</p>
                <p className="text-lg">Név: {props.studentLastName} {props.studentFirstName}</p>
            </div>
        </Link>
    )
}