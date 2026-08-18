"use client";

import Link from "next/link";

import { Brand } from "@/components/layout/brand";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { useProfile } from "@/store/profile-store";

/** Sidebar fixa do desktop. No mobile ela é substituída pelo drawer. */
export function Sidebar() {
  const { profile } = useProfile();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center px-5">
        <Link href="/dashboard" className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <Brand />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <SidebarNav />
      </div>

      <div className="border-t border-border p-2">
        <UserMenu user={profile} />
      </div>
    </aside>
  );
}
