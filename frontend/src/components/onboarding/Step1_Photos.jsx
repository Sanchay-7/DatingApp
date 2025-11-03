// components/onboarding/Step1_Photos.jsx — Light Theme
import React from "react";

const Step1_Photos = ({ formData, updateFormData, goToNext }) => {
  const handlePhotoUpload = () => {
    const id = Date.now();
    const url = `/images/temp-photo-${id}.jpg`;
    if (formData.photos.length < 6) {
      updateFormData({
        ...formData,
        photos: [...formData.photos, { id, url }],
      });
    } else {
      alert("Maximum 6 photos reached!");
    }
  };

  const handleRemovePhoto = (idToRemove) => {
    updateFormData({
      ...formData,
      photos: formData.photos.filter((p) => p.id !== idToRemove),
    });
  };

  const isNextEnabled = formData.photos.length >= 2;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 max-w-6xl w-full">
      {/* LEFT */}
      <section className="col-span-1">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-black">
          Showcase Your Best Self
        </h2>
        <p className="text-gray-700 mb-8">
          Upload at least 2 photos to start. Add more to truly shine!
        </p>

        <div className="grid grid-cols-3 grid-rows-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => {
            const photo = formData.photos[i];
            const empty = !photo;
            return (
              <div
                key={i}
                className={`relative w-full aspect-square rounded-xl transition-all ${
                  empty
                    ? "border-2 border-dashed border-pink-300 bg-yellow-50 hover:bg-yellow-100 cursor-pointer"
                    : "border border-gray-200 bg-white shadow-sm overflow-hidden"
                }`}
                onClick={empty ? handlePhotoUpload : undefined}
              >
                {empty ? (
                  <div className="flex flex-col items-center justify-center h-full gap-1">
                    <svg
                      className="w-8 h-8 text-pink-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12M6 12h12" />
                    </svg>
                    <span className="text-xs text-pink-700 font-medium">Add photo</span>
                  </div>
                ) : (
                  <>
                    {/* swap with <Image src={photo.url} .../> in production */}
                    <div className="w-full h-full bg-gray-100 grid place-items-center text-sm text-gray-600">
                      Photo {i + 1}
                    </div>
                    <button
                      className="absolute top-1.5 right-1.5 bg-pink-600 hover:bg-pink-700 text-white w-6 h-6 rounded-full grid place-items-center shadow"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePhoto(photo.id);
                      }}
                      aria-label="Remove photo"
                    >
                      &times;
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <p
          className={`mt-4 text-sm font-semibold ${
            isNextEnabled ? "text-pink-700" : "text-red-600"
          }`}
        >
          {isNextEnabled
            ? `✅ Minimum 2 photos uploaded. You have ${formData.photos.length} photos.`
            : `❌ Please upload at least ${2 - formData.photos.length} more.`}
        </p>
      </section>

      {/* RIGHT */}
      <aside className="col-span-1 hidden md:block pl-8 pt-2 border-l border-pink-100">
        <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-6">
          <h3 className="text-xl font-bold mb-3 text-black">Why Photos Matter</h3>
          <p className="text-gray-700 mb-4">
            Your photos are the first impression. High-quality images increase visibility and matches.
          </p>
          <ul className="space-y-3 text-gray-800">
            <li>📸 Use clear, recent photos.</li>
            <li>🚫 Avoid heavy filters or blurry group shots.</li>
            <li>😊 Include one smiling photo!</li>
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default Step1_Photos;
