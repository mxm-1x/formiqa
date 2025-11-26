import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

export default function CreateSession() {
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const nav = useNavigate();
  const { token } = useAuth();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      if (!title.trim()) {
        setErr("Please enter a session title.");
        setLoading(false);
        return;
      }

      const res = await api.post(
        "/api/sessions",
        { title, visibility },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const session = res.data.session;
      nav("/presenter");
    } catch (error: any) {
      console.error(error);
      setErr(error?.response?.data?.error || "Failed to create session");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Illustration */}
        <div className="text-center mb-12">
          <img
            src="/src/assets/illustration-create.png"
            alt="Create Session"
            className="w-64 h-auto mx-auto mb-6 opacity-90"
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Create New Session
          </h1>
          <p className="text-gray-600 text-lg">
            Set up a new session to start engaging with your audience
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl mx-auto">
          <form onSubmit={handleCreate} className="p-8">
            {err && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-red-600 text-sm font-medium">{err}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Session Title
                </label>
                <input
                  type="text"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-gray-900"
                  placeholder="e.g. AI Workshop, Class #3 Feedback"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Choose a descriptive name that participants will recognize
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Visibility
                </label>
                <select
                  className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-gray-900"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                >
                  <option value="public">Public - Anyone with the code can join</option>
                  <option value="private">Private - Invite only</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={() => nav("/presenter")}
                className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-orange-50 hover:text-primary hover:border-primary/30 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-white px-6 py-4 rounded-xl font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating...
                  </span>
                ) : (
                  "Create Session"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
