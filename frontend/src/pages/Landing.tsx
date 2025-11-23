import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* NAVBAR */}
      <header className="w-full py-4 shadow-sm bg-white">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
          <h1 className="text-2xl font-bold text-indigo-600">RT Feedback</h1>
          <div className="flex gap-4">
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">Login</Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto px-4 py-16">
        <div className="md:w-1/2">
          <h2 className="text-4xl font-extrabold leading-tight">
            Real-time feedback for your <span className="text-indigo-600">classrooms</span>, 
            <span className="text-indigo-600"> workshops</span>, and <span className="text-indigo-600">presentations</span>.
          </h2>
          <p className="text-gray-600 mt-4 text-lg">
            Instantly collect reactions, emoji feedback, and sentiment analysis from your audience — live.
            Perfect for teachers, trainers, speakers, and workshop hosts.
          </p>

          <div className="mt-6 flex gap-4">
            <Link
              to="/signup"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg text-lg hover:bg-indigo-700"
            >
              Start for Free
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg text-lg hover:bg-indigo-50"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
          <img
            src="https://cdn.dribbble.com/users/1187836/screenshots/16783257/media/72a2f5a2fc36505f8e0e62c42e9f6207.png?compress=1&resize=1200x900&vertical=top"
            alt="Illustration"
            className="rounded-xl shadow-lg w-4/5"
          />
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-10">Why RT Feedback?</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow">
              <h4 className="text-xl font-semibold mb-2">Real-time Reactions</h4>
              <p className="text-gray-600">Viewers send emoji or text feedback instantly during your session.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h4 className="text-xl font-semibold mb-2">AI Sentiment Analysis</h4>
              <p className="text-gray-600">
                Our built-in sentiment engine tells you how the audience feels — positive, neutral, or negative.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h4 className="text-xl font-semibold mb-2">Presenter Dashboard</h4>
              <p className="text-gray-600">
                View live charts, feedback timeline, and online viewer count in one unified dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to improve your sessions?</h2>
        <p className="text-gray-600 mb-6">Create your first live session in 30 seconds.</p>
        <Link
          to="/signup"
          className="px-8 py-4 bg-indigo-600 text-white rounded-lg text-lg hover:bg-indigo-700"
        >
          Get Started → 
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="py-6 bg-gray-100 text-center text-gray-600">
        © {new Date().getFullYear()} RT Feedback — All rights reserved.
      </footer>
    </div>
  );
}
