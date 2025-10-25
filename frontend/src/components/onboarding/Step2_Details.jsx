// components/onboarding/Step2_Details.jsx (Final Clean Code)

import React from 'react';

const Step2_Details = ({ formData, updateFormData }) => {

    // Local state for the gender toggle
    const [showGender, setShowGender] = React.useState(false);

    // Helper function to handle changes for standard text inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        updateFormData({
            ...formData,
            [name]: value,
        });
    };

    // Helper function to handle changes for button selections (like Gender)
    const handleSelect = (name, value) => {
        updateFormData({
            ...formData,
            [name]: value,
        });
    };

    // Helper function to handle changes for the birthday month/day/year
    const handleDateChange = (name, value) => {
        updateFormData({
            ...formData,
            birthday: {
                ...formData.birthday,
                [name]: value
            }
        });
    };

    // Pre-fill the birthday object if it doesn't exist yet
    React.useEffect(() => {
        if (!formData.birthday) {
            updateFormData({
                ...formData,
                birthday: { month: '', day: '', year: '' }
            });
        }
    }, [formData, updateFormData]);

    // Tailwind classes for buttons (using the black/white theme)
    const buttonClass = (value) =>
        `px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${formData.gender === value
            ? 'bg-white text-black' // Selected style
            : 'bg-gray-800 text-white hover:bg-gray-700' // Unselected style
        }`;

    // --- TEMPORARY LOGIC TO DISPLAY AGE (In a real app, this is calculated) ---
    const displayAge = formData.birthday && formData.birthday.year
        ? (new Date().getFullYear() - parseInt(formData.birthday.year))
        : '??';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl w-full">

            {/* LEFT COLUMN: Input Forms */}
            <section className="col-span-1 space-y-8">
                <h2 className="text-4xl font-bold mb-4">The Essentials</h2>
                <p className="text-gray-400">Time to fill in your core details. This information helps us find great matches.</p>

                {/* 1. First Name */}
                <div className="space-y-2">
                    <label htmlFor="name" className="block text-white text-lg font-semibold">First Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        placeholder="First Name"
                        className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-lg focus:border-white focus:ring-0 placeholder:text-gray-500"
                    />
                </div>

                {/* 2. Email Input */}
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-white text-lg font-semibold">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        placeholder="Email Address"
                        className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-lg focus:border-white focus:ring-0 placeholder:text-gray-500"
                    />
                </div>


                {/* 3. Birthday (Simulated DD/MM/YYYY dropdowns) */}
                <div className="space-y-2">
                    <label className="block text-white text-lg font-semibold">Birthday</label>
                    <div className="flex space-x-4">
                        {['month', 'day', 'year'].map((unit) => (
                            <input
                                key={unit}
                                type="text"
                                name={unit}
                                value={(formData.birthday && formData.birthday[unit]) || ''}
                                onChange={(e) => handleDateChange(unit, e.target.value)}
                                placeholder={unit.toUpperCase()}
                                maxLength={unit === 'year' ? 4 : 2}
                                className="w-1/3 bg-gray-900 border border-gray-700 text-white p-3 rounded-lg text-center focus:border-white focus:ring-0 placeholder:text-gray-500"
                            />
                        ))}
                    </div>
                </div>

                {/* 4. Gender Selection */}
                <div className="space-y-2">
                    <label className="block text-white text-lg font-semibold">Gender</label>
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={() => handleSelect('gender', 'Man')}
                            className={buttonClass('Man')}
                        >
                            Man
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSelect('gender', 'Woman')}
                            className={buttonClass('Woman')}
                        >
                            Woman
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSelect('gender', 'More')}
                            className={buttonClass('More')}
                        >
                            More &gt;
                        </button>
                    </div>
                </div>

                {/* 5. Show Gender Toggle */}
                <div className="flex items-center justify-between pt-4">
                    <span className="text-gray-400">Show my gender on my profile</span>
                    <div
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${showGender ? 'bg-white' : 'bg-gray-700'
                            }`}
                        onClick={() => setShowGender(!showGender)}
                    >
                        <div
                            className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${showGender ? 'translate-x-5' : 'translate-x-0'
                                }`}
                        />
                    </div>
                </div>

            </section>

            {/* RIGHT COLUMN: Live Preview */}
            <aside className="col-span-1 hidden md:block border-l border-gray-800 pl-8 pt-2">
                <h3 className="text-xl font-semibold mb-4 text-white">Your Profile Preview</h3>
                <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">

                    {/* Photo Thumbnails */}
                    <div className="flex space-x-2 mb-4">
                        {formData.photos.slice(0, 3).map((photo, index) => (
                            <div
                                key={index}
                                className="w-1/3 aspect-square bg-gray-700 rounded-md flex items-center justify-center text-xs text-white"
                            >
                                P{index + 1}
                            </div>
                        ))}
                    </div>

                    {/* Name and Age */}
                    <p className="text-3xl font-bold mb-1">
                        {formData.name || 'Name'}, {displayAge}
                    </p>

                    {/* Gender (Conditional Display based on switch state) */}
                    <p className="text-lg text-gray-400">
                        {showGender ? formData.gender || 'Select Gender' : 'Gender Hidden'}
                    </p>

                    <p className="mt-4 text-sm text-gray-500">
                        This is how your basic information will appear to others.
                    </p>
                </div>
            </aside>

            {/* No Navigation Buttons here */}
        </div>
    );
};

export default Step2_Details;