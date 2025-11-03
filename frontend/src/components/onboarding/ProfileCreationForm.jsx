"use client";

import React, { useState, useMemo } from "react";

import Step1_Photos from "./Step1_Photos";
import Step2_Details from "./Step2_Details";
import Step3_Preferences from "./Step3_Preferences";
import Step4_Review from "./Step4_Review";

/**
 * Valise theme mapping (matches your landing page):
 * - Base      : bg-white text-black font-sans
 * - Primary   : pink-600 (hover: pink-700)
 * - Secondary : black (for solid CTAs), pink outlines on light surfaces
 * - Accent    : yellow-300 / yellow-200 / yellow-50 for surfaces & highlights
 * - Borders   : pink-100 / gray-200 where needed
 * - Focus     : ring-pink-300
 */

const MAX_STEPS = 4;

const ProfileCreationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    photos: [],
    name: "",
    birthday: { month: "", day: "", year: "" },
    gender: "",
    preferences: {
      interestedIn: [],
      relationshipIntent: "",
      sexualOrientation: "",
      interests: [],
    },
    location: "",
    hometown: "",
    currentLocation: "",
    height: "",
    work: "",
  });

  const updateFormData = (newData) => {
    setFormData(newData);
  };

  const is18OrOlder = (birthday) => {
    const { day, month, year } = birthday;
    if (!day || !month || !year || year.length !== 4) return false;
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    const cutoffDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    return birthDate <= cutoffDate;
  };

  const ageValidationError = useMemo(() => {
    const { birthday } = formData;
    const { day, month, year } = birthday;
    if (day && month && year && year.length === 4) {
      if (!is18OrOlder(birthday)) return "You must be 18 or older to register.";
    }
    return null;
  }, [formData.birthday]);

  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return formData.photos.length >= 2;
      case 2: {
        const { birthday } = formData;
        const basicDetailsValid =
          formData.name.trim() !== "" &&
          birthday.day.length > 0 &&
          birthday.month.length > 0 &&
          birthday.year.length === 4 &&
          formData.gender !== "";
        return basicDetailsValid && ageValidationError === null;
      }
      case 3:
        return (
          formData.preferences.interestedIn.length > 0 &&
          formData.preferences.relationshipIntent !== ""
        );
      case 4:
        return true;
      default:
        return false;
    }
  }, [currentStep, formData, ageValidationError]);

  const nextStep = () => {
    if (currentStep < MAX_STEPS && isStepValid) setCurrentStep((s) => s + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    console.log("Submitting final data to backend API:", formData);
    alert(
      "SUCCESS! Profile Data is ready to send to the backend. Check your console log."
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1_Photos formData={formData} updateFormData={updateFormData} />;
      case 2:
        return (
          <Step2_Details
            formData={formData}
            updateFormData={updateFormData}
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
        return <Step4_Review formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans">
      {/* HEADER */}
      <header className="w-full px-6 md:px-10 py-4 border-b border-pink-100 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-pink-600 text-white flex items-center justify-center font-extrabold shadow-sm">
              V
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">Valise Dating</h1>
              <p className="text-xs text-gray-600 -mt-0.5">Create a profile that matches your vibe</p>
            </div>
          </div>

          {/* Progress */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-800">Step {currentStep} of {MAX_STEPS}</span>
            <div className="w-28 h-2.5 rounded-full bg-pink-100">
              <div
                className="h-2.5 rounded-full bg-pink-600 transition-all duration-500"
                style={{ width: `${(currentStep / MAX_STEPS) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ACCENT STRIP */}
      <div className="h-1.5 w-full bg-yellow-300" />

      {/* MAIN */}
      <main className="flex-grow flex justify-center items-start py-10 px-6 md:px-10">
        <div className="max-w-6xl w-full">
          {/* Soft card shell to match landing surfaces */}
          <div className="rounded-2xl border border-gray-200 shadow-sm bg-white">
            {/* Section header */}
            <div className="px-6 md:px-10 py-6 rounded-t-2xl bg-yellow-50 border-b border-yellow-100">
              <h2 className="text-lg md:text-xl font-bold">Complete your profile</h2>
              <p className="text-sm text-gray-700 mt-1">Safety-first, modern, and simple—just like the rest of Valise.</p>
            </div>

            {/* Step body */}
            <div className="px-6 md:px-10 py-8">{renderStep()}</div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full px-6 md:px-10 py-6 border-t border-pink-100 bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-5 py-2.5 text-sm md:text-base font-semibold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 ${
              currentStep === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-pink-600 hover:bg-pink-50"
            }`}
          >
            Back
          </button>

          {currentStep < MAX_STEPS ? (
            <button
              onClick={nextStep}
              disabled={!isStepValid}
              className={`px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base font-semibold rounded-full shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 ${
                isStepValid
                  ? "bg-pink-600 text-white hover:bg-pink-700"
                  : "bg-pink-200 text-white/80 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          ) : (
            <div className="flex gap-3">
              {/* Secondary (outline) to mirror landing header CTAs */}
              <button
                onClick={() => setCurrentStep(MAX_STEPS - 1)}
                className="px-6 py-2.5 rounded-full border border-black text-black hover:bg-black hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                Review
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 md:px-8 py-2.5 md:py-3 font-semibold rounded-full bg-black text-white hover:opacity-90 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                Finish
              </button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default ProfileCreationForm;
