import { getFormattedDateForPage, canDropOrder } from "@/functions/dateHelperFunctions";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";

interface Props {
    orderId: number;
    mealId: number;
    code: string;
    description: string;
    dateOfMeal: Date;
    menuId: number;
}

export default function StudentOrderCard(props: Props) {
    return (
        <div className="flex justify-between bg-white shadow-md rounded-xl p-4 mb-4 border border-gray-200">
            <div className="flex flex-col gap-1 text-gray-800">
                <p className="text-lg">{props.code} - {props.description}</p>
                <p className="text-lg">{getFormattedDateForPage(props.dateOfMeal)}</p>
            </div>
            <div className="flex flex-col justify-center align-middle">
                {(canDropOrder(props.dateOfMeal)) &&
                    <form action={async () => {
                        "use server"
                        await prisma.studentOrders.delete({
                            where: {
                                mealId_orderId: {
                                    mealId: props.mealId,
                                    orderId: props.orderId
                                }
                            }
                        });
                        redirect(`/menus/${props.menuId}/orders/${props.orderId}`);
                    }}>
                        <button 
                            type="submit" 
                            className="bg-red-700 p-2 rounded-lg hover:bg-red-600 text-white"
                        >
                            Rendelés lemondása
                        </button>
                    </form>
                }
            </div>
        </div>
    )
}