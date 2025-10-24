// components/onboarding/ProfileCreationForm.jsx

"use client";

import React, { useState, useMemo } from 'react';

import Step1_Photos from './Step1_Photos';
import Step2_Details from './Step2_Details'; // <-- THIS IS THE CORRECTED LINE
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
        // ... other future fields
    });

    const updateFormData = (newData) => {
        setFormData(newData);
    };

    // --- VALIDATION LOGIC ---
    const isStepValid = useMemo(() => {
        switch (currentStep) {
            case 1:
                // Must have at least 2 photos
                return formData.photos.length >= 2;
            case 2:
                // Must have name, all parts of birthday, and gender selected
                const { birthday } = formData;
                return (
                    formData.name.trim() !== '' &&
                    birthday.day.length > 0 &&
                    birthday.month.length > 0 &&
                    birthday.year.length === 4 &&
                    formData.gender !== ''
                );
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
    }, [currentStep, formData]);


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

    // --- RENDERING LOGIC ---
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
                        disabled={!isStepValid} // Disabled if the step requirements are not met
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