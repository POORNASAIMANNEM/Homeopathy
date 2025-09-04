import { z } from "zod";

export const userValid = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  email: z.string().email("Invalid email address"),
  age: z.preprocess((val) => Number(val), z.number().min(1, "Age must be at least 1").max(100, "Age must be less than or equal to 100")),
  address: z.string().min(1, "Address is required").max(100, "Address too long"),
  sex: z.enum(["Male", "Female", "Others"]),
  medicalConcern: z.array(z.string().min(1, "Concern can't be empty")).min(1, "At least one medical concern is required").max(10, "You can add up to 10 concerns"),
  phno: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),
  isCompleted: z.boolean().optional(),   // ✅ ADD THIS LINE
}).strict();