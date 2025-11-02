
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  BrainCircuit,
  FileText
} from 'lucide-react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

const adminMenuItems = [
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

const userMenuItems = [
  {
    href: '/my-applications',
    label: 'My Applications',
    icon: FileText,
  },
  {
    href: '/jobs',
    label: 'Browse Jobs',
    icon: Briefcase,
  }
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();
  const [menuItems, setMenuItems] = useState(userMenuItems);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user && firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const role = userDoc.data()?.role;
          setUserRole(role);
          if (role === 'Admin' || role === 'HR' || role === 'Manager') {
            setMenuItems(adminMenuItems);
          } else {
            setMenuItems(userMenuItems);
          }
        } else {
            setMenuItems(userMenuItems);
        }
      } else {
        setMenuItems(userMenuItems);
      }
    };

    fetchUserRole();
  }, [user, firestore]);

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <Link href={userRole === 'Admin' || userRole === 'HR' ? "/dashboard" : "/my-applications"} className="flex items-center gap-2">
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
    </Sidebar>
  );
}
