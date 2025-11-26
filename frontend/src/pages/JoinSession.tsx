import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JoinSession() {
  const [code, setCode] = useState("");
  const nav = useNavigate();

  const submit = (e: any) => {
    e.preventDefault();
    if (code.trim()) nav(`/join/${code.trim()}`);
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* LEFT ILLUSTRATION SECTION */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-orange-50 to-white items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-300 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 text-center">
          <img
            src="/src/assets/illustration-waiting.png"
            alt="Join Session"
            className="w-80 h-auto mx-auto mb-8"
          />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join the Conversation
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Enter your session code to start sharing feedback and participating in real-time Q&A.
          </p>
        </div>
      </div>

      {/* RIGHT FORM SECTION */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Join Session
            </h1>
            <p className="text-gray-500">Enter the session code provided by your presenter</p>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Code
              </label>
              <input
                className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all text-lg font-mono uppercase tracking-widest text-center"
                placeholder="ABCD1234"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                maxLength={8}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-4 rounded-xl text-lg font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!code.trim()}
            >
              Join Session
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Don't have a code? Ask your presenter to share it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
