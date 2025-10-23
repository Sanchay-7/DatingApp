import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black font-sans">
      {/* NAV */}
      <header className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-pink-500 flex items-center justify-center text-white font-bold">V</div>
          <span className="text-lg font-bold">Valise Dating</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a className="text-sm hover:underline" href="#date">Date</a>
          <a className="text-sm hover:underline" href="#bff">BFF</a>
          <a className="text-sm hover:underline" href="#stories">Stories</a>
          <a className="text-sm hover:underline" href="#events">Events</a>
          <button className="px-4 py-2 rounded-full bg-black text-white text-sm">Sign in</button>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-yellow-300">
        <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-10">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.02] text-black">We exist to bring people closer to <span className="text-pink-600">love</span>.</h1>
            <p className="mt-4 text-gray-800 max-w-xl">Valise Dating helps members find meaningful and authentic relationships — with safety-first features and an easy, modern design.</p>
            <div className="mt-6 flex gap-3">
              <button className="px-5 py-3 rounded-full bg-black text-white">Download Valise</button>
              <button className="px-5 py-3 rounded-full border border-black">Learn more</button>
            </div>
          </div>

          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-72 h-96 md:w-96 md:h-[420px] transform -rotate-6">
              <div className="absolute inset-0 bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Placeholder for stacked photos */}
                <div className="w-full h-full bg-[url('/images/placeholder-1.jpg')] bg-cover bg-center"></div>
              </div>
              <div className="absolute -right-6 top-12 w-56 h-72 rounded-2xl shadow-lg overflow-hidden transform rotate-3 bg-[url('/images/placeholder-2.jpg')] bg-cover bg-center"></div>
              <div className="absolute -right-14 top-28 w-40 h-56 rounded-2xl shadow-lg overflow-hidden transform rotate-6 bg-[url('/images/placeholder-3.jpg')] bg-cover bg-center"></div>
            </div>
          </div>
        </div>

        {/* Large watermark text */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6">
          <span className="text-[200px] font-extrabold text-black/10 leading-none select-none">Valise</span>
        </div>
      </section>

      {/* HIGHLIGHT CARD */}
      <section className="max-w-6xl mx-auto px-6 py-12 -mt-10">
        <div className="bg-white rounded-2xl shadow-md ring-1 ring-black/5 p-6 md:p-10 grid md:grid-cols-2 gap-6 items-center">
          <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-bold">Be the first to know</h3>
            <p className="text-gray-700">Sign up for updates about new features, match improvements, and safety tools — straight to your inbox.</p>
            <div className="mt-4 flex gap-3">
              <input aria-label="email" placeholder="Your email" className="px-4 py-3 rounded-lg border border-gray-200 w-full md:w-auto" />
              <button className="px-5 py-3 rounded-lg bg-black text-white">Sign up</button>
            </div>
          </div>
          <div className="flex gap-4 justify-center md:justify-end">
            <div className="w-36 h-56 bg-gray-100 rounded-xl shadow-inner flex items-center justify-center">Card</div>
            <div className="w-36 h-56 bg-gray-100 rounded-xl shadow-inner flex items-center justify-center">Card</div>
            <div className="w-36 h-56 bg-gray-100 rounded-xl shadow-inner flex items-center justify-center">Card</div>
          </div>
        </div>
      </section>

      {/* CARDS GRID */}
      <section className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-6">
        <article className="rounded-xl bg-yellow-50 p-6 shadow-sm">
          <h4 className="font-bold">Valise Date</h4>
          <p className="mt-2 text-sm text-gray-700">Whether you’re new to dating or getting back out there, Valise Date brings safety and meaning to every connection.</p>
          <a className="mt-4 inline-block text-sm text-pink-600 font-medium" href="#">Find your person →</a>
        </article>

        <article className="rounded-xl bg-yellow-50 p-6 shadow-sm">
          <h4 className="font-bold">BFF</h4>
          <p className="mt-2 text-sm text-gray-700">Meet like-minded friends when you move to a new city or want to grow your social circle.</p>
          <a className="mt-4 inline-block text-sm text-pink-600 font-medium" href="#">Find your people →</a>
        </article>

        <article className="rounded-xl bg-yellow-50 p-6 shadow-sm">
          <h4 className="font-bold">Events</h4>
          <p className="mt-2 text-sm text-gray-700">Join local IRL events to stop typing and start meeting—safe, curated experiences for singles and friends.</p>
          <a className="mt-4 inline-block text-sm text-pink-600 font-medium" href="#">See events →</a>
        </article>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <blockquote className="text-2xl md:text-3xl font-bold">“We are both naturally positive, happy-go-getters — but when you put us together, it feels like there is nothing we can’t accomplish.”</blockquote>
            <p className="mt-4 text-sm text-gray-500">Leslie & Thomas, married in 2025</p>
            <button className="mt-6 px-4 py-2 rounded-full bg-black text-white">Read more stories</button>
          </div>
          <div className="rounded-xl overflow-hidden bg-gray-50 p-4 flex items-center justify-center">
            <div className="w-64 h-64 bg-[url('/images/couple.jpg')] bg-cover bg-center rounded-lg shadow-md"></div>
          </div>
        </div>
      </section>

      {/* PROMO + CTA */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="rounded-2xl p-6 bg-yellow-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold">Get the app</h3>
            <p className="mt-2 text-gray-700">Scan the QR code or download from your app store to get started.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-36 h-36 bg-white rounded-lg shadow flex items-center justify-center">QR</div>
            <div className="w-40 h-72 bg-white rounded-lg shadow flex items-center justify-center">Phones</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <div className="text-2xl font-bold">Valise</div>
            <p className="text-sm text-gray-300 mt-2">© {new Date().getFullYear()} Valise Dating. All rights reserved.</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold">Company</h5>
              <ul className="mt-2 text-sm text-gray-300">
                <li>About</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold">Legal</h5>
              <ul className="mt-2 text-sm text-gray-300">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Safety</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
