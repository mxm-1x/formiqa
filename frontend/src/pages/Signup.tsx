import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import authImage from "../assets/auth.png";
export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");

    try {
      await signup(name, email, password);
      nav("/presenter");
    } catch (error: any) {
      setErr(error?.response?.data?.error || "Signup failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* LEFT IMAGE SECTION */}
      <div className="hidden md:flex w-1/2 relative overflow-hidden rounded-3xl m-4">

        <img
          src={authImage}
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-sm brightness-50"
        />

        <div className="absolute bottom-10 left-10 text-white px-4">
          <h2 className="text-3xl font-semibold mb-4">
            Manage Feedbacks Efficiently
          </h2>
          <p className="max-w-sm text-gray-200">
            Easily track feedback, maintenance, and
            responses in one place.
          </p>
        </div>
      </div>

      {/* RIGHT SIGNUP CARD */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-500 mb-6">Join Formiqa today</p>

          {err && <p className="text-red-600 mb-3">{err}</p>}

          <form onSubmit={handleSignup} className="space-y-4">
            <input
              placeholder="Full Name"
              className="w-full p-3.5 border rounded-full bg-gray-50"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              placeholder="Email"
              type="email"
              className="w-full p-3.5 border rounded-full bg-gray-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              placeholder="Password"
              type="password"
              className="w-full p-3.5 border rounded-full bg-gray-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              className="w-full bg-primary text-white py-3 rounded-full text-lg hover:bg-primary/80"
              disabled={loading}
            >
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm mt-8 text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
