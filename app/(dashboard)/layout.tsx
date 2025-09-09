import {
  OrganizationSwitcher,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

function Header() {
  return (
    <header className="bg-gray-100 border-b">
      <div className="container mx-auto flex justify-between items-center p-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold">
            DetailerAI
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-gray-600">
            <Link href="/dashboard" className="hover:text-black">Dashboard</Link>
            <Link href="/dashboard/clients" className="hover:text-black">Clients</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <OrganizationSwitcher />
          <UserButton />
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Header />
      <main className="container mx-auto p-4">{children}</main>
    </div>
  );
}