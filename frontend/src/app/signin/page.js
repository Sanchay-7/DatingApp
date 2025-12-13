"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/signin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ emailOrPhone, password }),
        }
      );
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Login failed");
      localStorage.setItem("valise_token", data.token);
      // Try to capture geolocation on login and send to backend
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try {
            const token = localStorage.getItem('valise_token');
            await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/update-location`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              credentials: 'include',
              body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            });
          } catch (e) {
            // Non-blocking
          }
        });
      }
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        router.push("/dashboard/user"); // or "/profile-setup"
      }, 1200);
    } catch {
      alert("Unable to reach server");
    }
  };

  return (
    <>
    <header className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Image 
            src="/logo.jpg" 
            alt="LuveKg" 
            width={40} 
            height={40}
            className="w-10 h-10 rounded-md object-cover"
          />
          <span className="text-lg font-bold">LuveKg</span>
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

        <h2 className="text-3xl font-bold mb-6 text-center text-black">Sign In</h2>

        <form className="space-y-6 text-black" onSubmit={handleSubmit}>
          <div>
            <label className="block text-base font-medium mb-1">Email or Phone</label>
            <input
              type="text"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="email@example.com or 9876543210"
              className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 text-black placeholder-gray-600"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Enter phone without country code (e.g., 9876543210)</p>
          </div>

          <div>
            <label className="block text-base font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 text-black placeholder-gray-600"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Remember me
            </label>
            <Link href="/forgot-password" className="text-pink-600 hover:underline font-medium">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition">
            Sign In
          </button>

          <p className="text-center text-sm">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-pink-600 hover:underline font-medium">
              Sign Up
            </Link>
          </p>
        </form>
      </div>

      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-pink-600 text-white px-6 py-3 rounded-lg shadow-md animate-fadeIn">
          ✅ Login successful! Redirecting...
        </div>
      )}
    </main>
    </>
  );
}
