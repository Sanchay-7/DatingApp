// components/onboarding/Step4_Review.jsx

import React from 'react';

const Step4_Review = ({ formData }) => {
    // Helper to safely get nested preference data
    const preferences = formData.preferences || {};
    const birthday = formData.birthday || {};

    // Convert basic birthday data to a display string (simplified)
    const dateDisplay = (birthday.day && birthday.month && birthday.year)
        ? `${birthday.month}/${birthday.day}/${birthday.year}`
        : 'Not set';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl w-full">

            {/* LEFT COLUMN: Main Review */}
            <section className="col-span-1 space-y-8">
                <h2 className="text-4xl font-bold mb-4">Review and Launch!</h2>
                <p className="text-gray-400">Take a moment to review your details. Click 'Finish' when you're ready to start connecting!</p>

                {/* 1. Photos Review */}
                <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">Photos ({formData.photos.length} uploaded)</h3>
                    <div className="flex flex-wrap gap-2">
                        {formData.photos.map((photo, index) => (
                            <div
                                key={index}
                                className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center text-xs text-white"
                            >
                                P{index + 1}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Basic Details Review */}
                <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">Basic Information</h3>
                    <ul className="text-gray-300 space-y-1">
                        <li><span className="font-semibold text-gray-400">Name:</span> <span className="text-white">{formData.name || 'N/A'}</span></li>
                        <li><span className="font-semibold text-gray-400">Birthday:</span> <span className="text-white">{dateDisplay}</span></li>
                        <li><span className="font-semibold text-gray-400">Gender:</span> <span className="text-white">{formData.gender || 'N/A'}</span></li>
                    </ul>
                </div>

                {/* 3. Preferences Review */}
                <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">Matching Preferences</h3>
                    <ul className="text-gray-300 space-y-1">
                        <li><span className="font-semibold text-gray-400">Interested In:</span> <span className="text-white">{preferences.interestedIn?.join(', ') || 'N/A'}</span></li>
                        <li><span className="font-semibold text-gray-400">Looking For:</span> <span className="text-white">{preferences.relationshipIntent || 'N/A'}</span></li>
                        <li><span className="font-semibold text-gray-400">Orientation:</span> <span className="text-white">{preferences.sexualOrientation || 'N/A'}</span></li>
                        <li><span className="font-semibold text-gray-400">Interests:</span> <span className="text-white">{preferences.interests?.join(', ') || 'None Selected'}</span></li>
                    </ul>
                </div>
            </section>

            {/* RIGHT COLUMN: Final Confirmation */}
            <aside className="col-span-1 hidden md:block border-l border-gray-800 pl-8 pt-2">
                <h3 className="text-xl font-semibold mb-4 text-white">Final Step</h3>
                <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
                    <p className="text-gray-400 mb-4">
                        By clicking 'Finish', you agree to our terms of service and certify that the information provided is accurate.
                    </p>
                    <p className="text-lg font-bold text-white">
                        Ready to find your match?
                    </p>
                </div>
            </aside>
        </div>
    );
};

export default Step4_Review;