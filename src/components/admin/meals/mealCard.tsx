import Link from "next/link";
import { getFormattedDateForPage } from "@/functions/dateHelperFunctions";
import DeleteMealButton from "./deleteMealButton";

interface Props {
    menuId: number,
    id: number;
    dateOfMeal: Date;
    code: string;
    description: string;
    isEditable: boolean;
}

export default function MealCard(params: Props) {
    const { menuId, id, dateOfMeal, code, description } = params;

    const date = getFormattedDateForPage(dateOfMeal);

    return (
        <div className="flex justify-between items-start bg-white shadow-md rounded-xl p-4 mb-4 border border-gray-200">
            <div className="flex flex-col gap-1 text-gray-800">
                <div className="flex gap-6">
                    <p className="text-lg font-bold self-center">{code}</p>
                    <p className="text-lg">{description}</p>
                </div>
                <p className="mt-1">Dátum: {date}</p>
            </div>
            {(params.isEditable) && 
            <div className="flex flex-col gap-2">
                <Link
                    href={`/menus/${menuId}/${id}`}
                    className="bg-yellow-500 hover:bg-yellow-400 p-2 rounded-lg text-black"
                >
                    Szerkesztés
                </Link>
                <DeleteMealButton menuId={menuId} mealId={id} />
            </div>
            }
        </div>
    )
}