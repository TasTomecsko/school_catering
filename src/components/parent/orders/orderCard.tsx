import { canDropOrder, getFormattedDateForPage } from "@/functions/dateHelperFunctions";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";

interface Props {
    orderId: number;
    mealId: number;
    code: string;
    description: string;
    dateOfMeal: Date;
    studentId: number;
}

export default function OrderCard(props: Props) {
    return (
        <div className="flex justify-between items-center bg-white shadow-md rounded-xl p-4 mb-4 border border-gray-200">
            <div className="flex flex-col gap-1 text-gray-800">
                <p className="text-lg">{props.code} - {props.description}</p>
                <p className="text-lg">{getFormattedDateForPage(props.dateOfMeal)}</p>
            </div>
            <div>
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
                    redirect(`/students/${props.studentId}/removeOrder`)
                }}>
                    <button 
                        type="submit" 
                        className="bg-red-700 p-2 rounded-lg hover:bg-red-600 text-white"
                    >
                        Rendelés lemondása
                    </button>
                </form>}
            </div>
        </div>
    )
}