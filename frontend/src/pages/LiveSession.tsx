import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import api from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function LiveSession(){
  const { id } = useParams();
  const { socket } = useSocket();
  const { token } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [online, setOnline] = useState(0);
  const [timeseries, setTimeseries] = useState<any[]>([]);

  useEffect(()=>{
    if(!id || !token) return;
    (async ()=>{
      try{
        const res = await api.get(`/api/sessions`, { headers: { Authorization: `Bearer ${token}` }});
        const found = (res.data.sessions || []).find((s:any)=> s.id === id);
        setSession(found);
      }catch(e){console.error(e)}
    })();
    (async ()=> {
      try {
        const res = await api.get(`/api/sessions/${id}/feedbacks`, { headers: { Authorization: `Bearer ${token}` }});
        setFeedbacks(res.data.feedbacks || []);
      } catch (e) { console.error(e) }
    })();
    (async ()=> {
      try {
        const r = await api.get(`/api/sessions/${id}/analytics`, { headers: { Authorization: `Bearer ${token}` }});
        setTimeseries((r.data.timeseries||[]).map((t:any)=>({ minute: t.minute.slice(11,16), count: t.count })));
      } catch (e) { console.error(e) }
    })();
  }, [id, token]);

  useEffect(()=>{
    if(!socket || !session) return;
    socket.emit("join-session", { sessionCode: session.code });
    const onPresence = (p:any) => setOnline(p.onlineCount);
    const onNewFeedback = (f:any) => setFeedbacks(prev => [f, ...prev]);

    socket.on("presence-update", onPresence);
    socket.on("new-feedback", onNewFeedback);

    return ()=> {
      socket.off("presence-update", onPresence);
      socket.off("new-feedback", onNewFeedback);
    };
  }, [socket, session]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Live: {session?.title}</h1>
        <div className="text-sm text-gray-600">Online: {online}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Feedback</h3>
          <div className="space-y-2 max-h-[60vh] overflow-auto">
            {feedbacks.map(f=>(
              <div key={f.id} className="p-2 border rounded">
                <div className="text-sm text-gray-600">{new Date(f.createdAt).toLocaleTimeString()}</div>
                <div>{f.message || f.emoji}</div>
                <div className="text-xs text-gray-500">sentiment: {f.sentimentScore ?? "—"}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Sentiment Timeline</h3>
          <div style={{ width: 300, height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={timeseries}>
                <XAxis dataKey="minute" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
