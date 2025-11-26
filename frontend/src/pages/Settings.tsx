import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
    const { user } = useAuth();

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                    <p className="text-sm text-gray-500">Update your account's profile information and email address.</p>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={user?.email || ""}
                            disabled
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                    </div>
                </div>
                <div className="p-4 bg-gray-50 text-right">
                    <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
