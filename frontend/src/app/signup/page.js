"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [formData, setFormData] = useState({ email: "", phone: "", password: "" });
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          router.push("/"); // Go to home after signup success
        }, 1500);
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch {
      alert("⚠️ Unable to connect to server.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-black/10 backdrop-blur-sm relative">
        {/* Cross Button inside form box */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 right-4 text-black text-2xl font-bold hover:text-blue-600 transition"
        >
          ×
        </button>

        <h2 className="text-3xl font-bold mb-6 text-center text-black">Create Account</h2>

        <form className="space-y-6 text-black" onSubmit={handleSubmit}>
          <div>
            <label className="block text-base font-medium mb-1 text-black">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black placeholder-gray-600"
              required
            />
          </div>

          <div>
            <label className="block text-base font-medium mb-1 text-black">
              Phone Number
            </label>
            <input
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black placeholder-gray-600"
              required
            />
          </div>

          <div>
            <label className="block text-base font-medium mb-1 text-black">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black placeholder-gray-600"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Create Account
          </button>

          <p className="text-center text-sm text-black">
            Already have an account?{" "}
            <Link href="/signin" className="text-blue-600 hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </form>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md animate-fadeIn">
          ✅ Account created successfully! Redirecting...
        </div>
      )}
    </main>
  );
}