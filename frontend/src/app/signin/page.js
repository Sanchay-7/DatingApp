"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          router.push("/"); // redirect to homepage after success
        }, 1500);
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch {
      alert("⚠️ Unable to connect to server.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-pink-50">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-black/10 backdrop-blur-sm relative">
        {/* Cross Button inside form box */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 right-4 text-black text-2xl font-bold hover:text-pink-600 transition"
        >
          ×
        </button>

        <h2 className="text-3xl font-bold mb-6 text-center text-black">Sign In</h2>

        <form className="space-y-6 text-black" onSubmit={handleSubmit}>
          <div>
            <label className="block text-base font-medium mb-1 text-black">
              Email or Phone
            </label>
            <input
              name="email"
              type="text"
              placeholder="Enter email or phone number"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 text-black placeholder-gray-600"
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
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 text-black placeholder-gray-600"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-black">
              <input type="checkbox" /> Remember me
            </label>
            <Link
              href="/forgot-password"
              className="text-pink-600 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
          >
            Sign In
          </button>

          <p className="text-center text-sm text-black">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-pink-600 hover:underline font-medium">
              Sign Up
            </Link>
          </p>
        </form>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-pink-600 text-white px-6 py-3 rounded-lg shadow-md animate-fadeIn">
          ✅ Login successful! Redirecting...
        </div>
      )}
    </main>
  );
}
