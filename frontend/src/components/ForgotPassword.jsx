"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setMessage("Please enter a valid email address");
      return;
    }
    setMessage("✅ Reset link sent to your email!");
    setEmail("");
  };

  return (
    <>
      <header className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-pink-500 flex items-center justify-center text-white font-bold">V</div>
          <span className="text-lg font-bold">Valise Dating</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/signup" className="px-6 py-3 border border-pink-600 text-pink-600 rounded-full hover:bg-pink-50">
            Sign Up
          </Link>
        </nav>
      </header>
      <main className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-black/10 backdrop-blur-sm relative">
          <button
            onClick={() => router.push("/")}
            className="absolute top-4 right-4 text-black text-2xl font-bold hover:text-pink-600 transition"
          >
            ×
          </button>

          <h2 className="text-3xl font-bold mb-6 text-center text-black">Forgot Password</h2>

          <form className="space-y-6 text-black" onSubmit={handleSubmit}>
            <div>
              <label className="block text-base font-medium mb-1">Email Address</label>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 text-black placeholder-gray-600"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
            >
              Send Reset Link
            </button>

            {message && (
              <p className={`text-sm text-center ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
                {message}
              </p>
            )}

            <p className="text-center text-sm">
              Remember your password?{" "}
              <Link href="/signin" className="text-pink-600 hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </main>
    </>
  );
}

