import { Logo } from "../icons";
import { UserNav } from "./user-nav";

export default function Header() {
    return (
        <div className="border-b">
            <div className="flex h-16 items-center px-4 md:px-8">
                <div className="flex items-center gap-2">
                    <Logo className="h-7 w-7 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight font-headline">PosturePulse</h1>
                </div>
                <div className="ml-auto flex items-center space-x-4">
                    <UserNav />
                </div>
            </div>
        </div>
    )
}
