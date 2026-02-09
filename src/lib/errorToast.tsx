import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"

export function errorToast(message:string){
    toast.error(message)

}