'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';

const StepSelfie = ({ formData, updateFormData, goToNext }) => {
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [cameraStarted, setCameraStarted] = useState(false);
    const [isRequestingPermission, setIsRequestingPermission] = useState(false);
    const [useFileUpload, setUseFileUpload] = useState(false);
    
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    // Check browser support on mount
    useEffect(() => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn('[CAMERA] getUserMedia not supported - showing file upload option');
            setError('📷 Live camera not available in this browser.\n\n✅ You can upload a selfie photo instead using the button below.');
            setUseFileUpload(true);
        }
    }, []);

    // Start camera
    const startCamera = async () => {
        try {
            setError('');
            setIsRequestingPermission(true);
            
            console.log('[CAMERA] Requesting camera access...');
            
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.error('[CAMERA] getUserMedia not supported');
                setError('📷 Live camera not supported in this browser.\n\nPlease use the file upload option below to upload your selfie instead.\n\n✅ Supported browsers: Chrome, Firefox, Safari, Edge (latest versions)');
                setIsRequestingPermission(false);
                setUseFileUpload(true); // Automatically show file upload option
                return;
            }

            console.log('[CAMERA] getUserMedia supported, requesting permission...');
            
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user' // Front camera
                },
                audio: false
            });
            
            console.log('[CAMERA] Permission granted! Stream obtained:', mediaStream);
            console.log('[CAMERA] Active tracks:', mediaStream.getVideoTracks());
            
            setStream(mediaStream);
            setCameraStarted(true);
            
            // Use useEffect to handle video element after state update
            setTimeout(() => {
                if (videoRef.current && mediaStream) {
                    console.log('[CAMERA] Setting srcObject on video element');
                    videoRef.current.srcObject = mediaStream;
                    videoRef.current.play()
                        .then(() => console.log('[CAMERA] Video playing successfully'))
                        .catch(err => console.error('[CAMERA] Play error:', err));
                }
            }, 100);
        } catch (err) {
            console.error('[CAMERA] Error accessing camera:', err);
            console.error('[CAMERA] Error name:', err.name);
            console.error('[CAMERA] Error message:', err.message);
            
            // Provide specific error messages
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('❌ Camera permission blocked. To enable it:\n\n1. Click the lock/camera icon 🔒 in the address bar\n2. Find "Camera" in the popup menu\n3. Change from "Block" to "Allow"\n4. Refresh this page and try again\n\nOr use the file upload option below as an alternative.');
                setUseFileUpload(true); // Show fallback option
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setError('❌ No camera detected. Please connect a camera and try again.');
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                setError('❌ Camera is already in use by another app. Close other apps using the camera (Zoom, Teams, etc.) and try again.');
            } else if (err.name === 'OverconstrainedError') {
                setError('❌ Camera does not meet requirements. Try a different camera or browser.');
            } else if (err.name === 'SecurityError') {
                setError('❌ Camera blocked for security. Ensure you\'re on HTTPS (secure connection) or localhost.');
            } else {
                setError(`❌ Camera access failed: ${err.message || 'Unknown error'}\n\nTroubleshooting:\n- Check browser camera permissions\n- Try a different browser\n- Restart your computer`);
                setUseFileUpload(true);
            }
        } finally {
            setIsRequestingPermission(false);
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setCameraStarted(false);
        }
    };

    // Capture photo from video stream
    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob
        canvas.toBlob((blob) => {
            const imageUrl = URL.createObjectURL(blob);
            setCapturedImage({ blob, url: imageUrl });
            stopCamera(); // Stop camera after capture
        }, 'image/jpeg', 0.95);
    };

    // Retake photo
    const retakePhoto = () => {
        if (capturedImage) {
            URL.revokeObjectURL(capturedImage.url);
            setCapturedImage(null);
        }
        startCamera();
    };

    // Upload selfie to Cloudinary
    const uploadSelfie = async () => {
        if (!capturedImage) return;

        setIsUploading(true);
        setError('');

        try {
            const token = localStorage.getItem('valise_token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
            
            // Create FormData for upload
            const uploadFormData = new FormData();
            // Handle both blob (from camera) and file (from file input)
            if (capturedImage.blob) {
                uploadFormData.append('image', capturedImage.blob, 'selfie.jpg');
            } else if (capturedImage.file) {
                uploadFormData.append('image', capturedImage.file);
            } else {
                throw new Error('No image data found');
            }

            const uploadResponse = await fetch(`${API_BASE}/api/user/upload-image`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: uploadFormData,
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload selfie');
            }

            const uploadData = await uploadResponse.json();

            // Update form data with selfie info
            updateFormData({
                ...formData,
                selfiePhotoUrl: uploadData.url,
                selfiePublicId: uploadData.public_id,
            });

            // Move to next step
            goToNext();
        } catch (err) {
            console.error('Upload error:', err);
            setError('❌ Failed to upload selfie. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    // Handle file upload as fallback
    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Create preview URL and store file
        const previewUrl = URL.createObjectURL(file);
        setCapturedImage({ file, url: previewUrl });
        setError('');
        
        // Note: Upload happens when user clicks "Confirm & Continue"
        // This just shows the preview
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
            if (capturedImage) {
                URL.revokeObjectURL(capturedImage.url);
            }
        };
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl w-full">
            {/* LEFT COLUMN: Camera/Photo */}
            <section className="col-span-1">
                <h2 className="text-4xl font-bold mb-4">Verify Your Identity</h2>
                <p className="text-gray-400 mb-8">
                    Take a live selfie for verification. This helps keep our community safe and authentic.
                </p>

                {/* Camera/Photo Display */}
                <div className="relative w-full aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700">
                    {!cameraStarted && !capturedImage && !useFileUpload && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <Camera className="w-16 h-16 text-gray-600 mb-4" />
                            <button
                                onClick={startCamera}
                                disabled={isRequestingPermission}
                                className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isRequestingPermission ? (
                                    <>
                                        <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Requesting Access...
                                    </>
                                ) : (
                                    'Start Camera'
                                )}
                            </button>
                            {isRequestingPermission && (
                                <p className="text-yellow-400 text-sm mt-4 animate-pulse">
                                    Please allow camera access in the browser prompt
                                </p>
                            )}
                        </div>
                    )}

                    {/* File Upload Fallback */}
                    {!cameraStarted && !capturedImage && useFileUpload && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                            <Camera className="w-16 h-16 text-yellow-500 mb-4" />
                            <p className="text-yellow-400 text-sm mb-4 text-center">Camera permission blocked</p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
                            >
                                📁 Upload Selfie Photo
                            </button>
                            <p className="text-gray-400 text-xs mt-3 text-center">
                                Select a recent selfie photo from your device
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </div>
                    )}

                    {/* Video Stream */}
                    {cameraStarted && !capturedImage && (
                        <div className="absolute inset-0 w-full h-full bg-black">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Captured Image Preview */}
                    {capturedImage && (
                        <img
                            src={capturedImage.url}
                            alt="Captured selfie"
                            className="w-full h-full object-cover"
                        />
                    )}

                    {/* Hidden canvas for capture */}
                    <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-3 bg-red-900/30 border border-red-500 rounded-lg flex items-start">
                        <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex gap-4">
                    {/* Capture button - only show when camera is started and no image captured */}
                    {cameraStarted && !capturedImage && (
                        <button
                            onClick={capturePhoto}
                            className="flex-1 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold transition flex items-center justify-center"
                        >
                            <Camera className="w-5 h-5 mr-2" />
                            Capture Photo
                        </button>
                    )}

                    {/* Retake and Continue buttons - show when image is captured (from camera OR file) */}
                    {capturedImage && !cameraStarted && (
                        <>
                            <button
                                onClick={() => {
                                    if (capturedImage) {
                                        URL.revokeObjectURL(capturedImage.url);
                                        setCapturedImage(null);
                                    }
                                    if (useFileUpload) {
                                        // If using file upload, clear the file input and reset
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                        setUseFileUpload(false);
                                        setError('');
                                    } else {
                                        // If using camera, restart camera
                                        startCamera();
                                    }
                                }}
                                disabled={isUploading}
                                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RotateCcw className="w-5 h-5 mr-2" />
                                {useFileUpload ? 'Choose Different' : 'Retake'}
                            </button>
                            <button
                                onClick={uploadSelfie}
                                disabled={isUploading}
                                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Confirm & Continue
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </section>

            {/* RIGHT COLUMN: Instructions */}
            <aside className="col-span-1 hidden md:block border-l border-gray-800 pl-8 pt-2">
                <h3 className="text-xl font-semibold mb-4 text-white">Verification Guidelines</h3>
                <p className="text-gray-400 mb-6">
                    Your selfie helps us verify your identity and maintain a safe community for all users.
                </p>
                <ul className="space-y-3 text-gray-400">
                    <li className="flex items-start">
                        <span className="text-white mr-2">✅</span> Face the camera directly
                    </li>
                    <li className="flex items-start">
                        <span className="text-white mr-2">✅</span> Ensure good lighting
                    </li>
                    <li className="flex items-start">
                        <span className="text-white mr-2">✅</span> Remove sunglasses or hats
                    </li>
                    <li className="flex items-start">
                        <span className="text-white mr-2">✅</span> Make sure your face is clearly visible
                    </li>
                    <li className="flex items-start">
                        <span className="text-white mr-2">🔒</span> Your photo will be reviewed by our team
                    </li>
                </ul>
                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-300">
                        <strong>Note:</strong> Your selfie is used for verification only and will be compared with your profile photos by our admin team before activating your account.
                    </p>
                </div>
                <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                    <p className="text-sm text-yellow-300 font-semibold mb-2">
                        Camera Permission Required
                    </p>
                    <p className="text-xs text-yellow-200">
                        If you see a permission blocked message, click the camera icon 🎥 in your browser's address bar and select "Allow". You may need to refresh the page after granting permission.
                    </p>
                </div>
            </aside>
        </div>
    );
};

export default StepSelfie;
