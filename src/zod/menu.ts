import { z } from "zod";

const parseDate = (str: string) => new Date(str + "T00:00:00");

const today = new Date();
today.setHours( 0, 0, 0, 0);

export const menuSchema = z.object({
    activationDate: z.string({ message: "A megadott adatnak szövegnek kell lennie" })
        .min(1, { message: "Az aktiváció dátumát meg kell adni" })
        .date("A dátumank YYYY-MM-DD formátumúnak kell lennie")
        .refine((dateStr) => {
        const date = parseDate(dateStr);
        return date > today
    },
    { 
        message: "Az aktivációs dátum nem lehet a mai napon, vagy annál korábban" 
    }),
    startDate: z.string({ message: "A megadott adatnak szövegnek kell lennie" })
        .min(1, { message: "A kezdő dátumot meg kell adni" })
        .date("A dátumank YYYY-MM-DD formátumúnak kell lennie"),
    endDate: z.string({ message: "A megadott adatnak szövegnek kell lennie" })
        .min(1, { message: "A kezdő dátumot meg kell adni" })
        .date("A dátumank YYYY-MM-DD formátumúnak kell lennie")
}).refine((obj) => {
    const start = parseDate(obj.startDate);
    const end = parseDate(obj.endDate);
    return start.getTime() <= end.getTime();
},
{
    message: "A kezdődátum nem lehet a végdátum után",
    path: ["startDate"]
}).refine((obj) => {
    const start = parseDate(obj.startDate);
    const activation = parseDate(obj.activationDate);
    return start.getTime() > activation.getTime();
},
{
    message: "A kezdődátumnak az aktivációs dátum után kell lennie",
    path: ["startDate"]
}).refine((obj) => {
    const start = parseDate(obj.startDate);
    const activation = parseDate(obj.activationDate);
    const diffInDays = (start.getTime() - activation.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays >= 2;
},
{
    message: "A kezdődátumnak az aktivációs dátumnál legalább 2 nappal később kell kezdődnie",
    path: ["startDate"]
});