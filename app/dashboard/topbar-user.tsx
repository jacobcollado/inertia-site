"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  LogOutIcon,
  SettingsIcon,
  ArrowLeftIcon,
  UserCircleIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "./actions";
import { AccountDialog } from "./account-dialog";

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

/* Account menu in the topbar, next to the page title.
 *
 * Mobile only. NavUser offers the same items, but it lives in the sidebar
 * footer, and the sidebar isn't rendered on mobile at all, so signing out or
 * getting back to the site had no entry point there. Desktop keeps NavUser
 * and hides this, rather than showing the menu twice.
 */
export function TopbarUser({
  email,
  displayName,
  avatarUrl: initialAvatarUrl,
}: {
  email: string;
  displayName: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [accountOpen, setAccountOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              // inline-flex + size-7 so the button is exactly the avatar's box:
              // a bare button would size to the line box and sit a pixel or two
              // off the vertical centre of a h-14 header row.
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-full outline-none ring-offset-1 ring-offset-sidebar transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
            />
          }
        >
          <Avatar className="size-7 shrink-0">
            {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
            <AvatarFallback className="text-[11px]">{initials(displayName)}</AvatarFallback>
          </Avatar>
          <span className="sr-only">Account menu</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="min-w-56 rounded-lg" align="end" sideOffset={8}>
          <DropdownMenuGroup>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
                  <AvatarFallback>{initials(displayName)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">{email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setAccountOpen(true)}>
              <UserCircleIcon />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
              <SettingsIcon />
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push("/")}>
              <ArrowLeftIcon />
              Back to site
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={pending}
            onClick={() => startTransition(() => signOut())}
          >
            <LogOutIcon />
            {pending ? "Signing out…" : "Log out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AccountDialog
        open={accountOpen}
        onOpenChange={setAccountOpen}
        displayName={displayName}
        email={email}
        avatarUrl={avatarUrl}
        onAvatarChange={setAvatarUrl}
      />
    </>
  );
}
