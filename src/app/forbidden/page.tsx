export default function ForbiddenPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold">403 - Tiltott</h1>
            <p className="mt-4 text-lg">Nem rendelkezik megfelelő jogosultsággal az oldal megtekintéséhez!</p>
        </div>
    );
}