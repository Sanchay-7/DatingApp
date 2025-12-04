'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { authFetch } from '@/lib/apiClient';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Log all query parameters for debugging
        const allParams = {};
        searchParams.forEach((value, key) => {
          allParams[key] = value;
        });
        console.log('Payment callback params:', allParams);

        // Try different parameter names that Cashfree might use
        const orderId = searchParams.get('orderId') || searchParams.get('order_id');
        const txStatus = searchParams.get('txStatus') || searchParams.get('order_status');
        const cfPaymentId = searchParams.get('cfPaymentId') || searchParams.get('cf_payment_id') || searchParams.get('payment_id');

        if (!orderId) {
          setStatus('error');
          setMessage('No order ID found. Payment verification failed.');
          console.error('Missing orderId in params:', allParams);
          return;
        }

        // Verify payment with backend
        const response = await authFetch('/api/payment/verify', {
          method: 'POST',
          body: {
            orderId,
            cfPaymentId: cfPaymentId || 'manual_verification',
            txStatus: txStatus || 'PENDING',
          },
        });

        if (response.payment?.status === 'SUCCESS') {
          setStatus('success');
          setMessage('Payment successful! Your premium subscription is now active.');

          // Redirect after 3 seconds
          setTimeout(() => {
            router.push('/dashboard/user/premium');
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Payment failed. Please try again.');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Payment verification failed');
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <Loader className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Payment
            </h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">
              Redirecting to premium features in 3 seconds...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => router.push('/dashboard/user/premium')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Back to Premium
            </button>
          </>
        )}
      </div>
    </div>
  );
}
