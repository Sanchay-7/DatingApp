'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { adminFetch } from '@/lib/apiClient';

export default function PaymentVerificationPage() {
  const [pendingProofs, setPendingProofs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedProof, setSelectedProof] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    loadPendingProofs();
  }, []);

  const loadPendingProofs = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const response = await adminFetch('/api/payment/manual/pending');
      setPendingProofs(response.proofs || []);
      
      if (response.proofs?.length === 0) {
        setSuccessMessage('✓ All payment proofs have been verified!');
      }
    } catch (err) {
      console.error('Failed to load pending proofs:', err);
      setErrorMessage(`Failed to load proofs: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecision = async (orderId, approve) => {
    try {
      setErrorMessage('');
      setSuccessMessage('');
      setProcessingOrderId(orderId);

      const response = await adminFetch(`/api/payment/manual/${orderId}/decision`, {
        method: 'POST',
        body: {
          approve,
          note: adminNote || undefined,
        },
      });

      if (approve) {
        setSuccessMessage(`✅ Payment approved! Subscription activated for user.`);
      } else {
        setSuccessMessage(`❌ Payment rejected. User will be notified.`);
      }

      // Reload proofs after decision
      setAdminNote('');
      setSelectedProof(null);
      setShowImageModal(false);
      
      setTimeout(() => {
        loadPendingProofs();
      }, 1500);
    } catch (err) {
      console.error('Failed to process decision:', err);
      setErrorMessage(`Failed to process: ${err.message}`);
    } finally {
      setProcessingOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading pending payment proofs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Proof Verification</h1>
          <p className="text-gray-600">Review and verify user payment screenshots</p>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg flex items-start gap-3">
            <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>{successMessage}</div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Verification</p>
                <p className="text-3xl font-bold text-purple-600">{pendingProofs.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-blue-600">{pendingProofs.length}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Awaiting Action</p>
                <p className="text-3xl font-bold text-red-600">{pendingProofs.length}</p>
              </div>
              <X className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Pending Proofs List */}
        {pendingProofs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All Clear!</h3>
            <p className="text-gray-600">All payment proofs have been verified.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Screenshot</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Submitted</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pendingProofs.map((proof) => (
                    <tr key={proof.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {proof.user?.firstName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{proof.user?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{proof.user?.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          ₹{proof.amount.toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 font-mono">{proof.orderId.substring(0, 20)}...</div>
                      </td>
                      <td className="px-6 py-4">
                        {proof.proofUrl ? (
                          <button
                            onClick={() => {
                              setSelectedProof(proof);
                              setShowImageModal(true);
                              setAdminNote('');
                            }}
                            className="text-sm text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500 italic">No image</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {new Date(proof.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedProof(proof);
                            setShowImageModal(true);
                            setAdminNote('');
                          }}
                          className="text-sm text-purple-600 hover:text-purple-700 font-semibold px-3 py-1 bg-purple-100 rounded hover:bg-purple-200 transition"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Image Verification Modal */}
        {showImageModal && selectedProof && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Review Payment Proof</h2>
                  <p className="text-purple-100 text-sm mt-1">Order ID: {selectedProof.orderId}</p>
                </div>
                <button
                  onClick={() => {
                    setShowImageModal(false);
                    setSelectedProof(null);
                    setAdminNote('');
                  }}
                  className="text-white hover:bg-purple-700 p-2 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* User Details */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900 mb-3">User Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedProof.user?.firstName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedProof.user?.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-sm text-gray-900 break-all">{selectedProof.user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="text-sm text-gray-900">{selectedProof.user?.phoneNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="text-lg font-semibold text-gray-900">₹{selectedProof.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Currency</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedProof.currency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Subscription Tier</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedProof.subscriptionTier}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Submitted</p>
                      <p className="text-sm text-gray-900">{new Date(selectedProof.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Screenshot */}
                {selectedProof.proofUrl ? (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Payment Screenshot</h3>
                    <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
                      <img
                        src={selectedProof.proofUrl}
                        alt="Payment proof"
                        className="max-w-full max-h-[500px] rounded-lg shadow-lg"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-800">No Screenshot Provided</p>
                        <p className="text-sm text-yellow-700 mt-1">User submitted payment without uploading a screenshot.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                <div className="space-y-3">
                  <label className="block">
                    <p className="font-semibold text-gray-900 mb-2">Admin Notes (Optional)</p>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Add notes about this payment verification (e.g., screenshot looks authentic, duplicate payment, etc.)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      rows="3"
                    />
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => handleDecision(selectedProof.orderId, true)}
                    disabled={processingOrderId === selectedProof.orderId}
                    className="flex-1 py-3 rounded-lg font-semibold bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    {processingOrderId === selectedProof.orderId ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Approve & Activate
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDecision(selectedProof.orderId, false)}
                    disabled={processingOrderId === selectedProof.orderId}
                    className="flex-1 py-3 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    {processingOrderId === selectedProof.orderId ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5" />
                        Reject Payment
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setShowImageModal(false);
                      setSelectedProof(null);
                      setAdminNote('');
                    }}
                    disabled={processingOrderId === selectedProof.orderId}
                    className="flex-1 py-3 rounded-lg font-semibold bg-gray-300 text-gray-900 hover:bg-gray-400 disabled:opacity-50 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
