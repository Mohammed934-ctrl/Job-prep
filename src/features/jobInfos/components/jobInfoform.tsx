"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useEffect } from "react";
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
import { experiencelevels, jobInfoTable } from "@/drizzle/schema";
import { createjobInfo, updatejobinfo } from "../action";
import { toast } from "sonner";

type jobinfoformData = z.infer<typeof jobInfoschema>;

export function JobInform({
  jobInfo,
}: {
  jobInfo?: Pick<
    typeof jobInfoTable.$inferSelect,
    "id" | "name" | "title" | "description" | "experiencelevel"
  >;
}) {
  // Create a form controller using react-hook-form.
  // This object (`form`) manages:
  // - form state (values, errors, touched fields)
  // - validation (via Zod)
  // - registering inputs
  //
  // NOTE:
  // We do NOT handle submission logic here.
  // This form only collects + validates data.
  // The actual database action is handled separately (in the action file).
  const form = useForm<jobinfoformData>({
    resolver: zodResolver(jobInfoschema),
    defaultValues: {
      name: "",
      title: null,
      description: "",
      experiencelevel: "Fresher",
    },
  });

  useEffect(() => {
    if (jobInfo) {
      form.reset({
        name: jobInfo.name,
        title: jobInfo.title,
        description: jobInfo.description,
        experiencelevel: jobInfo.experiencelevel,
      });
    }
  }, [jobInfo, form]);

  //  This function runs only AFTER the form passes validation`values` is guaranteed to match `jobinfoformData` shape.

  async function onSubmit(values: jobinfoformData) {
    const action = jobInfo
      ? updatejobinfo.bind(null, jobInfo.id)
      : createjobInfo;
    // Call the selected action with validated form value
    const res = await action(values);

    if (res.error) {
      toast.error(res.message);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormDescription>
                This name is displayed in the UI for easy identification.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormDescription>
                  Optional. Only enter if there is a specific job title you are
                  applying for.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="experiencelevel"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience Level</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Experience Level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {experiencelevels.map((exp) => (
                      <SelectItem key={exp} value={exp}>
                        {exp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A Next.js 15 and React 19 full stack web developer job that uses Drizzle ORM and Postgres for database management."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Be as specific as possible. The more information you provide,
                the better the interviews will be.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full "
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Save Job Information
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
