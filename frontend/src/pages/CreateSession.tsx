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
      nav("/presenter"); // redirect to dashboard
    } catch (error: any) {
      console.error(error);
      setErr(error?.response?.data?.error || "Failed to create session");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleCreate}
        className="bg-white w-full max-w-md rounded-xl shadow p-6"
      >
        <h1 className="text-2xl font-bold mb-4">Create New Session</h1>

        {err && <p className="text-red-600 mb-2">{err}</p>}

        <label className="block mb-2 text-sm font-medium">Session Title</label>
        <input
          type="text"
          className="input mb-4"
          placeholder="e.g. AI Workshop, Class #3 Feedback"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="block mb-2 text-sm font-medium">Visibility</label>
        <select
          className="input mb-4"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="btn w-full mt-3 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Session"}
        </button>

        <button
          type="button"
          onClick={() => nav("/presenter")}
          className="mt-4 text-sm text-blue-600 underline"
        >
          Back to Dashboard
        </button>
      </form>
    </div>
  );
}
