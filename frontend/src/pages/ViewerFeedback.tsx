import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/apiClient";
import { submitFeedback } from "../api/feedback";
import ViewerQuestion from "../components/ViewerQuestion";

export default function ViewerFeedback() {
    const { code } = useParams();
    const [session, setSession] = useState<any>(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!code) return;
        api.get(`/api/sessions/code/${code}`).then(r => setSession(r.data.session)).catch(() => setSession(null));
    }, [code]);

    const send = async (type = "text", emoji?: string) => {
        if (!code) return;
        setLoading(true);
        try {
            await submitFeedback(code, { type, emoji: emoji || null, message: type === "text" ? message : undefined });
            if (type === "text") setMessage("");
        } catch (e: any) {
            alert(e?.response?.data?.error || "Failed");
        } finally {
            setLoading(false);
        }
    };

    if (!session) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 pb-24 lg:pb-0">
            <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8">

                {/* Compact Header */}
                <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-0 z-20">
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Live Session</span>
                        </div>
                        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate max-w-[200px] sm:max-w-md">
                            {session.title || "Untitled Session"}
                        </h1>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">Join Code</p>
                        <p className="text-base sm:text-lg font-mono font-bold text-primary">{session.code}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* Left Column: Questions (Main Focus) */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <ViewerQuestion code={code!} />
                    </div>

                    {/* Right Column: Feedback (Desktop Sticky / Mobile Fixed Bottom) */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-24">

                        {/* Quick Reactions - Hidden on mobile to save space, or maybe show a simplified version? 
                            Let's keep it visible but maybe scrollable on mobile if needed, 
                            or just part of the flow. For now, keeping it in flow but styling for mobile.
                        */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hidden lg:block">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                                <span className="mr-2">⚡</span> Quick React
                            </h3>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { emoji: "👍", label: "Good" },
                                    { emoji: "👎", label: "Bad" },
                                    { emoji: "💡", label: "Idea" },
                                    { emoji: "🤔", label: "Hmm" },
                                    { emoji: "🔥", label: "Fire" },
                                    { emoji: "❤️", label: "Love" },
                                    { emoji: "👏", label: "Clap" },
                                    { emoji: "😂", label: "Haha" }
                                ].map((item) => (
                                    <button
                                        key={item.emoji}
                                        onClick={() => send("emoji", item.emoji)}
                                        disabled={loading}
                                        className="group flex flex-col items-center justify-center p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 active:scale-95 border border-transparent hover:border-gray-100"
                                    >
                                        <span className="text-2xl mb-1 filter grayscale group-hover:grayscale-0 transition-all duration-200 transform">{item.emoji}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* General Feedback - Fixed Bottom on Mobile */}
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-30 lg:static lg:bg-transparent lg:border-0 lg:p-0">
                            <div className="max-w-6xl mx-auto lg:bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100 lg:p-4">
                                <h3 className="text-sm font-bold text-gray-900 mb-3 hidden lg:flex items-center">
                                    <span className="mr-2">💬</span> Message
                                </h3>

                                {/* Mobile Quick React Bar (Horizontal Scroll) */}
                                <div className="flex lg:hidden overflow-x-auto gap-2 mb-3 pb-2 no-scrollbar">
                                    {[
                                        { emoji: "👍" }, { emoji: "👎" }, { emoji: "🔥" }, { emoji: "❤️" }, { emoji: "👏" }, { emoji: "😂" }, { emoji: "💡" }, { emoji: "🤔" }
                                    ].map((item) => (
                                        <button
                                            key={item.emoji}
                                            onClick={() => send("emoji", item.emoji)}
                                            disabled={loading}
                                            className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full border border-gray-100 active:scale-95 transition-transform"
                                        >
                                            <span className="text-xl">{item.emoji}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="relative flex items-center gap-2">
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type feedback..."
                                        className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 resize-none transition-all duration-200 text-sm text-gray-800 placeholder-gray-400 min-h-[48px] max-h-[120px]"
                                        rows={1}
                                        style={{ minHeight: '48px' }}
                                    />
                                    <button
                                        className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 flex-shrink-0"
                                        onClick={() => send("text")}
                                        disabled={loading || !message.trim()}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                            <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
