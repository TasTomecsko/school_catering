import CreateUser from "@/types/users/createUser";
import StudentInfo from "@/types/users/studentInfo";
import { z } from "zod";

export const createUserSchema = z.object({
    username: z.string()
        .trim()
        .toUpperCase()
        .min(8, { message: "A felhasználónévnek legalább 8 karakter hosszúnak kell lennie" })
        .max(8, { message: "A felhasználónév nem lehet hoszabb nyolc karakternél" }),
    password: z.string()
        .trim()
        .min(10, { message: "A jelszónak legalább 10 karakter hosszúnak kell lennie" }),
    firstName: z.string()
        .trim()
        .regex(/^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű ]+$/, { message: "A keresztnév csak betűket tartalmazhat" })
        .min(1, { message: "A keresztnevet meg kell adni" }),
    lastName: z.string()
        .trim()
        .regex(/^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+$/, { message: "A vezetéknév csak betűket tartalmazhat" })
        .min(1, { message: "A vezetéknevet meg kell adni" })
});

export const updateUserSchema = z.object({
    firstName: z.string()
        .trim()
        .regex(/^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű ]+$/, { message: "A keresztnév csak betűket tartalmazhat" })
        .min(1, { message: "A keresztnevet meg kell adni" }),
    lastName: z.string()
        .trim()
        .regex(/^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+$/, { message: "A vezetéknév csak betűket tartalmazhat" })
        .min(1, { message: "A vezetéknevet meg kell adni" })
});

export const parentInfoSchema = z.object({
    email: z.string().min(1, { message: "Az e-mail cím megadása kötelező" }).email({ message: "Érvénytelen e-mail cím" }),
    billingAddress: z.string().min(1, { message: "A számlázási cím megadása kötelező" })
});

export const studentInfoSchema = z.object({
    parentEmail: z.array(z.string().email({ message: "Érvénytelen e-mail cím" }))
        .nonempty({ message: "Legalább egy szülő e-mail címe szükséges" })
});

export const changePasswordSchema = z.object({
    oldPassword: z.string()
        .trim()
        .min(10, { message: "A jelszónak legalább 10 karakter hosszúnak kell lennie" }),
    newPassword: z.string()
        .trim()
        .min(10, { message: "A jelszónak legalább 10 karakter hosszúnak kell lennie" })
})
.refine((obj) => {
    const newPassword = obj.newPassword;
    const oldPassword = obj.oldPassword;

    return newPassword !== oldPassword;
},{
    message: "Az új jelszó nem egyezhet meg a régi jelszóval!",
    path: ["newPassword"]
});

export const loginSchema = z.object({
    username: z.string().length(8, {message: "A felhasznélónévnek 8 karakter hosszúnak kell lennie"}).toUpperCase(),
    password: z.string().min(10, {message: "A jelszónak legalább 10 karakter hosszúnak kell lennie"})
});