import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src="/placeholder.svg?key=qmrz5" alt="사용자" />
          <AvatarFallback>사용자</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>내 계정</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>프로필</DropdownMenuItem>
        <DropdownMenuItem>설정</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>로그아웃</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
