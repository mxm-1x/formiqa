/**
 * Engagement Rate Utilities for Multi-Question Form Apps
 *
 * This module provides functions to compute various engagement metrics for form submissions.
 * All functions handle large datasets efficiently with O(n*m) time complexity.
 */

export type Submission = Record<string | number, any>;
export type QuestionId = string | number;

/**
 * Determines if a response value is considered "answered"
 * @param value - The response value to check
 * @returns true if the value is considered answered
 */
export function isAnswered(value: any): boolean {
  return value !== null &&
         value !== undefined &&
         (typeof value !== 'string' || value.trim() !== '');
}

/**
 * Computes the overall engagement rate across all questions and submissions
 * @param n - Number of questions in the form
 * @param submissions - Array of submission objects
 * @param questionIds - Optional array of all question IDs (length should be n)
 * @returns Overall engagement rate as percentage (0-100)
 */
export function computeOverallEngagement(
  n: number,
  submissions: Submission[],
  questionIds?: QuestionId[]
): number {
  if (n <= 0) return 0;
  const m = submissions.length;
  if (m === 0) return 0;

  // Determine question IDs
  const questions = questionIds || getUniqueQuestionIds(submissions);
  if (questions.length !== n) {
    throw new Error(`Expected ${n} questions, but found ${questions.length}`);
  }

  let totalAnswered = 0;

  for (const submission of submissions) {
    for (const questionId of questions) {
      if (isAnswered(submission[questionId])) {
        totalAnswered++;
      }
    }
  }

  return (totalAnswered / (n * m)) * 100;
}

/**
 * Computes engagement rate per question
 * @param n - Number of questions in the form
 * @param submissions - Array of submission objects
 * @param questionIds - Optional array of all question IDs (length should be n)
 * @returns Map of question ID to {answeredCount, engagementPercent}
 */
export function computePerQuestionEngagement(
  n: number,
  submissions: Submission[],
  questionIds?: QuestionId[]
): Map<QuestionId, { answeredCount: number; engagementPercent: number }> {
  if (n <= 0) return new Map();
  const m = submissions.length;
  if (m === 0) return new Map();

  // Determine question IDs
  const questions = questionIds || getUniqueQuestionIds(submissions);
  if (questions.length !== n) {
    throw new Error(`Expected ${n} questions, but found ${questions.length}`);
  }

  const result = new Map<QuestionId, { answeredCount: number; engagementPercent: number }>();

  for (const questionId of questions) {
    let answeredCount = 0;
    for (const submission of submissions) {
      if (isAnswered(submission[questionId])) {
        answeredCount++;
      }
    }
    const engagementPercent = (answeredCount / m) * 100;
    result.set(questionId, { answeredCount, engagementPercent });
  }

  return result;
}

/**
 * Computes engagement rate per user/submission
 * @param n - Number of questions in the form
 * @param submissions - Array of submission objects
 * @param questionIds - Optional array of all question IDs (length should be n)
 * @returns Array of {userIndex, answeredCount, engagementPercent}
 */
export function computePerUserEngagement(
  n: number,
  submissions: Submission[],
  questionIds?: QuestionId[]
): Array<{ userIndex: number; answeredCount: number; engagementPercent: number }> {
  if (n <= 0) return [];
  const m = submissions.length;
  if (m === 0) return [];

  // Determine question IDs
  const questions = questionIds || getUniqueQuestionIds(submissions);
  if (questions.length !== n) {
    throw new Error(`Expected ${n} questions, but found ${questions.length}`);
  }

  const result: Array<{ userIndex: number; answeredCount: number; engagementPercent: number }> = [];

  for (let i = 0; i < m; i++) {
    const submission = submissions[i];
    let answeredCount = 0;
    for (const questionId of questions) {
      if (isAnswered(submission[questionId])) {
        answeredCount++;
      }
    }
    const engagementPercent = (answeredCount / n) * 100;
    result.push({ userIndex: i, answeredCount, engagementPercent });
  }

  return result;
}

/**
 * Computes the completion rate (percentage of submissions that answered all questions)
 * @param submissions - Array of submission objects
 * @param questionIds - Optional array of all question IDs
 * @returns Completion rate as percentage (0-100)
 */
