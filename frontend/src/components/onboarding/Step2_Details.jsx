// components/onboarding/Step2_Details.jsx — Light Theme Fix
import React, { useState, useEffect } from "react";

const Step2_Details = ({ formData, updateFormData, ageValidationError }) => {
    const [showGender, setShowGender] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        updateFormData({ ...formData, [name]: value });
    };

    const handleSelect = (name, value) => {
        updateFormData({ ...formData, [name]: value });
    };

    const handleDateChange = (name, value) => {
        updateFormData({
            ...formData,
            birthday: { ...formData.birthday, [name]: value },
        });
    };

    useEffect(() => {
        if (!formData.birthday) {
            updateFormData({
                ...formData,
                birthday: { month: "", day: "", year: "" },
            });
        }
    }, [formData, updateFormData]);

    const buttonClass = (value) =>
        `px-4 py-2 rounded-full font-semibold transition-colors border ${formData.gender === value
            ? "bg-pink-600 text-white border-pink-600"
            : "bg-white text-pink-600 border-pink-600 hover:bg-pink-50"
        }`;

    const displayAge =
        formData.birthday && formData.birthday.year
            ? new Date().getFullYear() - parseInt(formData.birthday.year)
            : "??";

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 max-w-6xl w-full">
            {/* LEFT COLUMN */}
            <section className="col-span-1 space-y-8">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-2 text-black">
                    The Essentials
                </h2>
                <p className="text-gray-700">
                    Time to fill in your core details. This information helps us find
                    great matches.
                </p>

                {/* Input Field Style */}
                {[
                    ["name", "First Name", "text", "First Name"],
                    ["email", "Email Address", "email", "Email Address"],
                ].map(([key, label, type, placeholder]) => (
                    <div className="space-y-2" key={key}>
                        <label
                            htmlFor={key}
                            className="block text-black text-base font-semibold"
                        >
                            {label}
                        </label>
                        <input
                            type={type}
                            id={key}
                            name={key}
                            value={formData[key] || ""}
                            onChange={handleChange}
                            placeholder={placeholder}
                            className="w-full bg-white border border-gray-300 text-black p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 placeholder:text-gray-500"
                        />
                    </div>
                ))}

                {/* Birthday */}
                <div className="space-y-2">
                    <label className="block text-black text-base font-semibold">
                        Birthday
                    </label>
                    <div className="flex gap-4">
                        {["month", "day", "year"].map((unit) => (
                            <input
                                key={unit}
                                type="text"
                                name={unit}
                                value={(formData.birthday && formData.birthday[unit]) || ""}
                                onChange={(e) => handleDateChange(unit, e.target.value)}
                                placeholder={unit.toUpperCase()}
                                maxLength={unit === "year" ? 4 : 2}
                                className="w-1/3 bg-white border border-gray-300 text-black p-3 rounded-lg text-center shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 placeholder:text-gray-500"
                            />
                        ))}
                    </div>
                    {ageValidationError && (
                        <p className="pt-1 text-sm font-semibold text-red-600">
                            {ageValidationError}
                        </p>
                    )}
                </div>

                {/* Gender */}
                <div className="space-y-2">
                    <label className="block text-black text-base font-semibold">
                        Gender
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {["Man", "Woman", "More"].map((val) => (
                            <button
                                key={val}
                                type="button"
                                onClick={() => handleSelect("gender", val)}
                                className={buttonClass(val)}
                            >
                                {val}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Toggle */}
                <div className="flex items-center justify-between pt-2">
                    <span className="text-gray-700">Show my gender on my profile</span>
                    <button
                        type="button"
                        onClick={() => setShowGender(!showGender)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${showGender ? "bg-pink-200" : "bg-gray-200"
                            }`}
                        aria-pressed={showGender}
                    >
                        <span
                            className={`block w-4 h-4 rounded-full bg-black transition-transform ${showGender ? "translate-x-6" : ""
                                }`}
                        />
                    </button>
                </div>

                {/* More About You */}
                <div className="pt-8 border-t border-pink-100 space-y-6">
                    <h3 className="text-2xl md:text-3xl font-extrabold text-black">
                        More About You
                    </h3>
                    <p className="text-gray-700">
                        Add extra details to give your profile some personality.
                    </p>

                    {[
                        ["hometown", "Hometown", "e.g., Mumbai"],
                        ["currentLocation", "Current Location", "e.g., Bengaluru"],
                        ["height", "Height", "e.g., 5'11\" or 180 cm"],
                        ["work", "What do you do? (Work)", "e.g., Software Engineer"],
                    ].map(([key, label, placeholder]) => (
                        <div className="space-y-2" key={key}>
                            <label
                                htmlFor={key}
                                className="block text-black text-base font-semibold"
                            >
                                {label}
                            </label>
                            <input
                                type="text"
                                id={key}
                                name={key}
                                value={formData[key] || ""}
                                onChange={handleChange}
                                placeholder={placeholder}
                                className="w-full bg-white border border-gray-300 text-black p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 placeholder:text-gray-500"
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* RIGHT COLUMN */}
            <aside className="col-span-1 hidden md:block pl-8 pt-2 border-l border-pink-100">
                <div className="p-6 rounded-2xl bg-yellow-50 border border-yellow-200 shadow-sm">
                    <h3 className="text-xl font-bold mb-3 text-black">
                        Your Profile Preview
                    </h3>
                    <div className="p-4 bg-white rounded-xl border border-gray-200">

                        {/* --- UPDATED BLOCK START --- */}
                        {/* This now renders 3 slots, and fills them with images if they exist */}
                        <div className="flex gap-2 mb-4">
                            {Array.from({ length: 3 }).map((_, i) => {
                                const photo = formData.photos[i]; // Get the photo for this slot
                                if (photo) {
                                    // If the photo exists, show the image
                                    return (
                                        <img
                                            key={photo.id} // Use the photo's unique ID
                                            src={photo.url} // Use the preview URL
                                            alt={`Profile preview ${i + 1}`}
                                            className="w-1/3 aspect-square bg-gray-100 rounded-md object-cover"
                                        />
                                    );
                                } else {
                                    // If no photo, show an empty placeholder box
                                    return (
                                        <div
                                            key={i}
                                            className="w-1/3 aspect-square bg-gray-100 rounded-md"
                                        />
                                    );
                                }
                            })}
                        </div>
                        {/* --- UPDATED BLOCK END --- */}

                        <p className="text-2xl font-extrabold text-black mb-1">
                            {formData.name || "Name"}, {displayAge}
                        </p>
                        <p className="text-base text-gray-700 mb-4">
                            {showGender ? formData.gender || "Select Gender" : "Gender Hidden"}
                        </p>
                        <div className="space-y-1 text-sm text-gray-800">
                            {formData.work && (
                                <div className="flex items-center">
                                    <span className="w-6">💼</span>
                                    <span>{formData.work}</span>
                                </div>
                            )}
                            {formData.currentLocation && (
                                <div className="flex items-center">
                                    <span className="w-6">📍</span>
                                    <span>Lives in {formData.currentLocation}</span>
                                </div>
                            )}
                            {formData.hometown && (
                                <div className="flex items-center">
                                    <span className="w-6">🏠</span>
                                    <span>From {formData.hometown}</span>
                                </div>
                            )}
                            {formData.height && (
                                <div className="flex items-center">
                                    <span className="w-6">📏</span>
                                    <span>{formData.height}</span>
                                </div>
                            )}
                        </div>
                        <p className="mt-4 text-sm text-gray-500">
                            This is how your basic information will appear to others.
                        </p>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default Step2_Details;