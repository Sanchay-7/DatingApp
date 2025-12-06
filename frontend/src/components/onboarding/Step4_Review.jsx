// components/onboarding/Step4_Review.jsx — Light Theme
import React from "react";

const Step4_Review = ({ formData }) => {
  const prefs = formData.preferences || {};
  const b = formData.birthday || {};
  const dateDisplay = b.day && b.month && b.year ? `${b.month}/${b.day}/${b.year}` : "Not set";

  // Function to clean location display (never show raw coordinates)
  const getCleanLocation = (location) => {
    if (!location) return "N/A";
    // If location contains coordinates (has comma and numbers like "13.0721,77.7922"), hide it
    if (/^\d+\.\d+,\d+\.\d+$/.test(location)) {
      return "Location not set";
    }
    return location;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 max-w-6xl w-full">
      {/* LEFT */}
      <section className="col-span-1 space-y-8">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-1 text-black">Review and Launch!</h2>
        <p className="text-gray-700">Check your details. Click “Finish” to start connecting.</p>

        {/* --- UPDATED PHOTOS BLOCK --- */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-black border-b border-pink-100 pb-2">
            Photos ({formData.photos.length} uploaded)
          </h3>
          <div className="flex flex-wrap gap-2">
            {/* We now map (photo, i) and use an <img> tag */}
            {formData.photos.map((photo, i) => (
              <img
                key={photo.id} // Use the photo's unique ID
                src={photo.url} // Use the preview URL
                alt={`Profile photo ${i + 1}`}
                className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-lg object-cover"
              />
            ))}
          </div>
        </div>
        {/* --- END UPDATED BLOCK --- */}


        {/* Basic Info */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-black border-b border-pink-100 pb-2">Basic Information</h3>
          <ul className="text-gray-800 space-y-1">
            <li><span className="font-semibold text-gray-600">Name:</span> <span className="text-black">{formData.name || "N/A"}</span></li>
            <li><span className="font-semibold text-gray-600">Birthday:</span> <span className="text-black">{dateDisplay}</span></li>
            <li><span className="font-semibold text-gray-600">Gender:</span> <span className="text-black">{formData.gender || "N/A"}</span></li>
            <li><span className="font-semibold text-gray-600">Work:</span> <span className="text-black">{formData.work || "N/A"}</span></li>
            <li><span className="font-semibold text-gray-600">Height:</span> <span className="text-black">{formData.height || "N/A"}</span></li>
            <li><span className="font-semibold text-gray-600">Current Location:</span> <span className="text-black">{getCleanLocation(formData.currentLocation)}</span></li>
            <li><span className="font-semibold text-gray-600">Hometown:</span> <span className="text-black">{formData.hometown || "N/A"}</span></li>
          </ul>
        </div>

        {/* Preferences */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-black border-b border-pink-100 pb-2">Matching Preferences</h3>
          <ul className="text-gray-800 space-y-1">
            <li><span className="font-semibold text-gray-600">Interested In:</span> <span className="text-black">{prefs.interestedIn?.join(", ") || "N/A"}</span></li>
            <li><span className="font-semibold text-gray-600">Looking For:</span> <span className="text-black">{prefs.relationshipIntent || "N/A"}</span></li>
            <li><span className="font-semibold text-gray-600">Orientation:</span> <span className="text-black">{prefs.sexualOrientation || "N/A"}</span></li>
            <li><span className="font-semibold text-gray-600">Interests:</span> <span className="text-black">{prefs.interests?.join(", ") || "None Selected"}</span></li>
          </ul>
        </div>
      </section>

      {/* RIGHT */}
      <aside className="col-span-1 hidden md:block pl-8 pt-2 border-l border-pink-100">
        <div className="p-6 rounded-2xl bg-yellow-50 border border-yellow-200">
          <h3 className="text-xl font-bold mb-3 text-black">Final Step</h3>
          <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
            <p className="text-gray-700 mb-4">
              By clicking “Finish”, you agree to our terms and confirm your details are accurate.
            </p>
            <p className="text-lg font-bold text-black">Ready to find your match?</p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Step4_Review;