export function computeCompletionRate(
  submissions: Submission[],
  questionIds?: QuestionId[]
): number {
  const m = submissions.length;
  if (m === 0) return 0;

  // Determine question IDs
  const questions = questionIds || getUniqueQuestionIds(submissions);
  const n = questions.length;
  if (n === 0) return 0;

  let completedCount = 0;

  for (const submission of submissions) {
    let answeredCount = 0;
    for (const questionId of questions) {
      if (isAnswered(submission[questionId])) {
        answeredCount++;
      }
    }
    if (answeredCount === n) {
      completedCount++;
    }
  }

  return (completedCount / m) * 100;
}

/**
 * Extracts unique question IDs from submissions
 * @param submissions - Array of submission objects
 * @returns Array of unique question IDs
 */
function getUniqueQuestionIds(submissions: Submission[]): QuestionId[] {
  const questionSet = new Set<QuestionId>();
  for (const submission of submissions) {
    for (const key in submission) {
      questionSet.add(key);
    }
  }
  return Array.from(questionSet);
}

// Unit tests
export function runTests(): void {
  console.log('Running engagement utilities tests...');

  // Test data
  const submissions1: Submission[] = [
    { q1: 'Yes', q2: null, q3: 'Some text' },
    { q1: 'No', q2: 'Answer', q3: null },
    { q1: null, q2: null, q3: 'Text' }
  ];

  const questionIds1 = ['q1', 'q2', 'q3'];

  // Test computeOverallEngagement
  const overall = computeOverallEngagement(3, submissions1, questionIds1);
  console.assert(Math.abs(overall - (5/9)*100) < 0.01, `Overall engagement: expected ${(5/9)*100}, got ${overall}`);

  // Test computePerQuestionEngagement
  const perQuestion = computePerQuestionEngagement(3, submissions1, questionIds1);
  console.assert(perQuestion.get('q1')!.answeredCount === 2, 'q1 answered count');
  console.assert(perQuestion.get('q2')!.answeredCount === 1, 'q2 answered count');
  console.assert(perQuestion.get('q3')!.answeredCount === 2, 'q3 answered count');

  // Test computePerUserEngagement
  const perUser = computePerUserEngagement(3, submissions1, questionIds1);
  console.assert(perUser[0].answeredCount === 2, 'User 0 answered count');
  console.assert(perUser[1].answeredCount === 2, 'User 1 answered count');
  console.assert(perUser[2].answeredCount === 1, 'User 2 answered count');

  // Test computeCompletionRate
  const completion = computeCompletionRate(submissions1, questionIds1);
  console.assert(Math.abs(completion - (0/3)*100) < 0.01, `Completion rate: expected 0, got ${completion}`);

  // Edge cases
  console.assert(computeOverallEngagement(0, [], []) === 0, 'Zero questions');
  console.assert(computeOverallEngagement(1, [], ['q1']) === 0, 'Zero submissions');
  console.assert(computeCompletionRate([], []) === 0, 'Empty submissions');

  // Test with derived questionIds
  const submissions2 = [{ q1: 'a', q2: null }, { q1: null, q2: 'b' }];
  const overall2 = computeOverallEngagement(2, submissions2);
  console.assert(Math.abs(overall2 - (2/4)*100) < 0.01, `Derived questionIds: expected 50, got ${overall2}`);

  // Test isAnswered
  console.assert(isAnswered('text') === true, 'String answered');
  console.assert(isAnswered('') === false, 'Empty string not answered');
  console.assert(isAnswered('   ') === false, 'Whitespace not answered');
  console.assert(isAnswered(0) === true, 'Zero answered');
  console.assert(isAnswered(false) === true, 'False answered');
  console.assert(isAnswered(null) === false, 'Null not answered');
  console.assert(isAnswered(undefined) === false, 'Undefined not answered');

  console.log('All tests passed!');
}

// Example usage
export function examples(): void {
  const submissions: Submission[] = [
    { q1: 'Yes', q2: null, q3: 'Some text' },
    { q1: 'No', q2: 'Answer', q3: null },
    { q1: null, q2: null, q3: 'Text' }
  ];

  const n = 3;
  const questionIds = ['q1', 'q2', 'q3'];

  console.log('Overall Engagement:', computeOverallEngagement(n, submissions, questionIds));
  console.log('Per Question:', computePerQuestionEngagement(n, submissions, questionIds));
  console.log('Per User:', computePerUserEngagement(n, submissions, questionIds));
  console.log('Completion Rate:', computeCompletionRate(submissions, questionIds));
}