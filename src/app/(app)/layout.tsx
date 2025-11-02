import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/shared/sidebar';
import { Header } from '@/components/shared/header';
import { FirebaseClientProvider } from '@/firebase';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-col w-full">
          <Header />
          <main className="p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </SidebarProvider>
    </FirebaseClientProvider>
  );
}
