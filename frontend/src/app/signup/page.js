"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "../../../config/firebaseConfig";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  });

  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Send OTP using Firebase
  const handleSendOTP = async () => {
    if (!formData.phone) {
      alert("Enter phone number");
      return;
    }

    try {
      if (typeof window === "undefined") return;

      // Ensure the recaptcha container is present
      if (!document.getElementById("recaptcha-container")) {
        alert("Recaptcha not ready. Please refresh and try again.");
        return;
      }

      // Recreate verifier each time to avoid 'client element removed' errors
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (_) {}
        window.recaptchaVerifier = null;
      }

      // ✅ Normalize phone number
      let phone = formData.phone.trim();
      if (!phone.startsWith("+")) {
        phone = "+91" + phone;
      }

      // ✅ Create recaptcha
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );

      // Render to bind to DOM immediately
      await window.recaptchaVerifier.render();

      const confirmation = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier
      );

      setConfirmationResult(confirmation);
      setOtpSent(true);
      alert("✅ OTP sent!");
    } catch (error) {
      console.error("OTP Error:", error);
      alert("❌ Failed to send OTP");
    }
  };

  // ✅ Verify OTP then call backend signup
  const handleVerifyAndSignup = async () => {
    if (!otp) return alert("Enter OTP!");

    try {
      await confirmationResult.confirm(otp);
      const user = auth.currentUser;
      if (!user) {
        alert("Authentication failed. Please resend OTP.");
        return;
      }

      const idToken = await user.getIdToken(true);

      // Normalize phone exactly like the OTP step so Firebase claim matches backend check
      let phoneNumber = formData.phone.trim();
      if (!phoneNumber.startsWith("+")) {
        phoneNumber = "+91" + phoneNumber;
      }

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          phoneNumber,
          password: formData.password,
          firstName: "User",
          firebaseToken: idToken,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Save token to localStorage if provided
        if (data.token) {
          localStorage.setItem("valise_token", data.token);
        }
        
        // Check if this is resuming a profile or new signup
        if (data.isResume) {
          alert("👋 Welcome back! Let's complete your profile.");
        } else {
          alert("✅ Account created!");
        }
        
        router.push("/profile-setup");
      } else {
        console.error("Signup failed", res.status, data);
        alert("❌ " + (data?.error || "Signup failed"));
      }
    } catch (error) {
      console.error("OTP Verify Error:", error);
      alert("❌ Incorrect OTP");
    }
  };

  return (
    <>
      <header className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-pink-500 flex items-center justify-center text-white font-bold">
            V
          </div>
          <span className="text-lg font-bold">Valise Dating</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/signin"
            className="px-6 py-3 border border-pink-600 text-pink-600 rounded-full hover:bg-pink-50"
          >
            Sign In
          </Link>
        </nav>
      </header>
      <main className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md relative">
          {/* Recaptcha container */}
          <div id="recaptcha-container"></div>

          {/* Close Button */}
          <button
            onClick={() => router.push("/")}
            className="absolute top-4 right-4 text-2xl font-bold hover:text-blue-600"
          >
            ×
          </button>

          <h2 className="text-3xl font-bold mb-6 text-center">
            Create Account
          </h2>

          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="block mb-1">Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-1">Phone Number</label>
              <input
                name="phone"
                type="tel"
                placeholder="+91XXXXXXXXXX"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1">Password</label>
              <input
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            {/* STEP 1: Send OTP */}
            {!otpSent && (
              <button
                onClick={handleSendOTP}
                className="w-full bg-blue-600 text-white py-3 rounded-lg"
              >
                Send OTP
              </button>
            )}

            {/* STEP 2: OTP Input */}
            {otpSent && (
              <>
                <div>
                  <label className="block mb-1">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>

                <button
                  onClick={handleVerifyAndSignup}
                  className="w-full bg-green-600 text-white py-3 rounded-lg"
                >
                  Verify OTP & Create Account
                </button>
              </>
            )}

            <p className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/signin" className="text-blue-600 font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
