import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JoinSession() {
  const [code, setCode] = useState("");
  const nav = useNavigate();
  const submit = (e:any) => { e.preventDefault(); if(code.trim()) nav(`/join/${code.trim()}`); };
  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Join Session</h2>
        <input className="input mb-2" placeholder="Enter code" value={code} onChange={e=>setCode(e.target.value)} />
        <button className="btn mt-2 w-full">Join</button>
      </form>
    </div>
  );
}
