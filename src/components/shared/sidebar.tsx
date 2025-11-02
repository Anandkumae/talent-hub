
'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  BrainCircuit,
  Settings,
  ChevronLeft,
  LogOut,
  User,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const menuItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/jobs',
    label: 'Jobs',
    icon: Briefcase,
  },
  {
    href: '/candidates',
    label: 'Candidates',
    icon: Users,
  },
  {
    href: '/ai-matcher',
    label: 'AI Matcher',
    icon: BrainCircuit,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    if(auth){
      await signOut(auth);
      router.push('/login');
    }
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Briefcase className="size-5 text-primary" />
          </Button>
          <span className="text-lg font-semibold text-sidebar-foreground">
            Talent Hub
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-sidebar-accent">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user?.photoURL ?? "https://picsum.photos/seed/user/200/200"}
                  alt={user?.displayName ?? "Admin User"}
                  data-ai-hint="person face"
                />
                <AvatarFallback>{user?.email?.[0].toUpperCase() ?? 'AU'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium text-sidebar-foreground">
                  {user?.displayName ?? 'Admin User'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.email ?? 'admin@corp.com'}
                </span>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
