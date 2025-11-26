import React from "react";
import { Link } from "react-router-dom";
import authImage from "../assets/auth.png";
export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-primary/20 selection:text-primary">

      {/* Navigation (Simple) */}
      <nav className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center max-w-7xl mx-auto w-full z-10">
        <div className="text-xl font-bold tracking-tighter">Formiqa.</div>
        <div className="space-x-6 text-sm font-medium">
          <Link to="/login" className="hover:text-primary transition-colors">Login</Link>
          <Link to="/signup" className="bg-gray-900 text-white px-5 py-2 rounded-full hover:bg-black transition-all">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div className="max-w-4xl">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight leading-[0.9] mb-8">
            Hey,<br />
            we are Formiqa
          </h1>
          <p className="text-xl sm:text-2xl text-gray-500 max-w-2xl leading-relaxed font-medium">
            — A real-time audience engagement platform nudging presenters, teams, and brands into greatness.
          </p>
        </div>
      </header>

      {/* Hero Image Placeholder */}
      <div className="w-full h-[50vh] sm:h-[70vh] bg-gray-100 overflow-hidden relative">
        <img
          src={authImage}
          className="absolute inset-0 w-full h-full object-cover scale-110 brightness-50"
        />
      </div>

      {/* About / Mission Section */}
      <section className="max-w-3xl mx-auto px-6 py-24 sm:py-32">
        <div className="space-y-8 text-lg sm:text-xl leading-relaxed text-gray-600">
          <p>
            We've spent years observing presentations, workshops, and meetings. We noticed a pattern: <strong className="text-gray-900">great content often falls flat without engagement.</strong>
          </p>
          <p>
            We built Formiqa to solve this. It's not just about asking questions; it's about creating a dialogue.
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 pt-8 leading-tight">
            We go directly to the source of what makes or breaks a session — <span className="text-primary">interaction.</span>
          </h2>
          <p>
            We're looking for impact-driven presenters who want to connect with their audience, not just talk at them. Whether it's a classroom, a boardroom, or a conference hall, we're here to bridge the gap.
          </p>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <h2 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-16 max-w-3xl">
          Here’s what you can expect from us...
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card 1: Real-time Feedback */}
          <div className="bg-white border-2 border-orange-100 p-10 rounded-[2.5rem] min-h-[400px] flex flex-col justify-between group hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500"></div>
            <img src="/src/assets/illustration-feedback.png" className="absolute right-[-20px] bottom-[-20px] w-64 h-auto opacity-80 transition-transform duration-500" />
            <h3 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-gray-900 relative z-10">
              I'll bring colour, big energy and fresh thinking.
              <br /><span className="text-primary/60 text-2xl mt-2 block font-normal">— Real-time Feedback</span>
            </h3>
          </div>

          {/* Card 2: Live Q&A */}
          <div className="bg-white border-2 border-orange-100 p-10 rounded-[2.5rem] min-h-[400px] flex flex-col justify-between group hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500"></div>
            <img src="/src/assets/illustration-qa.png" className="absolute right-[-20px] bottom-[-20px] w-64 h-auto opacity-80 transition-transform duration-500" />
            <h3 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-gray-900 relative z-10">
              Learn, challenge and reconnect the dots — joining your team with conviction.
              <br /><span className="text-primary/60 text-2xl mt-2 block font-normal">— Live Q&A</span>
            </h3>
          </div>

          {/* Card 3: Interaction */}
          <div className="bg-white border-2 border-orange-100 p-10 rounded-[2.5rem] min-h-[400px] flex flex-col justify-between group hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500"></div>
            <img src="/src/assets/illustration-interaction.png" className="absolute right-[-20px] bottom-[-20px] w-64 h-auto opacity-80 transition-transform duration-500" />
            <h3 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-gray-900 relative z-10">
              Recognise potential — pushing people to become better than possible.
              <br /><span className="text-primary/60 text-2xl mt-2 block font-normal">— Audience Interaction</span>
            </h3>
          </div>

          {/* Card 4: Integration */}
          <div className="md:col-span-2 bg-white border-2 border-orange-100 p-10 rounded-[2.5rem] min-h-[300px] flex flex-col justify-center group hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-bl-full -mr-20 -mt-20 transition-transform duration-500"></div>
            <h3 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-gray-900 max-w-4xl relative z-10">
              Teach teams to move at velocity and have a hell of a lot of fun doing it.
              <br /><span className="text-primary/60 text-2xl mt-2 block font-normal">— Seamless Integration</span>
            </h3>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
        <p>&copy; 2025 Formiqa. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 sm:mt-0">
          <a href="#" className="hover:text-gray-900 transition-colors">Twitter</a>
          <a href="#" className="hover:text-gray-900 transition-colors">LinkedIn</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Instagram</a>
        </div>
      </footer>

    </div>
  );
}
