'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Zap, Star } from 'lucide-react';
import { authFetch, clearAuthToken } from '@/lib/apiClient';

const PREMIUM_TIERS = [
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: 9,
    priceMonthly: 9,
    description: 'Get unlimited likes and enhanced features',
    color: 'from-purple-500 to-purple-700',
    features: [
      { name: 'Unlimited likes per day', boost: true },
      { name: 'Unlimited backtracks', boost: true },
      { name: 'See who likes you (Beeline)', boost: true },
      { name: 'Advanced filters', boost: true },
      { name: 'Incognito mode', boost: true },
      { name: '5 SuperSwipes per week', boost: true },
      { name: '1 Spotlight per month', boost: true },
      { name: 'Unlimited Extends', boost: true },
      { name: 'Unlimited Rematch', boost: true },
      { name: 'Priority support', boost: true },
    ],
    isBest: true,
  },
];

export default function PremiumPage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [userTier, setUserTier] = useState('FREE');
  const [userGender, setUserGender] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [proofFile, setProofFile] = useState(null);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    // Load user's current subscription tier and gender
    const loadUserData = async () => {
      try {
        const response = await authFetch('/api/user/me');
        const backendTier = response.user?.subscriptionTier || 'FREE';
        const normalizedTier = backendTier === 'PREMIUM_MAN' ? 'PREMIUM' : backendTier;
        setUserTier(normalizedTier);
        setUserGender(response.user?.gender);
        
        // Redirect women to dashboard (premium is only for men)
        {
          const g = String(response.user?.gender || '').toLowerCase();
          const isWoman = g === 'woman' || g === 'female';
          if (isWoman) {
          router.push('/dashboard');
          }
        }
      } catch (err) {
        console.error('Failed to load user data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, [router]);

  const handleUpgrade = async (tier) => {
    // Normalize current tier for comparison
    const currentTier = userTier === 'PREMIUM_MAN' ? 'PREMIUM' : userTier;
    if (currentTier === tier) {
      setErrorMessage(`You already have ${tier} subscription`);
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await authFetch('/api/user/me');
      const user = response.user;

      // Create payment order
      const orderResponse = await authFetch('/api/payment/create', {
        method: 'POST',
        body: {
          userId: user.id,
          amount: 9,
          email: user.email,
          phone: user.phoneNumber,
          subscriptionTier: tier,
        },
      });

      if (orderResponse.paymentSessionId) {
        // Load Cashfree SDK and initiate payment
        const cashfree = await loadCashfreeSDK();
        
        const checkoutOptions = {
          paymentSessionId: orderResponse.paymentSessionId,
          returnUrl: `${window.location.origin}/payment-success?orderId=${orderResponse.orderId}`,
        };

        cashfree.checkout(checkoutOptions).then((result) => {
          if (result.error) {
            console.error('Payment error:', result.error);
            setErrorMessage(result.error.message || 'Payment failed');
            setIsProcessing(false);
          }
          // Payment success is handled by return URL
        });
      } else {
        setErrorMessage('Failed to initiate payment. Please try again.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setErrorMessage(err.message || 'Failed to process payment');
      setIsProcessing(false);
    }
  };

  // Alternate flow: open Cashfree hosted payment form (no automatic verification from Cashfree link alone)
  const handleHostedForm = (tier) => {
    setErrorMessage('');
    setSuccessMessage('');
    // NOTE: This just opens the hosted form. To auto-verify, Cashfree webhooks must be configured on the backend.
    window.open('https://payments.cashfree.com/forms/atafataf', '_blank', 'noopener');
  };

  // Upload manual payment proof (screenshot) - use direct fetch for file upload
  const handleProofUpload = async () => {
    // If no file selected yet, open file picker
    if (!proofFile) {
      fileInputRef.current?.click();
      return;
    }

    try {
      setErrorMessage('');
      setSuccessMessage('');
      setIsUploadingProof(true);

      const formData = new FormData();
      formData.append('proof', proofFile);
      formData.append('amount', '9');
      formData.append('subscriptionTier', 'PREMIUM');

      const token = window.localStorage.getItem('valise_token');
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000';
      
      // Quiet mode: avoid noisy console logs in production
      
      const response = await fetch(`${baseUrl}/api/payment/manual/proof`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // DON'T set Content-Type; browser will set it to multipart/form-data with boundary
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || `Upload failed: ${response.status}`);
      }

      setSuccessMessage(`✅ Screenshot uploaded successfully! File: ${proofFile.name} | Order ID: ${data.orderId}`);
      setProofFile(null);
      
      // Keep success message visible for 8 seconds
      setTimeout(() => setSuccessMessage(''), 8000);
    } catch (err) {
      // Suppress console noise; show concise UI error
      setErrorMessage(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploadingProof(false);
    }
  };

  // Handle file selection from file picker
  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      setErrorMessage('');
      // Suppress console noise during file selection
    }
  };

  // Load Cashfree SDK
  const loadCashfreeSDK = () => {
    return new Promise((resolve, reject) => {
      // Suppress PaymentJSInterface error on web
      if (typeof window !== 'undefined' && !window.PaymentJSInterface) {
        window.PaymentJSInterface = { handleError: () => {} };
      }

      if (window.Cashfree) {
        resolve(window.Cashfree({ mode: process.env.NEXT_PUBLIC_CASHFREE_ENV || 'sandbox' }));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = () => {
        resolve(window.Cashfree({ mode: process.env.NEXT_PUBLIC_CASHFREE_ENV || 'sandbox' }));
      };
      script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
      document.body.appendChild(script);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Women-only message and hard block render
  {
    const g = String(userGender || '').toLowerCase();
    const isWoman = g === 'woman' || g === 'female';
    if (isWoman) {
      return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-linear-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              You Already Have Everything!
            </h1>
            <p className="text-xl text-gray-700 mb-6">
              As a woman on our platform, you already enjoy unlimited likes, unlimited backtracks, and all premium features completely free.
            </p>
            <div className="space-y-3 inline-block text-left mb-8">
              <div className="flex items-center">
                <Check className="w-6 h-6 text-green-500 mr-3" />
                <span className="text-lg text-gray-700">Unlimited likes per day</span>
              </div>
              <div className="flex items-center">
                <Check className="w-6 h-6 text-green-500 mr-3" />
                <span className="text-lg text-gray-700">Unlimited backtracks</span>
              </div>
              <div className="flex items-center">
                <Check className="w-6 h-6 text-green-500 mr-3" />
                <span className="text-lg text-gray-700">All premium features</span>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-8 rounded-lg transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
      );
    }
  }

  // Men premium page
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
          Premium - Unlimited Likes
        </h1>
        <p className="text-lg text-gray-600">
          Get unlimited likes, backtracks, and premium features for just ₹9/month
        </p>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="max-w-6xl mx-auto mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="max-w-6xl mx-auto mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Current Status */}
      {userTier !== 'FREE' && (
        <div className="max-w-6xl mx-auto mb-8 p-4 bg-blue-100 text-blue-700 rounded-lg">
          ✓ You are subscribed to <strong>Premium</strong> at ₹9 per month
        </div>
      )}

      {/* Pricing Cards */}
      <div className="max-w-2xl mx-auto mb-12 w-full">
        {PREMIUM_TIERS.map((tier) => {
          // Show active plan for already subscribed users
          if (tier.id === userTier) {
            return (
              <div
                key={tier.id}
                className="relative rounded-2xl overflow-hidden shadow-2xl ring-2 ring-green-500"
              >
                <div className={`bg-linear-to-br ${tier.color} p-8 text-white`}>
                  <h2 className="text-3xl font-bold mb-2">{tier.name}</h2>
                  <p className="text-sm opacity-90 mb-6">{tier.description}</p>

                  <div className="mb-6">
                    <div className="text-5xl font-bold mb-2">
                      ₹{tier.priceMonthly.toLocaleString('en-IN')}
                    </div>
                    <p className="text-sm opacity-75">per month</p>
                  </div>

                  <div className="w-full py-3 rounded-lg font-semibold bg-green-500 text-white text-center mb-6">
                    ✓ Active Plan
                  </div>
                </div>

                <div className="bg-white p-8">
                  <h3 className="font-semibold text-gray-900 mb-4">What you have:</h3>
                  <ul className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="w-5 h-5 text-purple-500 mr-3 shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          }

          // Show upgrade option for free users
          return (
            <div
              key={tier.id}
              className={`relative rounded-2xl overflow-hidden transition-transform ${
                tier.isBest ? 'md:scale-105 shadow-2xl' : 'shadow-lg'
              }`}
            >
              {tier.isBest && (
                <div className="absolute top-0 right-0 bg-linear-to-r from-purple-500 to-purple-600 text-white px-4 py-1 rounded-bl-lg text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className={`bg-linear-to-br ${tier.color} p-8 text-white`}>
                <h2 className="text-3xl font-bold mb-2">{tier.name}</h2>
                <p className="text-sm opacity-90 mb-6">{tier.description}</p>

                <div className="mb-6">
                  <div className="text-5xl font-bold mb-2">
                    ₹{tier.priceMonthly.toLocaleString('en-IN')}
                  </div>
                  <p className="text-sm opacity-75">per month</p>
                </div>

                <div className="space-y-3">
                  {/* HIDDEN: Automatic payment gateway button */}
                  {/* 
                  <button
                    onClick={() => handleUpgrade(tier.id)}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-lg font-semibold transition bg-white text-gray-900 hover:bg-opacity-90 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Upgrade with Gateway (auto verify)'}
                  </button>
                  */}

                  <button
                    onClick={() => handleHostedForm(tier.id)}
                    className="w-full py-3 rounded-lg font-semibold transition bg-purple-50 text-purple-700 hover:bg-purple-100"
                  >
                    Pay via Cashfree Form (manual verify)
                  </button>

                  <div className="w-full rounded-lg border border-purple-100 bg-white/90 p-4 text-gray-800 space-y-3">
                    <p className="text-sm font-semibold text-purple-700">Upload payment screenshot for manual approval</p>
                    
                    {/* Hidden file input - triggered by button */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelected}
                      className="hidden"
                    />
                    
                    {/* Show selected filename if file is selected */}
                    {proofFile && (
                      <div className="bg-blue-50 p-2 rounded text-sm text-blue-800">
                        ✓ Selected: <strong>{proofFile.name}</strong> ({(proofFile.size / 1024).toFixed(2)} KB)
                      </div>
                    )}
                    
                    <button
                      onClick={handleProofUpload}
                      disabled={isUploadingProof}
                      className="w-full py-2 rounded-md font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition"
                    >
                      {isUploadingProof ? 'Uploading...' : proofFile ? 'Upload Screenshot' : '📸 Click to Select Screenshot'}
                    </button>
                    
                    <p className="text-xs text-gray-600">
                      After paying via the Cashfree form, upload your payment screenshot. Admin will review and activate your premium manually.
                    </p>
                  </div>

                  <p className="text-xs text-white/90 bg-white/15 p-3 rounded-lg">
                    Form option opens Cashfree hosted link. Auto-activation requires backend webhook verification; otherwise manual review is needed.
                  </p>
                </div>

                <div className="bg-white bg-opacity-20 p-4 rounded-lg mb-6">
                  <p className="text-xs opacity-75"><strong>Get unlimited likes</strong> (compared to 10 likes/day free)</p>
                  <p className="text-xs opacity-75"><strong>Only ₹9/month</strong> - Your access to premium features</p>
                </div>
              </div>

              <div className="bg-white p-8">
                <h3 className="font-semibold text-gray-900 mb-4">What you get:</h3>
                <ul className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-purple-600 mr-3 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="max-w-6xl mx-auto mt-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {[
            {
              q: 'Can I cancel my subscription anytime?',
              a: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.',
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept all major credit cards, debit cards, and digital wallets via Cashfree payment gateway.',
            },
            {
              q: 'Is there a free trial?',
              a: 'Currently, we do not offer a free trial, but you can upgrade and cancel within 24 hours for a full refund.',
            },
            {
              q: 'What is Unlimited Backtrack?',
              a: 'Unlimited Backtrack allows you to undo your last action (like/skip) without limit.',
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
              <p className="text-gray-600">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
