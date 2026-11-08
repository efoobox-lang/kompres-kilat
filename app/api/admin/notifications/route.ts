// File: app/api/admin/notifications/route.ts
// Handler API untuk Sistem Notifikasi & Peringatan Terpusat Admin

import { NextResponse } from 'next/server';
import { verifyAdminSession, isSameOrigin } from '@/lib/admin-auth';
import {
  getSystemNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  addSystemNotification,
} from '@/lib/notification-service';

export async function GET(request: Request) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Sesi administrator tidak valid.' }, { status: 401 });
  }

  try {
    const notifications = await getSystemNotifications();
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Gagal memuat notifikasi.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Permintaan lintas origin ditolak.' }, { status: 403 });
  }
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Sesi administrator tidak valid.' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { id, markAll } = body;

    if (markAll) {
      await markAllNotificationsAsRead();
      return NextResponse.json({ success: true, message: 'Semua notifikasi ditandai telah dibaca.' });
    }

    if (typeof id === 'string' && id) {
      await markNotificationAsRead(id);
      return NextResponse.json({ success: true, message: 'Notifikasi ditandai dibaca.' });
    }

    return NextResponse.json({ error: 'Parameter tidak valid.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Gagal memperbarui notifikasi.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Permintaan lintas origin ditolak.' }, { status: 403 });
  }
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Sesi administrator tidak valid.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID notifikasi wajib diberikan.' }, { status: 400 });
  }

  try {
    await deleteNotification(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Gagal menghapus notifikasi.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Permintaan lintas origin ditolak.' }, { status: 403 });
  }
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Sesi administrator tidak valid.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const newNotif = await addSystemNotification(body);
    return NextResponse.json({ success: true, notification: newNotif });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Gagal membuat notifikasi.' }, { status: 500 });
  }
}
