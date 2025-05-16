import { z } from "zod";

export const mealSchema = z.object({
    code: z.string().trim().length(1, { message: "A kódnak 1 karakter hosszúnak kell lennie" }).toUpperCase(),
    description: z.string().trim().min(1, { message: "A leírást meg kell adni" }),
    dateOfMeal: z.string().trim().min(1, { message: "Az étkezés dátumát meg kell adni" })
        .date("A dátumnak YYYY-MM-DD formátumúnak kell lennie"),
    allergenIdList: z.array(z.number()
        .gte(1, { message: "Az allergénlistába nem létező elem került" })
        .lte(14, { message: "Az allergénlistába nem létező elem került" })
    )
})