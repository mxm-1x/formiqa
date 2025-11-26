-- CreateIndex
CREATE INDEX "Feedback_sessionId_idx" ON "Feedback"("sessionId");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "Question_sessionId_idx" ON "Question"("sessionId");

-- CreateIndex
CREATE INDEX "Response_questionId_idx" ON "Response"("questionId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
