'use client';

import { useState } from 'react';
import { Bell, Radio } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminBroadcastView } from '@/features/admin/admin-broadcast-view';
import { NotificationsView } from '@/features/notifications/notifications-view';

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState('broadcast');

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="COMMUNICATIONS & DISPATCH"
        title="Administrative Broadcasts & Notifications"
        description="Dispatch role-targeted institutional broadcast alerts across the university community and review personal administrative notices."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="broadcast" className="text-xs font-semibold flex items-center gap-2">
            <Radio size={14} className="text-blue-600" />
            System Broadcast Dispatch
          </TabsTrigger>
          <TabsTrigger value="inbox" className="text-xs font-semibold flex items-center gap-2">
            <Bell size={14} className="text-slate-600" />
            My Notifications Inbox
          </TabsTrigger>
        </TabsList>

        <TabsContent value="broadcast" className="pt-4">
          <AdminBroadcastView basePath="/admin" />
        </TabsContent>

        <TabsContent value="inbox" className="pt-4">
          <NotificationsView currentRole="SUPER_ADMIN" basePath="/admin" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
