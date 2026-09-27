"use client";

import { useRouter } from "next/navigation";
import { BellIcon, CheckIcon, ChevronRightIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Notice } from "./notifications";

/* Bell next to the avatar in the mobile topbar. Lists what's still to see or
 * do (see notifications.ts); a dot marks that there's something. Items clear
 * themselves once done, so there's no "mark as read" to manage. */
export function NotificationsBell({ notices }: { notices: Notice[] }) {
  const router = useRouter();
  const count = notices.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="relative inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        }
      >
        <BellIcon className="size-[18px]" />
        {count > 0 && (
          <span
            aria-hidden
            className="absolute right-0.5 top-0.5 size-2 rounded-full bg-primary ring-2 ring-sidebar"
          />
        )}
        <span className="sr-only">
          {count > 0 ? `${count} notification${count === 1 ? "" : "s"}` : "Notifications"}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[min(20rem,calc(100vw-2rem))] rounded-lg" align="end" sideOffset={8}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            {count > 0 ? "To do" : "Notifications"}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {count === 0 ? (
          <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
            <CheckIcon className="size-4" />
            You&apos;re all caught up.
          </div>
        ) : (
          <DropdownMenuGroup>
            {notices.map((n) => (
              <DropdownMenuItem key={n.id} onClick={() => router.push(n.href)} className="items-start gap-2.5 py-2">
                <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-medium leading-snug">{n.title}</span>
                  <span className="text-xs leading-snug text-muted-foreground">{n.detail}</span>
                </span>
                <ChevronRightIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
