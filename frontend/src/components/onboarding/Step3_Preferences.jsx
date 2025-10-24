// components/onboarding/Step3_Preferences.jsx

import React from 'react';

const availableInterests = ['Hiking', 'Cooking', 'Photography', 'Travel', 'Movies', 'Gaming', 'Reading'];

const Step3_Preferences = ({ formData, updateFormData }) => {

    // Initialize preferences structure if it doesn't exist
    React.useEffect(() => {
        if (!formData.preferences) {
            updateFormData({
                ...formData,
                preferences: {
                    interestedIn: formData.preferences?.interestedIn || [],
                    relationshipIntent: formData.preferences?.relationshipIntent || '',
                    sexualOrientation: formData.preferences?.sexualOrientation || '',
                    interests: formData.preferences?.interests || []
                }
            });
        }
    }, []);


    // Handles selection buttons (e.g., Interested In)
    const handlePreferenceSelect = (key, value) => {
        const currentValue = formData.preferences[key];
        let newValue;

        // Logic for 'Interested In' (can select multiple)
        if (key === 'interestedIn') {
            if (currentValue.includes('Everyone')) {
                // If 'Everyone' is selected, clear and start fresh
                newValue = [value];
            } else if (value === 'Everyone') {
                // Selecting 'Everyone' clears other selections
                newValue = ['Everyone'];
            } else if (currentValue.includes(value)) {
                // Toggle off
                newValue = currentValue.filter(v => v !== value);
            } else {
                // Toggle on
                newValue = [...currentValue, value].filter(v => v !== 'Everyone'); // Remove 'Everyone' if specific genders are added
            }
        } else {
            // Logic for single selection (e.g., Relationship Intent, Sexual Orientation)
            newValue = currentValue === value ? '' : value; // Toggle behaviour
        }

        updateFormData({
            ...formData,
            preferences: {
                ...formData.preferences,
                [key]: newValue
            }
        });
    };

    // Handles adding/removing interests (simplified tag toggle)
    const handleInterestToggle = (interest) => {
        const currentInterests = formData.preferences.interests || [];
        let newInterests;

        if (currentInterests.includes(interest)) {
            newInterests = currentInterests.filter(i => i !== interest);
        } else {
            newInterests = [...currentInterests, interest];
        }

        updateFormData({
            ...formData,
            preferences: {
                ...formData.preferences,
                interests: newInterests
            }
        });
    };


    // Tailwind class helper for selected buttons
    const buttonClass = (key, value) => {
        const isSelected = Array.isArray(formData.preferences[key])
            ? formData.preferences[key].includes(value)
            : formData.preferences[key] === value;

        return `px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${isSelected
                ? 'bg-white text-black' // Selected style
                : 'bg-gray-800 text-white hover:bg-gray-700' // Unselected style
            }`;
    };


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl w-full">

            {/* LEFT COLUMN: Input Forms */}
            <section className="col-span-1 space-y-10">
                <h2 className="text-4xl font-bold mb-4">Your Matching Preferences</h2>
                <p className="text-gray-400">Tell us what you're looking for to help us suggest compatible connections.</p>

                {/* 1. Interested In (Multiple Selection) */}
                <div className="space-y-4">
                    <label className="block text-white text-lg font-semibold">I'm interested in:</label>
                    <div className="flex space-x-3">
                        {['Men', 'Women', 'Everyone'].map(value => (
                            <button
                                key={value}
                                onClick={() => handlePreferenceSelect('interestedIn', value)}
                                className={buttonClass('interestedIn', value)}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Relationship Intent (Single Selection) */}
                <div className="space-y-4">
                    <label className="block text-white text-lg font-semibold">I'm looking for:</label>
                    <div className="flex space-x-3">
                        {['Long-term', 'Casual', 'Friendship'].map(value => (
                            <button
                                key={value}
                                onClick={() => handlePreferenceSelect('relationshipIntent', value)}
                                className={buttonClass('relationshipIntent', value)}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Sexual Orientation (Single Selection) */}
                <div className="space-y-4">
                    <label className="block text-white text-lg font-semibold">Sexual Orientation</label>
                    <div className="flex space-x-3 flex-wrap gap-y-2">
                        {['Straight', 'Gay', 'Bisexual', 'Other'].map(value => (
                            <button
                                key={value}
                                onClick={() => handlePreferenceSelect('sexualOrientation', value)}
                                className={buttonClass('sexualOrientation', value)}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. Interests/Hobbies (Tag Selection) */}
                <div className="space-y-4">
                    <label className="block text-white text-lg font-semibold">My Top Interests</label>
                    <div className="flex space-x-3 flex-wrap gap-y-2">
                        {availableInterests.map(interest => {
                            const isSelected = formData.preferences?.interests?.includes(interest);
                            return (
                                <button
                                    key={interest}
                                    onClick={() => handleInterestToggle(interest)}
                                    className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 border ${isSelected
                                            ? 'bg-white text-black border-white'
                                            : 'bg-transparent text-gray-400 border-gray-700 hover:border-white'
                                        }`}
                                >
                                    {interest}
                                </button>
                            );
                        })}
                    </div>
                </div>

            </section>

            {/* RIGHT COLUMN: Contextual Tips */}
            <aside className="col-span-1 hidden md:block border-l border-gray-800 pl-8 pt-2">
                <h3 className="text-xl font-semibold mb-4 text-white">Matching Insight</h3>
                <p className="text-gray-400 mb-6">
                    Setting detailed preferences means fewer swipes and more meaningful connections. Be honest about what you want!
                </p>

                {/* Summary Preview */}
                <div className="p-6 bg-gray-900 rounded-lg border border-gray-800 space-y-3 text-gray-300">
                    <p className="font-semibold">Looking For:</p>
                    <ul className="text-sm space-y-1 text-gray-400">
                        <li>Gender: <span className="text-white">{formData.preferences?.interestedIn?.join(', ') || 'Any'}</span></li>
                        <li>Intent: <span className="text-white">{formData.preferences?.relationshipIntent || 'Not set'}</span></li>
                    </ul>
                </div>
            </aside>
        </div>
    );
};

export default Step3_Preferences;