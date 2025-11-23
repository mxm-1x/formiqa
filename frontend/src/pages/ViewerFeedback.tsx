import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/apiClient";
import { submitFeedback } from "../api/feedback";

export default function ViewerFeedback(){
  const { code } = useParams();
  const [session, setSession] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    if(!code) return;
    api.get(`/api/sessions/code/${code}`).then(r=>setSession(r.data.session)).catch(()=>setSession(null));
  },[code]);

  const send = async (type = "text", emoji?: string) => {
    if(!code) return;
    setLoading(true);
    try {
      await submitFeedback(code, { type, emoji: emoji||null, message: type==="text" ? message : undefined });
      if(type === "text") setMessage("");
      alert("Sent!");
    } catch (e:any) {
      alert(e?.response?.data?.error || "Failed");
    } finally {
      setLoading(false);
    }
  };

  if(!session) return <div className="p-6">Loading session... or invalid code.</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-2">{session.title || "Live Session"}</h2>
      <div className="mb-4">
        <button className="btn mr-2" onClick={()=>send("emoji","👍")}>👍</button>
        <button className="btn mr-2" onClick={()=>send("emoji","👎")}>👎</button>
      </div>
      <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Type feedback..." className="mb-2"></textarea>
      <div>
        <button className="btn" onClick={()=>send("text")} disabled={loading}>{loading ? "Sending..." : "Send"}</button>
      </div>
    </div>
  );
}
