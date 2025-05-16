import Link from "next/link";
import DeleteMenuButton from "./deleteMenuButton";
import { getFormattedDateForPage } from "@/functions/dateHelperFunctions";

interface Props {
    id: number;
    startDate: Date;
    endDate: Date;
    activationDate: Date;
}

export default function MenuCard(params: Props) {
    const startDate = getFormattedDateForPage(params.startDate);
    const endDate = getFormattedDateForPage(params.endDate);
    const activationDate = getFormattedDateForPage(params.activationDate);

    return (
        <div className="flex justify-between items-start bg-white shadow-md rounded-xl p-4 mb-4 border border-gray-200">
            <div className="flex flex-col gap-1 text-gray-800">
                <div className="flex gap-6">
                    <p className="text-lg">Kezdési dátum: {startDate}</p>
                    <p className="text-lg">Befejezési dátum: {endDate}</p>
                </div>
                <p className="mt-1 text-lg">Aktiválási dátum: {activationDate}</p>
            </div>
            <div className="flex flex-col gap-2">
                <Link
                    href={`/menus/${params.id}`}
                    className="bg-blue-700 p-1 rounded-lg hover:bg-blue-600 text-white text-center"
                >
                    Részletek
                </Link>
                {
                    (params.activationDate > new Date()) && <DeleteMenuButton menuId={params.id}/>
                }
            </div>
        </div>
    )
}