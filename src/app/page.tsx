import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SignInButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-4">
        <UserButton />
        <SignInButton />
        <ThemeToggle/>
      </div>
    </div>
  );
}
