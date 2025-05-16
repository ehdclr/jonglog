"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/user-button";
import { Search } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-6">
      <div className="flex flex-1 items-center gap-2 md:gap-4">
        <h1 className="text-xl font-semibold">개인 블로그</h1>
        <Button variant="outline" size="sm" className="ml-auto h-8 gap-1">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline-block">검색</span>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <ModeToggle />
        <UserButton />
      </div>
    </header>
  );
}
