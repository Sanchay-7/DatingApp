"use client";
import Link from "next/link";
import { useState } from "react";

export default function NavClient() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav className="hidden md:flex items-center gap-6">
        <a className="text-sm hover:underline" href="#date">Date</a>
        <a className="text-sm hover:underline" href="#bff">BFF</a>
        <a className="text-sm hover:underline" href="#stories">Stories</a>
        <a className="text-sm hover:underline" href="#events">Events</a>
        <Link href="/signin" className="px-5 py-2.5 bg-pink-600 text-white rounded-full hover:bg-pink-700">Sign In</Link>
        <Link href="/signup" className="px-5 py-2.5 border border-pink-600 text-pink-600 rounded-full hover:bg-pink-50">Sign Up</Link>
      </nav>

      <button
        className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-pink-200"
        onClick={() => setOpen(v => !v)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {open && (
        <div className="md:hidden border-t border-pink-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 grid gap-3">
            <a className="py-2 hover:underline" href="#date" onClick={() => setOpen(false)}>Date</a>
            <a className="py-2 hover:underline" href="#bff" onClick={() => setOpen(false)}>BFF</a>
            <a className="py-2 hover:underline" href="#stories" onClick={() => setOpen(false)}>Stories</a>
            <a className="py-2 hover:underline" href="#events" onClick={() => setOpen(false)}>Events</a>
            <div className="flex gap-3 pt-2">
              <Link href="/signin" className="flex-1 px-4 py-2.5 bg-pink-600 text-white rounded-full text-center">Sign In</Link>
              <Link href="/signup" className="flex-1 px-4 py-2.5 border border-pink-600 text-pink-600 rounded-full text-center">Sign Up</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
