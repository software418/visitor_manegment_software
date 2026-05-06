import {z} from "zod";

export const loginSchema = z.object({   
    body: z.object({
        company_id: z.string().trim().min(1, "Company ID is required"),
        email: z.string().trim().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
        remember: z.boolean().optional(),
    }),
});
