"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

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
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const token = localStorage.getItem("valise_token");
      if (!token) {
        throw new Error("You must be logged in to create a profile. Please login first.");
      }

      // Console logs removed for production

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

      // Step 1: Validate photos
      if (!formData.photos || formData.photos.length < 2) {
        throw new Error("Please upload at least 2 photos");
      }

      // Step 2: Upload all photos to get URLs
      const photoUrls = [];
      for (const photo of formData.photos) {
        if (photo.file) {
          const uploadFormData = new FormData();
          uploadFormData.append("image", photo.file);

          const uploadResponse = await fetch(`${API_BASE}/api/user/upload-image`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: uploadFormData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || "Failed to upload photo");
          }

          const uploadData = await uploadResponse.json();
          photoUrls.push(uploadData.url);
        } else if (photo.url && !photo.url.startsWith("blob:")) {
          // If it's already a URL (not a blob URL), use it directly
          photoUrls.push(photo.url);
        }
      }

      // Step 3: Transform birthday to ISO string
      const { day, month, year } = formData.birthday;
      if (!day || !month || !year) {
        throw new Error("Please complete your birthday information");
      }
      const birthdayISO = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

      // Step 4: Prepare profile data (only include defined values)
      const profileData = {
        name: formData.name,
        birthday: birthdayISO,
        gender: formData.gender,
        photos: photoUrls,
      };

      // Only add optional fields if they have values
      if (formData.work && formData.work.trim()) {
        profileData.work = formData.work.trim();
      }
      if (formData.height && formData.height.trim()) {
        const heightNum = parseInt(formData.height);
        if (!isNaN(heightNum) && heightNum > 0) {
          profileData.height = heightNum;
        }
      }
      if (formData.hometown && formData.hometown.trim()) {
        profileData.hometown = formData.hometown.trim();
      }
      const location = formData.currentLocation || formData.location;
      if (location && location.trim()) {
        profileData.currentLocation = location.trim();
      }

      // Console logs removed for production

      // Step 5: Update profile
      const profileResponse = await fetch(`${API_BASE}/api/user/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json().catch(() => ({}));
        console.error("Profile update error:", errorData);
        throw new Error(errorData.error || `Failed to update profile: ${profileResponse.status}`);
      }

      // Step 5: Prepare preferences data
      const preferencesData = {
        interestedIn: Array.isArray(formData.preferences.interestedIn) 
          ? formData.preferences.interestedIn 
          : [],
        relationshipIntent: formData.preferences.relationshipIntent || "",
        interests: Array.isArray(formData.preferences.interests) 
          ? formData.preferences.interests 
          : [],
      };

      // Only include sexualOrientation if it has a value
      if (formData.preferences.sexualOrientation && formData.preferences.sexualOrientation.trim()) {
        preferencesData.sexualOrientation = formData.preferences.sexualOrientation.trim();
      }

      // Console logs removed for production

      // Step 6: Update preferences
      const preferencesResponse = await fetch(`${API_BASE}/api/user/update-preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferencesData),
      });

      if (!preferencesResponse.ok) {
        const errorData = await preferencesResponse.json().catch(() => ({}));
        console.error("Preferences update error:", errorData);
        throw new Error(errorData.error || `Failed to update preferences: ${preferencesResponse.status}`);
      }

      // Success! Redirect user straight to their dashboard
      router.push("/waiting");
    } catch (error) {
      console.error("Profile submission error:", error);
      setSubmitError(error.message || "Failed to create profile. Please try again.");
      alert(`Error: ${error.message || "Failed to create profile. Please try again."}`);
    } finally {
      setIsSubmitting(false);
    }
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
      <header className="w-full px-6 md:px-10 py-4 border-b border-pink-100 bg-white/80 backdrop-blur supports-backdrop-filter:bg-white/70">
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
      <main className="grow flex justify-center items-start py-10 px-6 md:px-10">
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
            className={`px-5 py-2.5 text-sm md:text-base font-semibold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 ${currentStep === 1
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
              className={`px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base font-semibold rounded-full shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 ${isStepValid
                  ? "bg-pink-600 text-white hover:bg-pink-700"
                  : "bg-pink-200 text-white/80 cursor-not-allowed"
                }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-6 md:px-8 py-2.5 md:py-3 font-semibold rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all ${
                isSubmitting
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-black text-white hover:opacity-90"
              }`}
            >
              {isSubmitting ? "Creating Profile..." : "Finish"}
            </button>
          )}
          {submitError && (
            <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
              {submitError}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default ProfileCreationForm;