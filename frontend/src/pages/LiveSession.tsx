import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import api from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import CreateQuestionModal from "../components/CreateQuestionModal";
import { getSessionAnalytics } from "../api/analytics";

export default function LiveSession() {
  const { id } = useParams();
  const nav = useNavigate();
  const { socket } = useSocket();
  const { token } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [online, setOnline] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  // Backend-calculated analytics
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch analytics from backend
  const fetchAnalytics = async () => {
    if (!id || !token) return;
    try {
      const res = await getSessionAnalytics(id, token);
      setAnalytics(res.data);
      setLoading(false);
    } catch (e) {
      console.error('[LiveSession] Error fetching analytics:', e);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id || !token) return;

    // Fetch session details
    (async () => {
      try {
        const res = await api.get(`/api/sessions`, { headers: { Authorization: `Bearer ${token}` } });
        const found = (res.data.sessions || []).find((s: any) => s.id === id);
        setSession(found);
      } catch (e) { console.error(e) }
    })();

    fetchAnalytics();
  }, [id, token]);

  useEffect(() => {
    if (!socket || !session) return;
    socket.emit("join-session", { sessionCode: session.code });

    const onPresence = (p: any) => setOnline(p.onlineCount);
    const onNewResponse = () => fetchAnalytics();
    const onNewQuestion = () => fetchAnalytics();
    const onQuestionActivated = () => fetchAnalytics();
    const onQuestionEnded = () => fetchAnalytics();

    socket.on("presence-update", onPresence);
    socket.on("new-response", onNewResponse);
    socket.on("new-question", onNewQuestion);
    socket.on("question-activated", onQuestionActivated);
    socket.on("question-ended", onQuestionEnded);

    return () => {
      socket.off("presence-update", onPresence);
      socket.off("new-response", onNewResponse);
      socket.off("new-question", onNewQuestion);
      socket.off("question-activated", onQuestionActivated);
      socket.off("question-ended", onQuestionEnded);
    };
  }, [socket, session]);

  const shareLink = session ? `${window.location.origin}/join/${session.code}` : "";

  const copyToClipboard = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activateQuestion = async (questionId: string) => {
    try {
      await api.post(`/api/questions/${questionId}/activate`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) { console.error(e) }
  };

  const endQuestion = async (questionId: string) => {
    try {
      await api.post(`/api/questions/${questionId}/end`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) { console.error(e) }
  };

  const toggleExpand = (qId: string) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  // Extract data from analytics
  const stats = analytics?.stats || { totalQuestions: 0, totalResponses: 0, totalFeedbacks: 0, totalActivity: 0 };
  const timeline = analytics?.timeline || [];
  const questions = analytics?.questions || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Floating 3D Background Elements - Subtle */}
        <div className="fixed top-20 right-10 w-32 h-32 bg-primary/3 rounded-full blur-3xl animate-float pointer-events-none"></div>
        <div className="fixed bottom-20 left-10 w-40 h-40 bg-primary/3 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>

        {/* Compact Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover-glow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/3 to-transparent rounded-bl-full -mr-16 -mt-16"></div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => nav("/presenter")}
                  className="text-gray-400 hover:text-primary transition-all text-sm font-medium hover:-translate-x-1 duration-200"
                >
                  ← Dashboard
                </button>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                  LIVE
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{session?.title || "Live Session"}</h1>
            </div>

            {session && (
              <div className="flex items-center gap-3">
                <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                  <div className="text-xs text-gray-500 font-medium mb-0.5">Code</div>
                  <div className="text-xl font-mono font-bold text-primary">{session.code}</div>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="px-5 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2"
                >
                  {copied ? (<><span>✓</span> Copied</>) : (<><span>🔗</span> Share</>)}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Compact Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover-lift group">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Online</div>
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 animate-count-up">{online}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover-lift group">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Questions</div>
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 animate-count-up">{stats.totalQuestions}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover-lift group">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Activity</div>
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M15.5 2A1.5 1.5 0 0014 3.5v8a1.5 1.5 0 003 0v-8A1.5 1.5 0 0015.5 2zM10.5 6A1.5 1.5 0 009 7.5v4a1.5 1.5 0 003 0v-4A1.5 1.5 0 0010.5 6zM5.5 10A1.5 1.5 0 004 11.5v.01a1.5 1.5 0 003 0v-.01A1.5 1.5 0 005.5 10z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-primary animate-count-up">{stats.totalActivity}</div>
          </div>
        </div>

        {/* Enhanced Activity Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Activity Timeline</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              Real-time
            </div>
          </div>
          <div className="h-[200px] w-full">
            {timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline}>
                  <defs>
                    <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff8000" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ff8000" stopOpacity={0.05} />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <XAxis
                    dataKey="minute"
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '11px',
                      padding: '6px 10px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    }}
                    labelStyle={{ color: '#ff8000' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#ff8000"
                    strokeWidth={3}
                    fill="url(#colorOrange)"
                    filter="url(#glow)"
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-2 opacity-20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                <div className="text-sm font-medium opacity-50">No activity yet</div>
              </div>
            )}
          </div>
        </div>

        {/* Compact Questions - 2 Column Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Questions & Responses</h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              New Question
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-16 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-gray-900 mb-1">No questions yet</h4>
              <p className="text-sm text-gray-500 mb-4">Create your first question to start engaging</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-primary font-bold hover:text-primary/80 transition-colors text-sm"
              >
                Create Question →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {questions.map((q: any) => {
                const isActive = q.isActive;
                const isExpanded = expandedQuestions.has(q.questionId);

                return (
                  <div
                    key={q.questionId}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-gray-100/50 group ${isActive ? 'border-primary/30 shadow-md shadow-primary/5 bg-white' : 'border-gray-100 bg-white'
                      }`}
                  >
                    {/* Gradient Header */}
                    <div className={`px-5 py-4 border-b ${isActive ? 'bg-gradient-to-r from-orange-50/50 to-white border-primary/10' : 'bg-gradient-to-r from-gray-50/50 to-white border-gray-50'}`}>
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                              {isActive ? "Live" : "Closed"}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-0.5 bg-white border border-gray-100 rounded-full shadow-sm">
                              {q.type === 'mcq' ? 'Multiple Choice' : 'Text Response'}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-gray-900 leading-snug truncate pr-2">{q.title}</h4>
                          <div className="mt-1.5 text-xs font-medium text-gray-500 flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-gray-400">
                              <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
                            </svg>
                            <span className={q.totalResponses > 0 ? "text-primary font-bold" : ""}>{q.totalResponses}</span>
                            <span>responses</span>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!isActive && (
                            <button
                              onClick={() => activateQuestion(q.questionId)}
                              className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                              title="Re-open Question"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                              </svg>
                            </button>
                          )}
                          {isActive && (
                            <button
                              onClick={() => endQuestion(q.questionId)}
                              className="p-2 bg-white border border-red-100 text-red-500 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
                              title="Stop Question"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Compact Content */}
                    <div className="p-5">
                      {q.type === "mcq" && q.optionBreakdown ? (
                        <div className="space-y-3">
                          {q.optionBreakdown.slice(0, isExpanded ? undefined : 3).map((optData: any) => {
                            const isWinner = q.totalResponses > 0 && optData.percentage === Math.max(...q.optionBreakdown.map((o: any) => o.percentage));

                            return (
                              <div key={optData.index} className="relative group/opt">
                                <div className="flex justify-between items-center mb-1.5">
                                  <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <span className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center font-bold transition-colors ${isWinner ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 group-hover/opt:bg-gray-200'}`}>
                                      {String.fromCharCode(65 + optData.index)}
                                    </span>
                                    <span className="truncate max-w-[180px]">{optData.option}</span>
                                  </div>
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-xs font-medium text-gray-400">{optData.count}</span>
                                    <span className={`text-sm font-bold ${isWinner ? 'text-primary' : 'text-gray-900'}`}>{optData.percentage}%</span>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 relative overflow-hidden">
                                  <div
                                    className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full ${isWinner ? 'bg-primary' : 'bg-gray-300'
                                      }`}
                                    style={{ width: `${optData.percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                          {q.optionBreakdown.length > 3 && (
                            <button
                              onClick={() => toggleExpand(q.questionId)}
                              className="text-xs text-gray-500 font-semibold hover:text-primary transition-colors mt-2 flex items-center gap-1"
                            >
                              {isExpanded ? 'Show less' : `+ ${q.optionBreakdown.length - 3} more options`}
                            </button>
                          )}
                        </div>
                      ) : q.type === "text" ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Responses</h5>
                            <span className="text-xs font-medium text-gray-500">{q.recentResponses.length} total</span>
                          </div>
                          {q.recentResponses.length > 0 ? (
                            <div className="space-y-2">
                              {q.recentResponses.slice(0, isExpanded ? undefined : 2).map((r: any) => (
                                <div key={r.id} className="bg-gray-50 p-3 rounded-xl text-sm text-gray-700 leading-relaxed border border-gray-100">
                                  "{r.textAnswer}"
                                </div>
                              ))}
                              {q.recentResponses.length > 2 && (
                                <button
                                  onClick={() => toggleExpand(q.questionId)}
                                  className="text-xs text-gray-500 font-semibold hover:text-primary transition-colors flex items-center gap-1"
                                >
                                  {isExpanded ? 'Show less' : `+ ${q.recentResponses.length - 2} more`}
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">
                              <p className="text-xs text-gray-400">No responses yet</p>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && <CreateQuestionModal sessionId={id!} onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
