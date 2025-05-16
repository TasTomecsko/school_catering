import { z } from "zod";

export const studentAllergySchema = z.object({
    allergyIdList: z.array(z.number()
        .gte(1, { message: "Az allergialistába nem létező elem került" })
        .lte(14, { message: "Az allergialistába nem létező elem került" })
    )
})