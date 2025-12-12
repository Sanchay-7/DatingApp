'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, Users, CheckSquare, BarChart2 } from 'lucide-react';
import { adminFetch } from '@/lib/apiClient';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    pendingPayments: 0,
    activeUsers: 0,
    totalReports: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load pending payments
      const paymentRes = await adminFetch('/api/payment/manual/pending');
      setStats(prev => ({ ...prev, pendingPayments: paymentRes.proofs?.length || 0 }));
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage platform operations and review user activities</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/payments" className="group">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Payment Reviews</p>
                <p className="text-3xl font-bold text-purple-600">{stats.pendingPayments}</p>
              </div>
              <CreditCard className="w-12 h-12 text-purple-500 group-hover:scale-110 transition" />
            </div>
          </div>
        </Link>

        <Link href="/admin/users" className="group">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">User Management</p>
                <p className="text-3xl font-bold text-blue-600">→</p>
              </div>
              <Users className="w-12 h-12 text-blue-500 group-hover:scale-110 transition" />
            </div>
          </div>
        </Link>

        <Link href="/admin/moderation" className="group">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Moderation</p>
                <p className="text-3xl font-bold text-orange-600">→</p>
              </div>
              <CheckSquare className="w-12 h-12 text-orange-500 group-hover:scale-110 transition" />
            </div>
          </div>
        </Link>

        <Link href="/admin/analytics" className="group">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Analytics</p>
                <p className="text-3xl font-bold text-green-600">→</p>
              </div>
              <BarChart2 className="w-12 h-12 text-green-500 group-hover:scale-110 transition" />
            </div>
          </div>
        </Link>
      </div>

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Welcome Back, Administrator</h2>
        <p className="text-purple-100 mb-4">
          Use the navigation menu on the left to access different admin sections. Your primary task now is to verify pending payment proofs and approve or reject them.
        </p>
        <Link
          href="/admin/payments"
          className="inline-block mt-4 px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition"
        >
          Start Reviewing Payments
        </Link>
      </div>
    </div>
  );
}
