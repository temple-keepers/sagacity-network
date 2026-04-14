"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Mail, FileText, MessageSquare, LogOut } from "lucide-react";
import { logout } from "../actions";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Leads", href: "/admin/leads", icon: Users },
  { label: "Email Queue", href: "/admin/queue", icon: Mail },
  { label: "Templates", href: "/admin/templates", icon: FileText },
  { label: "Contacts", href: "/admin/contacts", icon: MessageSquare },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex" style={{ background: "#0A0814", color: "#F0ECF4" }}>
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col border-r" style={{ background: "#0D0B14", borderColor: "#1E1A2E" }}>
        <div className="p-5 border-b" style={{ borderColor: "#1E1A2E" }}>
          <div className="text-sm font-bold tracking-wider uppercase" style={{ fontFamily: "var(--font-display)" }}>
            Sagacity
          </div>
          <div className="text-[10px] tracking-[0.2em] uppercase mt-0.5" style={{ color: "#6E6479" }}>
            Admin Console
          </div>
        </div>

        <nav className="flex-1 py-3">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-5 py-2.5 text-sm transition-colors"
                style={{
                  color: active ? "#A668D0" : "#9A90A8",
                  background: active ? "rgba(166,104,208,0.08)" : "transparent",
                  borderRight: active ? "2px solid #A668D0" : "2px solid transparent",
                }}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: "#1E1A2E" }}>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-2 px-3 py-2 text-xs w-full rounded-lg transition-colors hover:bg-white/5"
              style={{ color: "#6E6479" }}
            >
              <LogOut size={14} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
