"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "../../../config/firebaseConfig";

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
      // ✅ Ensure client-side environment
      if (typeof window === "undefined") return;

      // ✅ Create recaptcha if not created already
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
          }
        );
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        formData.phone,
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
      const idToken = await auth.currentUser.getIdToken();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            phoneNumber: formData.phone,
            password: formData.password,
            firstName: "User",
            firebaseToken: idToken,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("✅ Account created!");
        router.push("/profile-setup");
      } else {
        alert("❌ " + data.error);
      }
    } catch (error) {
      console.error("OTP Verify Error:", error);
      alert("❌ Incorrect OTP");
    }
  };

  return (
    <><header className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-md bg-pink-500 flex items-center justify-center text-white font-bold">V</div>
      <span className="text-lg font-bold">Valise Dating</span>
    </div>
    <nav className="hidden md:flex items-center gap-6">
    <Link href="/signup" className="px-6 py-3 border border-pink-600 text-pink-600 rounded-full hover:bg-pink-50">
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

        <h2 className="text-3xl font-bold mb-6 text-center">Create Account</h2>

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
