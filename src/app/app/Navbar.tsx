"use client";
import { UserAvatar } from "@/features/user/UserAvatar";
import { DropdownMenu, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { SignOutButton, useClerk } from "@clerk/nextjs"
import {
  BookOpenIcon,
  BrainCircuitIcon,
  FileSlidersIcon,
  LogOut,
  SpeechIcon,
  User,
} from "lucide-react"
import Link from "next/link";
import { DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

export  function Navbar({
  user,
}: {
  user: { name: string; imageUrl: string };
}) {
      const { openUserProfile } = useClerk()
    
    return(
    <nav className="h-full border-b p-4">
        <div className="flex justify-between items-center container h-full">
             <Link href="/app" className="flex items-center gap-2">
          <BrainCircuitIcon className="size-8 text-primary" />
          <span className="text-xl font-bold text-white ">JOB-Prep</span>
       </Link>



         <DropdownMenu>
            <DropdownMenuTrigger>
                <UserAvatar user={user}/>
            </DropdownMenuTrigger>

           <DropdownMenuContent align="end" className="w-50">
            <DropdownMenuItem onClick={()=>openUserProfile()}>
                <User className="mr-2"/>
              <span className="text-white">Profile</span>
            </DropdownMenuItem>


                <SignOutButton>
            <DropdownMenuItem>
                <LogOut className="mr-2"/>
                   <span className="text-white">Signout</span>
            </DropdownMenuItem>
                </SignOutButton>

           </DropdownMenuContent>


         </DropdownMenu>

        </div>





    </nav>






)}
