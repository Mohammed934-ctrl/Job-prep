"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { jobInfoschema } from "../schema";
import { jobInfoTable } from "@/drizzle/schema";

type joninFoformData = z.infer<typeof jobInfoschema>;

export function jobInform({
  jobInfo,
}: {
  jobInfo?: Pick<
    typeof jobInfoTable.$inferInsert,
    "id" | "name" | "title" | "description" | "experiencelevel"
  >;
}) {
  return <div></div>;
}
