// components/onboarding/Step1_Photos.jsx

import React from 'react';

// This component receives the data and update functions from the main form.
const Step1_Photos = ({ formData, updateFormData, goToNext }) => {

    // A temporary function to simulate a successful photo upload.
    const handlePhotoUpload = (event) => {
        // In a real application, this would trigger a file picker and an API call.

        // TEMPORARY: Simulate adding a unique ID and URL for a new photo.
        const newPhotoId = Date.now();
        const newPhotoUrl = `/images/temp-photo-${newPhotoId}.jpg`;

        // Check for max photos (6)
        if (formData.photos.length < 6) {
            // Use the updateFormData function (passed from the parent) to update the state
            updateFormData({
                ...formData,
                photos: [...formData.photos, { id: newPhotoId, url: newPhotoUrl }]
            });
        } else {
            // Using a simple alert for feedback
            alert("Maximum 6 photos reached for this demo grid!");
        }
    };

    // Function to remove a photo
    const handleRemovePhoto = (idToRemove) => {
        updateFormData({
            ...formData,
            photos: formData.photos.filter(p => p.id !== idToRemove)
        });
    }

    // Check if minimum requirement (2 photos) is met
    const isNextEnabled = formData.photos.length >= 2;


    return (
        // Uses the two-column layout from our template concept
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl w-full">

            {/* LEFT COLUMN: Photo Upload Grid */}
            <section className="col-span-1">
                <h2 className="text-4xl font-bold mb-4">Showcase Your Best Self</h2>
                <p className="text-gray-400 mb-8">Upload at least 2 photos to start. Add more to truly shine!</p>

                {/* Dynamic Photo Grid (6 slots) */}
                <div className="grid grid-cols-3 grid-rows-2 gap-4">
                    {Array.from({ length: 6 }).map((_, index) => {
                        const photo = formData.photos[index];
                        const isPlaceholder = !photo;

                        return (
                            <div
                                key={index}
                                className={`relative w-full aspect-square rounded-lg transition-all duration-300 ${isPlaceholder
                                    ? 'border-2 border-dashed border-gray-700 bg-gray-900 flex items-center justify-center cursor-pointer hover:border-white' // Placeholder styling
                                    : 'border-2 border-solid border-gray-700 overflow-hidden' // Photo loaded styling
                                    }`}
                                // Only allow clicking on a placeholder slot to upload a photo
                                onClick={isPlaceholder ? handlePhotoUpload : null}
                            >
                                {isPlaceholder ? (
                                    // Plus icon for placeholder
                                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                ) : (
                                    <>
                                        {/* In a real app, you would use Next/Image for optimization */}
                                        <div className='w-full h-full bg-gray-700 flex items-center justify-center text-sm text-white'>
                                            Photo {index + 1}
                                            {/* You would replace this <div> with <img src={photo.url} ... /> */}
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            className="absolute top-1 right-1 bg-black bg-opacity-70 text-white w-6 h-6 rounded-full text-sm leading-none hover:bg-red-600 transition"
                                            // Stop propagation to prevent the click from being interpreted as a new upload
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemovePhoto(photo.id);
                                            }}
                                        >
                                            &times;
                                        </button>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Status Text for Minimum Requirement */}
                <p className={`mt-4 text-sm font-semibold ${isNextEnabled ? 'text-white' : 'text-red-400'}`}>
                    {isNextEnabled
                        ? `✅ Minimum 2 photos uploaded. You have ${formData.photos.length} photos.`
                        : `❌ Please upload at least 2 photos (${Math.max(0, 2 - formData.photos.length)} more required).`}
                </p>
            </section>

            {/* RIGHT COLUMN: Contextual Tips */}
            <aside className="col-span-1 hidden md:block border-l border-gray-800 pl-8 pt-2">
                <h3 className="text-xl font-semibold mb-4 text-white">Why Photos Matter</h3>
                <p className="text-gray-400 mb-6">
                    Your photos are the first impression. High-quality images increase your profile's visibility and potential matches significantly.
                </p>
                <ul className="space-y-3 text-gray-400">
                    <li className="flex items-start">
                        <span className="text-white mr-2">📸</span> Use clear, recent photos.
                    </li>
                    <li className="flex items-start">
                        <span className="text-white mr-2">🚫</span> Avoid filters or blurry group shots.
                    </li>
                    <li className="flex items-start">
                        <span className="text-white mr-2">😊</span> Include one photo with a smile!
                    </li>
                </ul>
            </aside>
        </div>
    );
};

export default Step1_Photos;