
import { getcurrentUser } from "@/lib/getCurrentUser";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Navbar } from "./Navbar";






export default async function AppLayout({children}: {children:ReactNode}){
const {userId,user} = await getcurrentUser({allData:true})
if (userId == null) return redirect("/")
if (user == null) return redirect("/onboarding")
     return ( 
    <>
    <Navbar user={user}/>
    {children}
    </>
    )
}