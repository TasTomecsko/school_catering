"use client"
//TODO: DELETE THIS
/*export default function ToggleUserButton({userId, isEnabled}: {userId: number, isEnabled: boolean}) {
    return (
        <button 
            onClick={async () => {
                await fetch(`/api/user/${userId}/toggleUser`, {
                    method: "PATCH"
                })
            }}
            className={`${isEnabled ? "bg-red-700 hover:bg-red-600" : "bg-green-700 hover:bg-green-600"} text-white font-bold py-2 px-4 rounded`}
        >
            {isEnabled ? "Tiltás" : "Aktiválás"}
        </button>
    );
}*/