import Link from "next/link";

interface Props {
    id: number;
    firstName: string;
    lastName: string;
}

export default function StudentCard(props: Props) {
    return (
        <div className="flex justify-between items-center bg-white shadow-md rounded-xl p-4 mb-4 border border-gray-200">
            <div className="flex justify-center text-gray-800">
                <p className="text-xl">{props.lastName} {props.firstName}</p>
            </div>
            <div className="flex flex-col gap-2">
                <Link
                    href={`/students/${props.id}/edit`}
                    className="bg-yellow-500 hover:bg-yellow-400 p-2 rounded-lg text-black text-center"
                >
                    Adatok szerkesztése
                </Link>
                <Link 
                    href={`/students/${props.id}/availableMenus`}
                    className="bg-blue-700 p-1 rounded-lg hover:bg-blue-600 text-white text-center"
                >
                    Elérhető menük
                </Link>
                <Link
                    href={`/students/${props.id}/removeOrder`}
                    className="bg-blue-700 p-1 rounded-lg hover:bg-blue-600 text-white text-center"
                >
                    Rendelések kezelése
                </Link>
            </div>
        </div>
    )
}