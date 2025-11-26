import React, { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { submitResponse } from "../api/question";

export default function ViewerQuestion({ code }: { code: string }) {
    const { socket } = useSocket();
    const [questions, setQuestions] = useState<any[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!socket) return;
        socket.emit("join-session", { sessionCode: code });

        const onQuestionActivated = (q: any) => {
            setQuestions(prev => {
                const exists = prev.find(p => p.id === q.id);
                if (exists) return prev.map(p => p.id === q.id ? q : p);
                return [q, ...prev];
            });
        };

        const onQuestionEnded = (payload: any) => {
            setQuestions(prev => prev.filter(q => q.id !== payload.questionId));
        };

        const onSessionJoined = (payload: any) => {
            if (payload.activeQuestions) {
                setQuestions(payload.activeQuestions);
            }
        };

        socket.on("question-activated", onQuestionActivated);
        socket.on("question-ended", onQuestionEnded);
        socket.on("session-joined", onSessionJoined);

        return () => {
            socket.off("question-activated", onQuestionActivated);
            socket.off("question-ended", onQuestionEnded);
            socket.off("session-joined", onSessionJoined);
        };
    }, [socket, code]);

    const handleGlobalSubmit = async () => {
        if (questions.length === 0) return;
        setSubmitting(true);
        try {
            const promises = questions.map(q => {
                if (q.type === "mcq") {
                    const selected = selectedOptions[q.id];
                    if (selected) {
                        return submitResponse(q.id, { selectedOpt: selected });
                    }
                } else {
                    const text = textAnswers[q.id];
                    if (text && text.trim()) {
                        return submitResponse(q.id, { textAnswer: text });
                    }
                }
                return Promise.resolve();
            });

            await Promise.all(promises);
            setSubmitted(true);
        } catch (e: any) {
            alert(e?.response?.data?.error || "Failed to submit some responses");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="text-center py-12 animate-in fade-in zoom-in duration-300 flex flex-col items-center">
                <img src="/src/assets/illustration-success.png" alt="Success" className="w-48 h-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-sm text-gray-600 mb-6">Your responses have been recorded.</p>
                <button
                    onClick={() => setSubmitted(false)}
                    className="text-sm text-primary font-semibold hover:underline"
                >
                    Edit or Submit More
                </button>
            </div>
        );
    }

    if (questions.length === 0) return (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
            <img src="/src/assets/illustration-waiting.png" alt="Waiting" className="w-48 h-auto mb-6 opacity-80" />
            <h3 className="text-base font-bold text-gray-900 mb-1">Waiting for Questions</h3>
            <p className="text-xs text-gray-500">The presenter hasn't started any questions yet.</p>
        </div>
    );

    return (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-bold text-gray-900">Questions ({questions.length})</h2>
                <span className="text-xs font-medium text-primary bg-orange-50 px-2 py-1 rounded-full border border-orange-100">Live</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {questions.map(q => (
                    <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
                        <div className="p-4">
                            <div className="flex items-start space-x-3 mb-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${q.type === 'mcq' ? 'bg-orange-50 text-primary' : 'bg-orange-50 text-primary'}`}>
                                    <span className="text-sm">
                                        {q.type === "mcq" ? "📊" : "✍️"}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-gray-900 leading-tight mb-1 truncate">{q.title}</h3>
                                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                                        {q.type === "mcq" ? "Select Option" : "Type Answer"}
                                    </p>
                                </div>
                            </div>

                            {q.type === "mcq" ? (
                                <div className="grid grid-cols-2 gap-2">
                                    {q.options.map((opt: string, index: number) => (
                                        <button
                                            key={index}
                                            className={`group relative p-2 rounded-lg text-left transition-all duration-200 border
                                        ${selectedOptions[q.id] === index.toString()
                                                    ? "border-primary bg-orange-50 ring-1 ring-primary/20"
                                                    : "border-gray-100 bg-gray-50 hover:border-primary/30 hover:bg-white"
                                                }`}
                                            onClick={() => setSelectedOptions(prev => ({ ...prev, [q.id]: index.toString() }))}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs transition-colors
                                            ${selectedOptions[q.id] === index.toString()
                                                        ? "bg-primary text-white"
                                                        : "bg-white text-gray-400 border border-gray-200 group-hover:border-primary/50 group-hover:text-primary"
                                                    }`}>
                                                    {String.fromCharCode(65 + index)}
                                                </div>
                                                <span className={`text-xs font-medium truncate ${selectedOptions[q.id] === index.toString() ? "text-primary" : "text-gray-600"}`}>
                                                    {opt}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <textarea
                                    value={textAnswers[q.id] || ""}
                                    onChange={e => setTextAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                    placeholder="Type here..."
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 resize-none transition-all duration-200 text-sm text-gray-800 placeholder-gray-400"
                                    rows={2}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-4 left-0 right-0 px-4 z-20 flex justify-center pointer-events-none">
                <button
                    className="pointer-events-auto shadow-xl shadow-primary/20 bg-primary text-white py-3 px-12 rounded-full font-bold text-sm hover:bg-primary/90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                    onClick={handleGlobalSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Sending...</span>
                        </>
                    ) : (
                        <>
                            <span>Submit All Responses</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
