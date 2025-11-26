import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import api from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import CreateQuestionModal from "../components/CreateQuestionModal";
import { getSessionAnalytics } from "../api/analytics";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Users,
  MessageSquare,
  Activity,
  Check,
  ArrowLeft,
  Play,
  Square,
  Plus,
  ChevronDown,
  ChevronUp,
  Share2
} from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 }
  }
};

const cardHover = {
  scale: 1.02,
  y: -5,
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  transition: { type: "spring" as const, stiffness: 400, damping: 17 }
};

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
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-white relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Dynamic Background Elements */}
      <motion.div
        className="fixed top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed bottom-20 left-10 w-96 h-96 bg-orange-100/20 rounded-full blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -30, 0],
          y: [0, 50, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 relative z-10">

        {/* Header Section */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-100 p-6 relative overflow-hidden"
          variants={itemVariants}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -mr-20 -mt-20 pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
            <div>
              <motion.button
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => nav("/presenter")}
                className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors text-sm font-medium mb-3"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </motion.button>

              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{session?.title || "Live Session"}</h1>
                <motion.span
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200"
                  animate={{ boxShadow: ["0 0 0 0 rgba(74, 222, 128, 0.4)", "0 0 0 4px rgba(74, 222, 128, 0)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  LIVE
                </motion.span>
              </div>
              <p className="text-gray-500 text-sm">Manage your interactive session in real-time</p>
            </div>

            {session && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 flex flex-col items-center justify-center min-w-[120px]">
                  <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Session Code</div>
                  <div className="text-2xl font-mono font-black text-primary tracking-widest">{session.code}</div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "#f97316" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyToClipboard}
                  className="px-6 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 min-w-[140px]"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div
                        key="copied"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        <span>Copied!</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Share2 className="w-5 h-5" />
                        <span>Share Link</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            variants={itemVariants}
            whileHover={cardHover}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
              <Users className="w-24 h-24 text-green-500" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shadow-sm">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Active Users</div>
            </div>
            <div className="text-4xl font-black text-gray-900 tracking-tight">
              {online}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={cardHover}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
              <MessageSquare className="w-24 h-24 text-blue-500" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Questions</div>
            </div>
            <div className="text-4xl font-black text-gray-900 tracking-tight">
              {stats.totalQuestions}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={cardHover}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
              <Activity className="w-24 h-24 text-primary" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                <Activity className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Engagement</div>
            </div>
            <div className="text-4xl font-black text-primary tracking-tight">
              {stats.totalActivity}
            </div>
          </motion.div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Questions */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                Questions & Responses
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Question
              </motion.button>
            </div>

            <LayoutGroup>
              <AnimatePresence>
                {questions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center"
                  >
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No questions yet</h3>
                    <p className="text-gray-500 mb-6 max-w-xs mx-auto">Start engaging your audience by creating your first question.</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowCreateModal(true)}
                      className="text-primary font-bold hover:text-primary/80"
                    >
                      Create Question →
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {questions.map((q: any) => {
                      const isActive = q.isActive;
                      const isExpanded = expandedQuestions.has(q.questionId);

                      return (
                        <motion.div
                          layout
                          key={q.questionId}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`group relative bg-white rounded-xl border transition-all duration-200 ${isActive
                            ? 'border-primary/40 shadow-md shadow-primary/5'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            }`}
                        >
                          {/* Status Indicator Line */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-colors ${isActive ? 'bg-primary' : 'bg-transparent'}`} />

                          <div className="p-4 pl-5">
                            {/* Header: Title & Actions */}
                            <div className="flex justify-between items-start gap-3 mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  {isActive && (
                                    <span className="flex h-2 w-2 relative">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                  )}
                                  <h3 className={`text-sm font-semibold truncate ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                                    {q.title}
                                  </h3>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                  <span className="flex items-center gap-1">
                                    {q.type === 'mcq' ? <Activity className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                                    {q.type === 'mcq' ? 'Poll' : 'Open Ended'}
                                  </span>
                                  <span>•</span>
                                  <span className={q.totalResponses > 0 ? "text-gray-700 font-medium" : ""}>
                                    {q.totalResponses} responses
                                  </span>
                                </div>
                              </div>

                              {/* Hover Actions */}
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!isActive ? (
                                  <button
                                    onClick={() => activateQuestion(q.questionId)}
                                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                    title="Activate"
                                  >
                                    <Play className="w-4 h-4 fill-current" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => endQuestion(q.questionId)}
                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="End"
                                  >
                                    <Square className="w-4 h-4 fill-current" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Concise Content */}
                            <div className="space-y-2">
                              {q.type === "mcq" && q.optionBreakdown ? (
                                <div className="space-y-1.5">
                                  {/* Show only top 2 options or all if expanded */}
                                  {q.optionBreakdown.slice(0, isExpanded ? undefined : 2).map((optData: any) => {
                                    const isWinner = q.totalResponses > 0 && optData.percentage === Math.max(...q.optionBreakdown.map((o: any) => o.percentage));
                                    return (
                                      <div key={optData.index} className="flex items-center gap-2 text-xs">
                                        <div className="w-4 font-medium text-gray-400">{String.fromCharCode(65 + optData.index)}</div>
                                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                          <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${optData.percentage}%` }}
                                            className={`h-full rounded-full ${isWinner ? 'bg-primary' : 'bg-gray-300'}`}
                                          />
                                        </div>
                                        <div className="w-8 text-right font-medium text-gray-600">{optData.percentage}%</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : q.type === "text" ? (
                                <div className="space-y-1.5">
                                  {q.recentResponses.length > 0 ? (
                                    q.recentResponses.slice(0, isExpanded ? undefined : 1).map((r: any, idx: number) => (
                                      <div key={idx} className="text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded border border-gray-100 truncate">
                                        "{r.textAnswer}"
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-xs text-gray-400 italic">No responses yet</div>
                                  )}
                                </div>
                              ) : null}

                              {/* Expand Toggle */}
                              {(q.optionBreakdown?.length > 2 || q.recentResponses?.length > 1) && (
                                <button
                                  onClick={() => toggleExpand(q.questionId)}
                                  className="w-full mt-1 flex items-center justify-center gap-1 text-[10px] font-medium text-gray-400 hover:text-gray-600 transition-colors py-1"
                                >
                                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </AnimatePresence>
            </LayoutGroup>
          </motion.div>

          {/* Right Column: Timeline & Info */}
          <motion.div
            variants={itemVariants}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Activity Pulse</h3>
                <div className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Live
                </div>
              </div>

              <div className="h-[200px] w-full -ml-2">
                {timeline.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeline}>
                      <defs>
                        <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff8000" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ff8000" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="minute"
                        tick={{ fontSize: 10, fill: '#9CA3AF' }}
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#ff8000"
                        strokeWidth={3}
                        fill="url(#colorOrange)"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Activity className="w-8 h-8 mb-2 opacity-20" />
                    <span className="text-xs">No activity yet</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10" />

              <h3 className="text-lg font-bold mb-4 relative z-10">Pro Tips</h3>
              <ul className="space-y-3 text-sm text-gray-300 relative z-10">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                  <p>Keep questions concise for better engagement.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                  <p>Wait for 80% participation before revealing answers.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                  <p>Use open-ended questions to spark discussion.</p>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {showCreateModal && <CreateQuestionModal sessionId={id!} onClose={() => setShowCreateModal(false)} />}
    </motion.div>
  );
}
