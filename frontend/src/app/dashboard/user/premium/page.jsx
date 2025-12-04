'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Zap, Star } from 'lucide-react';
import { authFetch, clearAuthToken } from '@/lib/apiClient';

const PREMIUM_TIERS = [
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: 1999,
    priceMonthly: 1999,
    description: 'Unlock premium features to enhance your dating experience',
    color: 'from-amber-400 to-amber-600',
    features: [
      { name: '30 likes per day', premium: true, boost: false },
      { name: '2 backtracks per day', premium: true, boost: false },
      { name: 'See who likes you (Beeline)', premium: true, boost: true },
      { name: 'Advanced filters', premium: true, boost: true },
      { name: 'Incognito mode', premium: true, boost: true },
      { name: '5 SuperSwipes per week', premium: true, boost: true },
      { name: '1 Spotlight per month', premium: true, boost: true },
      { name: 'Unlimited Extends', premium: true, boost: true },
      { name: 'Unlimited Rematch', premium: true, boost: true },
      { name: 'Priority support', premium: true, boost: true },
    ],
    isBest: false,
  },
  {
    id: 'BOOST',
    name: 'Boost',
    price: 2999,
    priceMonthly: 2999,
    description: 'Get unlimited access and swipe anywhere in the world',
    color: 'from-purple-400 to-purple-600',
    features: [
      { name: '✨ Unlimited likes', premium: false, boost: true },
      { name: '✨ Unlimited backtracks', premium: false, boost: true },
      { name: '✨ Travel mode - Swipe anywhere', premium: false, boost: true },
      { name: 'See who likes you (Beeline)', premium: true, boost: true },
      { name: 'Advanced filters', premium: true, boost: true },
      { name: 'Incognito mode', premium: true, boost: true },
      { name: '5 SuperSwipes per week', premium: true, boost: true },
      { name: '1 Spotlight per month', premium: true, boost: true },
      { name: 'Unlimited Extends', premium: true, boost: true },
      { name: 'Unlimited Rematch', premium: true, boost: true },
    ],
    isBest: true,
  },
];

export default function PremiumPage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userTier, setUserTier] = useState('FREE');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Load user's current subscription tier
    const loadUserTier = async () => {
      try {
        const response = await authFetch('/api/user/me');
        setUserTier(response.user?.subscriptionTier || 'FREE');
      } catch (err) {
        console.error('Failed to load user tier:', err);
      }
    };
    loadUserTier();
  }, []);

  const handleUpgrade = async (tier) => {
    if (userTier === tier) {
      setErrorMessage(`You already have ${tier} subscription`);
      return;
    }

    // Prevent downgrade from BOOST to PREMIUM
    if (userTier === 'BOOST' && tier === 'PREMIUM') {
      setErrorMessage('You already have the Boost subscription which includes all Premium features');
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
          amount: tier === 'BOOST' ? 2999 : 1999,
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

  // Load Cashfree SDK
  const loadCashfreeSDK = () => {
    return new Promise((resolve, reject) => {
      if (window.Cashfree) {
        resolve(window.Cashfree({ mode: 'sandbox' })); // Change to 'production' for live
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = () => {
        resolve(window.Cashfree({ mode: 'sandbox' })); // Change to 'production' for live
      };
      script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
      document.body.appendChild(script);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
          Premium
        </h1>
        <p className="text-lg text-gray-600">
          Unlock all of our features to be in complete control of your experience
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
          ✓ You currently have <strong>{userTier}</strong> subscription
        </div>
      )}

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {PREMIUM_TIERS.map((tier) => {
          // Hide Premium card if user has Boost
          if (tier.id === 'PREMIUM' && userTier === 'BOOST') {
            return null;
          }

          // Hide Boost card if user already has Boost
          if (tier.id === 'BOOST' && userTier === 'BOOST') {
            return (
              <div
                key={tier.id}
                className="relative rounded-2xl overflow-hidden shadow-2xl ring-2 ring-green-500"
              >
                <div className={`bg-gradient-to-br ${tier.color} p-8 text-white`}>
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
                        <Check className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          }

          return (
            <div
              key={tier.id}
              className={`relative rounded-2xl overflow-hidden transition-transform ${
                tier.isBest ? 'md:scale-105 shadow-2xl' : 'shadow-lg'
              } ${tier.id === userTier ? 'ring-2 ring-green-500' : ''}`}
            >
              {tier.isBest && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-1 rounded-bl-lg text-sm font-semibold">
                  Best Value
                </div>
              )}

              <div className={`bg-gradient-to-br ${tier.color} p-8 text-white`}>
                <h2 className="text-3xl font-bold mb-2">{tier.name}</h2>
                <p className="text-sm opacity-90 mb-6">{tier.description}</p>

                <div className="mb-6">
                  <div className="text-5xl font-bold mb-2">
                    ₹{tier.priceMonthly.toLocaleString('en-IN')}
                  </div>
                  <p className="text-sm opacity-75">per month</p>
                </div>

                <button
                  onClick={() => handleUpgrade(tier.id)}
                  disabled={isProcessing || tier.id === userTier}
                  className={`w-full py-3 rounded-lg font-semibold transition mb-6 ${
                    tier.id === userTier
                      ? 'bg-white bg-opacity-30 text-white cursor-not-allowed'
                      : 'bg-white text-gray-900 hover:bg-opacity-90'
                  } disabled:opacity-50`}
                >
                  {isProcessing
                    ? 'Processing...'
                    : tier.id === userTier
                    ? 'Current Plan'
                    : 'Upgrade'}
                </button>
              </div>

              <div className="bg-white p-8">
                <h3 className="font-semibold text-gray-900 mb-4">What you get:</h3>
                <ul className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Feature Comparison
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">
                    What you get:
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-600">
                    Premium
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-600">
                    Boost
                  </th>
                </tr>
              </thead>
              <tbody>
                {PREMIUM_TIERS[0].features.map((feature, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-gray-700 font-medium">
                      {feature.name}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {feature.premium ? (
                        <Check className="w-5 h-5 text-amber-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {feature.boost ? (
                        <Check className="w-5 h-5 text-purple-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
