import { experiencelevels } from "@/drizzle/schema";
import z from "zod";

export const jobInfoschema =z.object({
    name:z.string().min(1,"Required"),
    title:z.string().nullable(),
     experiencelevel:z.enum(experiencelevels),
    description:z.string().min(1,"Required")

})