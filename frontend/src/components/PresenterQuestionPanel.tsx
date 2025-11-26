import React, { useEffect, useState, useRef } from "react";
import { listQuestions, listResponses, endQuestion, activateQuestion } from "../api/question";
import { useAuth } from "../context/AuthContext";
import CreateQuestionModal from "./CreateQuestionModal";
import { useSocket } from "../context/SocketContext";

export default function PresenterQuestionPanel({ sessionId }: { sessionId: string }) {
  const { token } = useAuth();
  const { socket } = useSocket();
  const [questions, setQuestions] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);
  const selectedRef = useRef<any>(null);

  // Keep ref in sync with state
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    (async () => {
      try {
        const res = await listQuestions(sessionId, token || undefined);
        setQuestions(res.data.questions || []);
      } catch (e) { console.error(e) }
    })();
  }, [sessionId, token]);

  useEffect(() => {
    if (!socket) return;
    const onNewResponse = (data: any) => {
      // if data.questionId === selected.id then add to feed
      if (selectedRef.current && data.questionId === selectedRef.current.id) {
        setResponses(prev => [data, ...prev]);
      }
    };
    const onNewQuestion = (q: any) => {
      // Only add genuinely new questions, don't add if already exists
      setQuestions(prev => {
        const exists = prev.some(existing => existing.id === q.id);
        if (exists) return prev; // Already have it, skip
        return [q, ...prev]; // New question, add it
      });
    };
    const onQuestionActivated = (q: any) => {
      // Update question to show it's now active
      setQuestions(prev => prev.map(existing => existing.id === q.id ? { ...existing, isActive: true } : existing));
    };
    const onQuestionEnded = ({ questionId }: { questionId: string }) => {
      setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, isActive: false } : q));
      if (selectedRef.current?.id === questionId) setSelected(null);
    };

    socket.on("new-response", onNewResponse);
    socket.on("new-question", onNewQuestion);
    socket.on("question-activated", onQuestionActivated);
    socket.on("question-ended", onQuestionEnded);

    return () => {
      socket.off("new-response", onNewResponse);
      socket.off("new-question", onNewQuestion);
      socket.off("question-activated", onQuestionActivated);
      socket.off("question-ended", onQuestionEnded);
    };
  }, [socket]);

  const openQuestion = async (q: any) => {
    try {
      // First activate the question for viewers
      await activateQuestion(q.id, token || undefined);
      // Update local state
      setQuestions(prev => prev.map(p => p.id === q.id ? { ...p, isActive: true } : p));
      setSelected(q);
      // Load existing responses
      const res = await listResponses(q.id, token || undefined);
      setResponses(res.data.responses || []);
    } catch (e) { console.error(e) }
  };

  const closeQuestion = async (q: any) => {
    try {
      await endQuestion(q.id, token || undefined);
      setQuestions(prev => prev.map(p => p.id === q.id ? { ...p, isActive: false } : p));
      setSelected(null);
    } catch (e) { console.error(e) }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-primary/20">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="w-3 h-3 bg-primary rounded-full mr-3 animate-pulse"></span>
            Questions
          </h2>
          <button
            className="bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-2 rounded-lg font-semibold hover:from-primary/90 hover:to-primary transform transition-all duration-200 shadow-md hover:shadow-lg"
            onClick={() => setShowCreate(true)}
          >
            <span className="mr-2">➕</span>
            Create Question
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {questions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Questions Yet</h3>
              <p className="text-gray-500">Create your first question to engage your audience!</p>
            </div>
          ) : (
            questions.map(q => (
              <div key={q.id} className="group bg-gray-50 hover:bg-white rounded-xl p-4 border border-gray-200 hover:border-primary/30 transition-all duration-200 hover:shadow-md">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${q.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${q.isActive ? 'bg-green-500' : 'bg-gray-400'
                          }`}></span>
                        {q.isActive ? "Active" : "Closed"}
                      </span>
                      <span className="ml-2 text-xs text-gray-500 uppercase tracking-wide">
                        {q.type}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{q.title}</h3>
                    <div className="text-sm text-gray-600">
                      {q.type === "mcq" && q.options && (
                        <span>{q.options.length} options</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transform transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                      onClick={() => openQuestion(q)}
                      disabled={q.isActive}
                    >
                      {q.isActive ? "Active" : "Open"}
                    </button>
                    {q.isActive && (
                      <button
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transform transition-all duration-200 shadow-sm hover:shadow-md"
                        onClick={() => closeQuestion(q)}
                      >
                        End
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {selected && (
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">📊</span>
              Live Responses: {selected.title}
            </h3>

            {selected.type === "mcq" ? (
              // MCQ: Show percentage breakdown
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Total Responses: <span className="font-bold text-gray-900">{responses.length}</span>
                </div>
                {selected.options && selected.options.length > 0 ? (
                  <div className="space-y-3">
                    {selected.options.map((option: string, index: number) => {
                      const optionCount = responses.filter((r: any) => r.selectedOpt === option).length;
                      const percentage = responses.length > 0 ? Math.round((optionCount / responses.length) * 100) : 0;

                      return (
                        <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-medium text-gray-900">{option}</div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-600">{optionCount} votes</span>
                              <span className="text-lg font-bold text-primary">{percentage}%</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No options configured for this question.
                  </div>
                )}
              </div>
            ) : (
              // Text: Show individual responses
              <div className="space-y-3 max-h-64 overflow-auto">
                {responses.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No responses yet. Responses will appear here in real-time!
                  </div>
                ) : (
                  responses.map(r => (
                    <div key={r.id} className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-xs text-gray-500">
                          {new Date(r.createdAt).toLocaleTimeString()}
                        </div>
                        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Text
                        </div>
                      </div>
                      <div className="font-medium text-gray-900">
                        {r.textAnswer}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showCreate && <CreateQuestionModal sessionId={sessionId} onClose={() => setShowCreate(false)} onCreated={() => { }} />}
    </div>
  );
}
