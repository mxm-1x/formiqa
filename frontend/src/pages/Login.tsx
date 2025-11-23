import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import authImage from "../assets/auth.png";

export default function Login() {
    const { login } = useAuth();
    const nav = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErr("");

        try {
            await login(email, password);
            nav("/presenter");
        } catch (error: any) {
            setErr(error?.response?.data?.error || "Login failed");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* LEFT IMAGE SECTION */}
<div className="hidden md:flex w-1/2 relative overflow-hidden rounded-3xl m-4">
                <img
                    src={authImage}
                    className="absolute inset-0 w-full h-full object-cover scale-110 brightness-50"
                />

                <div className="absolute bottom-10 left-10 text-white px-4">
                    <h2 className="text-3xl font-semibold mb-4">
                        Manage Properties Efficiently
                    </h2>
                    <p className="max-w-sm text-gray-200">
                        Easily track rent payments, maintenance requests, and tenant
                        communications in one place. Say goodbye to the hassle of manual
                        management.
                    </p>
                </div>
            </div>

            {/* RIGHT LOGIN CARD */}
            <div className="w-full md:w-1/2 flex items-center justify-center px-6">
                <div className="w-full max-w-md">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome Back to Real Nest!
                    </h1>
                    <p className="text-gray-500 mb-6">Sign in to your account</p>

                    {err && <p className="text-red-600 mb-3">{err}</p>}

                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* EMAIL */}
                        <input
                            type="email"
                            placeholder="Your Email"
                            className="w-full p-3.5 border rounded-full bg-gray-50"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        {/* PASSWORD */}
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full p-3.5 border rounded-full bg-gray-50"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        {/* OPTIONS */}
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="w-4 h-4" />
                                Remember Me
                            </label>

                            <a href="#" className="hover:underline">
                                Forgot Password?
                            </a>
                        </div>

                        {/* LOGIN BUTTON */}
                        <button
                            className="w-full bg-blue-600 text-white py-3 rounded-full text-lg hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    {/* DIVIDER */}
                    <div className="relative my-8">
                        <hr />
                        <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-gray-500 text-sm">
                            Instant Login
                        </p>
                    </div>

                    {/* SOCIAL LOGIN */}
                    <div className="flex gap-4">
                        <button className="flex-1 border py-3 rounded-full flex items-center justify-center gap-2">
                            <img
                                src="https://www.svgrepo.com/show/355037/google.svg"
                                className="w-5"
                            />
                            Sign in with Google
                        </button>

                        <button className="flex-1 border py-3 rounded-full flex items-center justify-center gap-2">
                            <img
                                src="https://www.svgrepo.com/show/475656/apple-black.svg"
                                className="w-5"
                            />
                            Sign in with Apple
                        </button>
                    </div>

                    {/* REGISTER */}
                    <p className="text-center text-sm mt-8 text-gray-600">
                        Don’t have an account?{" "}
                        <Link to="/signup" className="text-blue-600 font-semibold">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
