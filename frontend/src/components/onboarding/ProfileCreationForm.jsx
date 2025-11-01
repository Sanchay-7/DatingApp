"use client";

import React, { useState, useMemo } from 'react';

import Step1_Photos from './Step1_Photos';
import Step2_Details from './Step2_Details';
import Step3_Preferences from './Step3_Preferences';
import Step4_Review from './Step4_Review';


const MAX_STEPS = 4;

const ProfileCreationForm = () => {
    // State to track the current step the user is on
    const [currentStep, setCurrentStep] = useState(1);

    // State to collect all the user's data across all steps
    const [formData, setFormData] = useState({
        photos: [],
        name: '',
        birthday: { month: '', day: '', year: '' },
        gender: '',
        preferences: {
            interestedIn: [],
            relationshipIntent: '',
            sexualOrientation: '',
            interests: []
        },
        location: '',
        hometown: '',
        currentLocation: '',
        height: '',
        work: '',
    });

    const updateFormData = (newData) => {
        setFormData(newData);
    };

    // --- Helper function to check if the user is 18 or older ---
    const is18OrOlder = (birthday) => {
        const { day, month, year } = birthday;
        if (!day || !month || !year || year.length !== 4) {
            return false; // Not a full date, so not valid yet
        }

        // Create date object for user's birthday
        // Note: Months are 0-indexed in JS (0=Jan, 1=Feb, etc.)
        const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

        // Create date object for 18 years ago from today
        const today = new Date();
        const cutoffDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

        // User is 18 or older if their birthday is on or before the cutoff date
        return birthDate <= cutoffDate;
    };

    // --- NEW: Memoized value for the age error message ---
    // This calculates the error message, which we will pass to Step2_Details
    const ageValidationError = useMemo(() => {
        const { birthday } = formData;
        const { day, month, year } = birthday;

        // Only check if all fields are filled and year is 4 digits
        if (day && month && year && year.length === 4) {
            if (!is18OrOlder(birthday)) {
                // If they are not 18, return the error message
                return "You must be 18 or older to register.";
            }
        }
        // Otherwise, return null (no error)
        return null;
    }, [formData.birthday]); // This re-runs only when the birthday state changes
    // --- END OF NEW MEMO ---


    // --- VALIDATION LOGIC (MODIFIED) ---
    const isStepValid = useMemo(() => {
        switch (currentStep) {
            case 1:
                // Must have at least 2 photos
                return formData.photos.length >= 2;
            case 2:
                // MODIFIED: Now checks for age error
                const { birthday } = formData;
                // Check if basic fields are filled
                const basicDetailsValid = (
                    formData.name.trim() !== '' &&
                    birthday.day.length > 0 &&
                    birthday.month.length > 0 &&
                    birthday.year.length === 4 &&
                    formData.gender !== ''
                );

                // Must have basic details AND no age error
                return basicDetailsValid && ageValidationError === null;
            case 3:
                // Must select what they are interested in and looking for
                return (
                    formData.preferences.interestedIn.length > 0 &&
                    formData.preferences.relationshipIntent !== ''
                );
            case 4:
                // Step 4 (Review) is always valid, as the action is "Finish"
                return true;
            default:
                return false;
        }
    }, [currentStep, formData, ageValidationError]); // Added ageValidationError as a dependency


    // Function to move to the next step
    const nextStep = () => {
        if (currentStep < MAX_STEPS && isStepValid) {
            setCurrentStep(prevStep => prevStep + 1);
        }
    };

    // Function to go back to the previous step (unchanged)
    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prevStep => prevStep - 1);
        }
    };

    // Function to handle submitting the final data to the backend API
    const handleSubmit = async () => {
        console.log("Submitting final data to backend API:", formData);
        // ------------------------------------------------------------------------
        // TODO: This is where you would perform the final API call to the
        // Rohan API or Priya API endpoint your team set up for profile creation!
        // ------------------------------------------------------------------------
        alert("SUCCESS! Profile Data is ready to send to the backend. Check your console log.");
        // After a successful API call, you would redirect the user to the main dashboard.
    };

    // --- RENDERING LOGIC (MODIFIED) ---
    const renderStep = () => {

        switch (currentStep) {
            case 1:
                return (
                    <Step1_Photos
                        formData={formData}
                        updateFormData={updateFormData}
                    />
                );
            case 2:
                return (
                    <Step2_Details
                        formData={formData}
                        updateFormData={updateFormData}
                        // --- PROP ADDED ---
                        // We are passing the error message down to the child component
                        ageValidationError={ageValidationError}
                    />
                );
            case 3:
                return (
                    <Step3_Preferences
                        formData={formData}
                        updateFormData={updateFormData}
                    />
                );
            case 4:
                return (
                    <Step4_Review
                        formData={formData}
                    />
                );
            default:
                return null;
        }
    };


    return (
        // Main template structure (unchanged)
        <div className="min-h-screen bg-black text-white flex flex-col font-sans">

            {/* HEADER (Progress Bar) */}
            <header className="w-full py-4 px-8 border-b border-gray-800 flex justify-between items-center">
                <h1 className="text-2xl font-bold">PersonaForge</h1>
                <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold">Step {currentStep} of {MAX_STEPS}</span>
                    <div className="w-24 h-2 bg-gray-800 rounded-full">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-500"
                            style={{ width: `${(currentStep / MAX_STEPS) * 100}%` }}
                        />
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-grow flex justify-center items-start py-12 px-8">
                <div className="max-w-6xl w-full">
                    {renderStep()}
                </div>
            </main>

            {/* FOOTER (Navigation Buttons) */}
            <footer className="w-full py-6 px-8 border-t border-gray-800 flex justify-between items-center">
                <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`px-6 py-3 text-lg font-semibold transition-colors duration-200 ${currentStep === 1
                        ? 'text-gray-700 cursor-not-allowed'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Back
                </button>

                {currentStep < MAX_STEPS ? (
                    <button
                        onClick={nextStep}
                        disabled={!isStepValid} // This button is now disabled if user is under 18
                        className={`px-8 py-3 text-lg font-semibold rounded-lg shadow-lg transition-colors duration-200 ${isStepValid
                            ? 'bg-white text-black hover:bg-gray-200'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        Next
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        className="px-8 py-3 text-lg font-semibold bg-white text-black rounded-lg shadow-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                        Finish
                    </button>
                )}
            </footer>
        </div>
    );
};

export default ProfileCreationForm;