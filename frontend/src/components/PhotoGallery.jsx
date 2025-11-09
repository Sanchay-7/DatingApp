import React from 'react';

// Added isEditing prop to control button visibility and text
export default function PhotoGallery({ profile, isEditing }) {

  // --- DATA FIX ---
  // Default to an empty array if profile or photos is missing
  const allPhotos = profile?.photos || [];

  // The main photo is the first one
  const mainPhoto = allPhotos[0] || `https://placehold.co/600x600/f0f0f0/333?text=No+Photo`;
  
  // The extra photos are all the others (from index 1 to the end)
  const extraPhotos = allPhotos.slice(1);

  // Use firstName, or 'User' as a fallback
  const name = profile?.firstName || 'User';
  // --- END DATA FIX ---


  // Renders the 2x2 photo grid
  const renderGallery = () => {
    // If there are no extra photos, show a message
    if (extraPhotos.length === 0) {
      return <p className="text-sm text-gray-500">No other photos available.</p>
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        {/* Use the new 'extraPhotos' variable here */}
        {extraPhotos.map((src, index) => (
          <div
            key={index}
            className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative group"
          >
            <img
              src={src}
              alt={`${name} photo ${index + 2}`}
              className="w-full h-full object-cover"
            />

            {/* Add Drag/Delete Overlays only if we are in Editing mode */}
            {isEditing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button className="text-white text-sm bg-red-600 hover:bg-red-700 p-2 rounded-full font-bold">
                  🗑️
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-8 border-l border-gray-200 bg-white w-1/3">

      {/* Main Profile Photo - Prominently displayed */}
      <div className="aspect-square w-full bg-gray-300 rounded-xl overflow-hidden shadow-lg relative group">
        <img
          src={mainPhoto} // Use the new 'mainPhoto' variable
          alt={`${name} main photo`}
          className="w-full h-full object-cover"
        />
        {isEditing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button className="bg-pink-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-pink-700">
              Upload New Main Photo
            </button>
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      <h3 className="text-lg font-semibold text-gray-800 pt-2 border-t">Photo Gallery</h3>
      {renderGallery()}

      {/* Button only visible in editing mode */}
      {isEditing && (
        <div className="mt-8 text-center">
          <button className="w-full bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition">
            + Add Another Photo
          </button>
        </div>
      )}
    </div>
  );
}