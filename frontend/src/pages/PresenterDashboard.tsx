import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/apiClient";
import { Link } from "react-router-dom";

export default function PresenterDashboard(){
  const { token, user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  useEffect(()=>{
    (async ()=>{
      try {
        const res = await api.get("/api/sessions", { headers: { Authorization: `Bearer ${token}` }});
        setSessions(res.data.sessions || []);
      } catch (e) {
        console.error(e);
      }
    })();
  },[token]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Sessions</h1>
        <Link to="/presenter/create" className="btn">Create</Link>
      </div>
      <div className="grid gap-2">
        {sessions.length === 0 && <div className="p-4 bg-white rounded shadow">No sessions yet</div>}
        {sessions.map(s=>(
          <div key={s.id} className="p-4 bg-white rounded shadow flex justify-between items-center">
            <div>
              <div className="text-lg">{s.title || "Untitled"}</div>
              <div className="text-sm text-gray-500">Code: {s.code}</div>
            </div>
            <div className="flex gap-2">
              <Link to={`/presenter/session/${s.id}`} className="btn">Open</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
