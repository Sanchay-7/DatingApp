"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Easy image configuration - change these paths as needed
const IMAGES = {
  hero1: "/landing1.jpg",
  hero2: "/landing2.jpg",
  hero3: "/landing1.jpg",
  emailCard1: "/landing1.jpg",
  emailCard2: "/landing1.jpg",
  emailCard3: "/landing1.jpg",
  testimonial: "/landing1.jpg",
  qrCode: "/landing1.jpg",
  phones: "/landing1.jpg",
};

export default function Home() {
  const [open, setOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white text-black font-sans">
      {/* NAV */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-pink-600 flex items-center justify-center text-white font-bold">
              V
            </div>
            <span className="text-base sm:text-lg font-extrabold tracking-tight">
              Valise Dating
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-sm hover:underline" href="#date">Date</a>
            <a className="text-sm hover:underline" href="#bff">BFF</a>
            <a className="text-sm hover:underline" href="#stories">Stories</a>
            <a className="text-sm hover:underline" href="#events">Events</a>
            <Link href="/signin" className="px-5 py-2.5 bg-pink-600 text-white rounded-full hover:bg-pink-700">Sign In</Link>
            <Link href="/signup" className="px-5 py-2.5 border border-pink-600 text-pink-600 rounded-full hover:bg-pink-50">Sign Up</Link>
          </nav>

          {/* Mobile burger */}
          <button
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-pink-200"
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>

        {/* Mobile menu */}
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
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-yellow-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 flex flex-col md:flex-row items-center gap-8 md:gap-10">
          <div className="w-full md:w-1/2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-black">
              We exist to bring people closer to <span className="text-pink-600">love</span>.
            </h1>
            <p className="mt-4 text-gray-800 max-w-xl">
              Valise Dating helps members find meaningful and authentic relationships — with safety-first features and an easy, modern design.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/signup" className="flex-1 px-4 py-2.5 border border-pink-600 text-pink-600 rounded-full text-center">Sign Up</Link>
              <button className="px-5 py-3 rounded-full border border-black">Learn more</button>
            </div>
          </div>

          {/* Stacked photos */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative w-56 h-80 sm:w-72 sm:h-96 md:w-96 md:h-[420px] -rotate-3 sm:-rotate-6">
              <div className="absolute inset-0 bg-white rounded-2xl shadow-lg overflow-hidden">
                <Image src={IMAGES.hero1} alt="Dating app preview" fill className="object-cover" />
              </div>
              <div className="hidden sm:block absolute -right-4 sm:-right-6 top-10 sm:top-12 w-40 sm:w-56 h-56 sm:h-72 rounded-2xl shadow-lg overflow-hidden rotate-3">
                <Image src={IMAGES.hero2} alt="Dating app preview" fill className="object-cover" />
              </div>
              <div className="hidden sm:block absolute -right-8 sm:-right-14 top-20 sm:top-28 w-28 sm:w-40 h-40 sm:h-56 rounded-2xl shadow-lg overflow-hidden rotate-6">
                <Image src={IMAGES.hero3} alt="Dating app preview" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Watermark — large screens only */}
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden lg:flex items-center pl-6">
          <span className="font-extrabold text-black/10 leading-none select-none text-[18vw]">
            Valise
          </span>
        </div>
      </section>

      {/* HIGHLIGHT CARD */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 -mt-8 sm:-mt-10">
        <div className="bg-white rounded-2xl shadow-md ring-1 ring-black/5 p-5 sm:p-8 md:p-10 grid gap-6 md:grid-cols-2 items-center">
          <div className="flex flex-col gap-4">
            <h3 className="text-xl sm:text-2xl font-bold">Be the first to know</h3>
            <p className="text-gray-700">
              Sign up for updates about new features, match improvements, and safety tools — straight to your inbox.
            </p>
            <div className="mt-2 flex flex-col sm:flex-row gap-3">
              <input
                aria-label="email"
                placeholder="Your email"
                className="px-4 py-3 rounded-lg border border-gray-200 w-full sm:w-auto flex-1"
              />
              <Link href="/signup" className="flex-1 px-4 py-2.5 border border-pink-600 text-pink-600 rounded-full text-center">Sign Up</Link>
            </div>
          </div>
          <div className="flex gap-4 justify-center md:justify-end">
            <div className="w-24 h-40 sm:w-28 sm:h-48 md:w-36 md:h-56 rounded-xl shadow-inner overflow-hidden relative">
              <Image src={IMAGES.emailCard1} alt="Card preview" fill className="object-cover" />
            </div>
            <div className="w-24 h-40 sm:w-28 sm:h-48 md:w-36 md:h-56 rounded-xl shadow-inner overflow-hidden relative">
              <Image src={IMAGES.emailCard2} alt="Card preview" fill className="object-cover" />
            </div>
            <div className="w-24 h-40 sm:w-28 sm:h-48 md:w-36 md:h-56 rounded-xl shadow-inner overflow-hidden relative">
              <Image src={IMAGES.emailCard3} alt="Card preview" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* CARDS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        <article id="date" className="rounded-xl bg-yellow-50 p-6 shadow-sm">
          <h4 className="font-bold">Valise Date</h4>
          <p className="mt-2 text-sm text-gray-700">Whether you're new to dating or getting back out there, Valise Date brings safety and meaning to every connection.</p>
          <a className="mt-4 inline-block text-sm text-pink-600 font-medium" href="#">Find your person →</a>
        </article>

        <article id="bff" className="rounded-xl bg-yellow-50 p-6 shadow-sm">
          <h4 className="font-bold">BFF</h4>
          <p className="mt-2 text-sm text-gray-700">Meet like-minded friends when you move to a new city or want to grow your social circle.</p>
          <a className="mt-4 inline-block text-sm text-pink-600 font-medium" href="#">Find your people →</a>
        </article>

        <article id="events" className="rounded-xl bg-yellow-50 p-6 shadow-sm">
          <h4 className="font-bold">Events</h4>
          <p className="mt-2 text-sm text-gray-700">Join local IRL events to stop typing and start meeting—safe, curated experiences for singles and friends.</p>
          <a className="mt-4 inline-block text-sm text-pink-600 font-medium" href="#">See events →</a>
        </article>
      </section>

      {/* TESTIMONIALS */}
      <section id="stories" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid gap-6 md:grid-cols-2 items-center">
          <div>
            <blockquote className="text-xl sm:text-2xl md:text-3xl font-bold">
              "We are both naturally positive, happy-go-getters — but when you put us together, it feels like there is nothing we can't accomplish."
            </blockquote>
            <p className="mt-4 text-sm text-gray-500">Leslie & Thomas, married in 2025</p>
            <button className="mt-6 px-4 py-2 rounded-full bg-black text-white">Read more stories</button>
          </div>
          <div className="rounded-xl overflow-hidden bg-gray-50 p-4 flex items-center justify-center">
            <div className="w-52 h-52 sm:w-64 sm:h-64 rounded-lg shadow-md overflow-hidden relative">
              <Image src={IMAGES.testimonial} alt="Happy couple" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* PROMO + CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="rounded-2xl p-6 bg-yellow-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold">Get the app</h3>
            <p className="mt-2 text-gray-700">Scan the QR code or download from your app store to get started.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 bg-white rounded-lg shadow overflow-hidden relative">
              <Image src={IMAGES.qrCode} alt="QR Code" fill className="object-cover" />
            </div>
            <div className="w-28 h-60 sm:w-32 sm:h-64 md:w-40 md:h-72 bg-white rounded-lg shadow overflow-hidden relative">
              <Image src={IMAGES.phones} alt="App on phones" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-white py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="text-2xl font-bold">Valise</div>
            <p className="text-sm text-gray-300 mt-2">© {new Date().getFullYear()} Valise Dating. All rights reserved.</p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-12">
            <div>
              <h5 className="font-semibold">Company</h5>
              <ul className="mt-2 text-sm text-gray-300 space-y-1">
                <li>About</li><li>Careers</li><li>Contact</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold">Legal</h5>
              <ul className="mt-2 text-sm text-gray-300 space-y-1">
                <li>Privacy</li><li>Terms</li><li>Safety</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}