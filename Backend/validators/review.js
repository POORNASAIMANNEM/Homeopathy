import {z} from "zod";

export const reviewValid = z.object({
    name:z.string().min(1,"Name is required").max(50,"Name is too long"),
    email:z.string().email("Invalid email address"),
    rating:z.number().int().min(1,"Rating must be between 1 and 5").max(5,"Rating must be between 1 and 5"),
    comment:z.string().min(1,"Comment is required").max(500,"Comment is too long")
}).strict();
