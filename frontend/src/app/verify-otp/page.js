"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = "http://localhost:5000"; // <-- change to your backend

const interestOptions = ["Hiking", "Cooking", "Photography", "Travel", "Movies", "Gaming", "Reading"];
const genders = ["Man", "Woman", "More"];
const interestedInOptions = ["Men", "Women", "Everyone"];
const lookingForOptions = ["Long-term", "Casual", "Friendship"];
const sexualOrientationOptions = ["Straight", "Gay", "Bisexual", "Other"];

export default function SignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    email: "",
    phoneNumber: "",
    password: "",
    birthday: "", // yyyy-mm-dd
    gender: "",
    interestedIn: "Everyone",
    lookingFor: "Long-term",
    interests: [],
    sexualOrientation: "Straight",
    profileImage: null, // optional URL (not using file upload here)
  });

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleInterest = (i) =>
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(i) ? f.interests.filter((x) => x !== i) : [...f.interests, i],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // backend requires birthday as a date; we pass the string and let server Date() parse
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Signup failed");
        setLoading(false);
        return;
      }
      // success: go to OTP page; pass phone via query
      router.push(`/verify-otp?phone=${encodeURIComponent(form.phoneNumber)}`);
    } catch {
      alert("Unable to reach server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl border border-black/10 relative">
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 right-4 text-black text-2xl font-bold hover:text-blue-600 transition"
        >
          ×
        </button>

        <h2 className="text-3xl font-bold mb-6 text-center text-black">Create Account</h2>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-5 text-black" onSubmit={handleSubmit}>
          <div className="col-span-1">
            <label className="block font-medium mb-1">First Name</label>
            <input
              className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={form.firstName}
              onChange={(e) => setField("firstName", e.target.value)}
              required
            />
          </div>

          <div className="col-span-1">
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              required
            />
          </div>

          <div className="col-span-1">
            <label className="block font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={form.phoneNumber}
              onChange={(e) => setField("phoneNumber", e.target.value)}
              required
            />
          </div>

          <div className="col-span-1">
            <label className="block font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              required
            />
          </div>

          <div className="col-span-1">
            <label className="block font-medium mb-1">Birthday</label>
            <input
              type="date"
              className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={form.birthday}
              onChange={(e) => setField("birthday", e.target.value)}
              required
            />
          </div>

          <div className="col-span-1">
            <label className="block font-medium mb-1">Gender</label>
            <select
              className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              value={form.gender}
              onChange={(e) => setField("gender", e.target.value)}
              required
            >
              <option value="" disabled>Select…</option>
              {genders.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label className="block font-medium mb-1">Interested In</label>
            <select
              className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              value={form.interestedIn}
              onChange={(e) => setField("interestedIn", e.target.value)}
              required
            >
              {interestedInOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label className="block font-medium mb-1">Looking For</label>
            <select
              className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              value={form.lookingFor}
              onChange={(e) => setField("lookingFor", e.target.value)}
              required
            >
              {lookingForOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block font-medium mb-2">Top Interests (optional)</label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((i) => {
                const selected = form.interests.includes(i);
                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => toggleInterest(i)}
                    className={`px-3 py-1 text-sm rounded-full border transition ${
                      selected ? "bg-black text-white border-black" : "bg-transparent text-black border-black/30 hover:border-black"
                    }`}
                  >
                    {i}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="col-span-2">
            <label className="block font-medium mb-1">Sexual Orientation (optional)</label>
            <select
              className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              value={form.sexualOrientation}
              onChange={(e) => setField("sexualOrientation", e.target.value)}
            >
              {sexualOrientationOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>

          <div className="col-span-2 text-center text-sm">
            Already have an account?{" "}
            <Link href="/signin" className="text-blue-600 hover:underline">Sign In</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
