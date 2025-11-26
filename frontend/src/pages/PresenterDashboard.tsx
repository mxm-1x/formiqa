import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/apiClient";
import { Link } from "react-router-dom";
import { computeOverallEngagement, computeCompletionRate } from "../utils/engagementUtils";
import { deleteSession } from "../api/session";

export default function PresenterDashboard() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalResponses: 0,
    avgEngagement: 0,
    completionRate: 0
  });
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/sessions", { headers: { Authorization: `Bearer ${token}` } });
        const sessionList = res.data.sessions || [];
        setSessions(sessionList);
        console.log("[Dashboard] Fetched sessions:", sessionList.length);

        // Fetch questions and responses for all sessions to calculate engagement stats
        const sessionDataPromises = sessionList.map(async (s: any) => {
          try {
            // Fetch questions for this session
            const questionsRes = await api.get(`/api/sessions/${s.id}/questions`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const questions = questionsRes.data.questions || [];

            // Fetch responses for each question
            const responsesPromises = questions.map(async (q: any) => {
              try {
                const responsesRes = await api.get(`/api/questions/${q.id}/responses`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                return { questionId: q.id, responses: responsesRes.data.responses || [] };
              } catch (err) {
                console.error(`[Dashboard] Error fetching responses for question ${q.id}:`, err);
                return { questionId: q.id, responses: [] };
              }
            });

            const responsesData = await Promise.all(responsesPromises);

            return {
              sessionId: s.id,
              questions,
              responsesData
            };
          } catch (err) {
            console.error(`[Dashboard] Error fetching data for session ${s.id}:`, err);
            return { sessionId: s.id, questions: [], responsesData: [] };
          }
        });

        const sessionData = await Promise.all(sessionDataPromises);
        console.log("[Dashboard] Session data:", sessionData);

        // Calculate total responses across all questions
        const totalResponses = sessionData.reduce((sum, session) => {
          return sum + session.responsesData.reduce((qSum, qData) => qSum + qData.responses.length, 0);
        }, 0);

        // Calculate engagement and completion rates
        const allQuestions = sessionData.flatMap(s => s.questions);
        const totalQuestions = allQuestions.length;

        if (totalQuestions > 0 && totalResponses > 0) {
          // Group responses by user (approximate using response timestamps and patterns)
          // For simplicity, we'll calculate engagement as: (total responses) / (total questions * unique response sessions)

          // Get all responses
          const allResponses = sessionData.flatMap(s =>
            s.responsesData.flatMap(rd => rd.responses)
          );

          // Estimate unique participants (this is approximate without user IDs)
          const uniqueParticipants = new Set(allResponses.map(r => r.id)).size;

          // Calculate engagement: what percentage of possible question-participant combinations were answered
          const possibleResponses = totalQuestions * Math.max(uniqueParticipants, 1);
          const avgEngagement = possibleResponses > 0
            ? Math.round((totalResponses / possibleResponses) * 100 * 100) / 100
            : 0;

          // For completion rate, we need to group by question sets
          // Since we don't have explicit user tracking, we'll use a simplified metric
          const completionRate = avgEngagement; // Simplified for now

          setStats({
            totalSessions: sessionList.length,
            totalResponses,
            avgEngagement,
            completionRate
          });
        } else {
          setStats({
            totalSessions: sessionList.length,
            totalResponses,
            avgEngagement: 0,
            completionRate: 0
          });
        }

      } catch (e) {
        console.error("[Dashboard] Error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session? This action cannot be undone and will remove all associated feedback.")) {
      return;
    }

    setDeletingSessionId(sessionId);
    try {
      await deleteSession(sessionId, token);
      // Remove the session from the local state
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      // Update stats after deletion
      setStats(prev => ({
        ...prev,
        totalSessions: prev.totalSessions - 1
      }));
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Failed to delete session. Please try again.");
    } finally {
      setDeletingSessionId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8">



      {/* Sessions Grid */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-6">Your Sessions</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Create New Session Card */}
          <Link
            to="/presenter/create"
            className="group relative flex flex-col items-center justify-center min-h-[400px] rounded-[2.5rem] border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-white hover:border-primary hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-110 group-hover:border-primary/20 transition-all duration-300 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Create New Session</h3>
            <p className="text-sm text-gray-500 text-center max-w-[200px]">Start a new interactive presentation</p>
          </Link>

          {/* 2. Session Cards */}
          {sessions.map(s => (
            <div key={s.id} className="group relative flex flex-col bg-white rounded-[2.5rem] border-2 border-gray-100 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden min-h-[400px]">
              {/* Image Area */}
              <div className="h-48 w-full bg-gradient-to-br from-orange-50 to-white relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500"></div>

                {/* Badge */}
                <div className="absolute top-6 left-6">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-white/90 backdrop-blur-sm shadow-sm border border-gray-100 text-gray-800">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Active Session
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-8 flex flex-col">
                <div className="mb-auto">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
                    {s.title || "Untitled Session"}
                  </h3>
                  <p className="text-gray-500 text-sm font-medium mb-4">
                    Code: <span className="font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{s.code}</span>
                  </p>
                  <p className="text-gray-400 text-xs">
                    Created {new Date(s.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Action Button */}
                <div className="mt-8 pt-6 border-t border-gray-50 flex gap-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteSession(s.id);
                    }}
                    disabled={deletingSessionId === s.id}
                    className="p-3 rounded-xl border-2 border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all"
                    title="Delete Session"
                  >
                    {deletingSessionId === s.id ? (
                      <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    )}
                  </button>
                  <Link
                    to={`/presenter/session/${s.id}`}
                    className="flex-1 bg-primary text-white rounded-xl font-bold flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Open Dashboard
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
