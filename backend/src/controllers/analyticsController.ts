import { Request, Response } from "express";
import prisma from "../db/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

export const getSessionAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        const { id: sessionId } = req.params;
        if (!sessionId) return res.status(400).json({ error: "Session ID required" });
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });

        // Verify session ownership
        const session = await prisma.session.findUnique({ where: { id: sessionId } });
        if (!session) return res.status(404).json({ error: "Session not found" });
        if (session.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });

        // Fetch all questions for the session
        const questions = await prisma.question.findMany({
            where: { sessionId },
            orderBy: { createdAt: "desc" },
        });

        // Fetch all activity logs for timeline
        const activityLogs = await prisma.activityLog.findMany({
            where: { sessionId },
            orderBy: { createdAt: "asc" },
        });

        // Build activity timeline grouped by minute
        const minuteCounts: Record<string, number> = {};
        activityLogs.forEach(log => {
            // Use local time instead of UTC for better user experience
            const localTime = new Date(log.createdAt);
            const hours = localTime.getHours().toString().padStart(2, '0');
            const minutes = localTime.getMinutes().toString().padStart(2, '0');
            const minute = `${hours}:${minutes}`;
            minuteCounts[minute] = (minuteCounts[minute] || 0) + 1;
        });
        const timeline = Object.entries(minuteCounts).map(([minute, count]) => ({ minute, count }));

        // Calculate analytics for each question
        const questionAnalytics = await Promise.all(
            questions.map(async (q) => {
                const responses = await prisma.response.findMany({
                    where: { questionId: q.id },
                });

                let optionBreakdown: any = null;
                if (q.type === "mcq" && q.options.length > 0) {
                    // Calculate counts and percentages for each option
                    const totalResponses = responses.length;
                    optionBreakdown = q.options.map((option, index) => {
                        const count = responses.filter(
                            r => r.selectedOpt === index.toString() || r.selectedOpt === option
                        ).length;
                        const percentage = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
                        return {
                            option,
                            index,
                            count,
                            percentage,
                        };
                    });
                }

                return {
                    questionId: q.id,
                    type: q.type,
                    title: q.title,
                    options: q.options,
                    isActive: q.isActive,
                    totalResponses: responses.length,
                    optionBreakdown, // null for text questions
                    recentResponses: q.type === "text" ? responses.slice(0, 20) : [],
                };
            })
        );

        // Calculate total stats
        const totalResponses = questionAnalytics.reduce((sum, q) => sum + q.totalResponses, 0);
        const totalFeedbacks = await prisma.feedback.count({ where: { sessionId } });

        return res.json({
            stats: {
                totalQuestions: questions.length,
                totalResponses,
                totalFeedbacks,
                totalActivity: totalResponses + totalFeedbacks,
            },
            timeline,
            questions: questionAnalytics,
        });
    } catch (err: any) {
        console.error("getSessionAnalytics error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
