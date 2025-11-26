"""
Engagement Rate Utilities for Multi-Question Form Apps

This module provides functions to compute various engagement metrics for form submissions.
All functions handle large datasets efficiently with O(n*m) time complexity.
"""

from typing import Any, Dict, List, Optional, Set, Union, Tuple
import math

Submission = Dict[Union[str, int], Any]
QuestionId = Union[str, int]

def is_answered(value: Any) -> bool:
    """
    Determines if a response value is considered "answered"
    """
    return (value is not None and
            value is not None and  # Note: 'is not None' is correct, but to match TS
            (not isinstance(value, str) or value.strip() != ''))

def compute_overall_engagement(
    n: int,
    submissions: List[Submission],
    question_ids: Optional[List[QuestionId]] = None
) -> float:
    """
    Computes the overall engagement rate across all questions and submissions

    Formula: (total answered responses) / (n * m) * 100
    where m = len(submissions)
    """
    if n <= 0:
        return 0.0
    m = len(submissions)
    if m == 0:
        return 0.0

    # Determine question IDs
    questions = question_ids if question_ids is not None else _get_unique_question_ids(submissions)
    if len(questions) != n:
        raise ValueError(f"Expected {n} questions, but found {len(questions)}")

    total_answered = 0

    for submission in submissions:
        for question_id in questions:
            if is_answered(submission.get(question_id)):
                total_answered += 1

    return (total_answered / (n * m)) * 100

def compute_per_question_engagement(
    n: int,
    submissions: List[Submission],
    question_ids: Optional[List[QuestionId]] = None
) -> Dict[QuestionId, Dict[str, Union[int, float]]]:
    """
    Computes engagement rate per question

    Returns: dict of question_id -> {'answered_count': int, 'engagement_percent': float}
    """
    if n <= 0:
        return {}
    m = len(submissions)
    if m == 0:
        return {}

    # Determine question IDs
    questions = question_ids if question_ids is not None else _get_unique_question_ids(submissions)
    if len(questions) != n:
        raise ValueError(f"Expected {n} questions, but found {len(questions)}")

    result = {}

    for question_id in questions:
        answered_count = 0
        for submission in submissions:
            if is_answered(submission.get(question_id)):
                answered_count += 1
        engagement_percent = (answered_count / m) * 100
        result[question_id] = {
            'answered_count': answered_count,
            'engagement_percent': engagement_percent
        }

    return result

def compute_per_user_engagement(
    n: int,
    submissions: List[Submission],
    question_ids: Optional[List[QuestionId]] = None
) -> List[Dict[str, Union[int, float]]]:
    """
    Computes engagement rate per user/submission

    Returns: list of {'user_index': int, 'answered_count': int, 'engagement_percent': float}
    """
    if n <= 0:
        return []
    m = len(submissions)
    if m == 0:
        return []

    # Determine question IDs
    questions = question_ids if question_ids is not None else _get_unique_question_ids(submissions)
    if len(questions) != n:
        raise ValueError(f"Expected {n} questions, but found {len(questions)}")

    result = []

    for i, submission in enumerate(submissions):
        answered_count = 0
        for question_id in questions:
            if is_answered(submission.get(question_id)):
                answered_count += 1
        engagement_percent = (answered_count / n) * 100
        result.append({
            'user_index': i,
            'answered_count': answered_count,
            'engagement_percent': engagement_percent
        })

    return result

def compute_completion_rate(
    submissions: List[Submission],
    question_ids: Optional[List[QuestionId]] = None
) -> float:
    """
    Computes the completion rate (percentage of submissions that answered all questions)

    Formula: (completed submissions) / m * 100
    """
    m = len(submissions)
    if m == 0:
        return 0.0

    # Determine question IDs
    questions = question_ids if question_ids is not None else _get_unique_question_ids(submissions)
    n = len(questions)
    if n == 0:
        return 0.0

    completed_count = 0

    for submission in submissions:
        answered_count = 0
        for question_id in questions:
            if is_answered(submission.get(question_id)):
                answered_count += 1
        if answered_count == n:
            completed_count += 1

    return (completed_count / m) * 100

def _get_unique_question_ids(submissions: List[Submission]) -> List[QuestionId]:
    """Extracts unique question IDs from submissions"""
    question_set = set()
    for submission in submissions:
        question_set.update(submission.keys())
    return list(question_set)

# Unit tests
def run_tests():
    """Run unit tests for all functions"""
    print('Running engagement utilities tests...')

    # Test data
    submissions1 = [
        {'q1': 'Yes', 'q2': None, 'q3': 'Some text'},
        {'q1': 'No', 'q2': 'Answer', 'q3': None},
        {'q1': None, 'q2': None, 'q3': 'Text'}
    ]

    question_ids1 = ['q1', 'q2', 'q3']

    # Test compute_overall_engagement
    overall = compute_overall_engagement(3, submissions1, question_ids1)
    expected_overall = (5/9) * 100
    assert abs(overall - expected_overall) < 0.01, f"Overall engagement: expected {expected_overall}, got {overall}"

    # Test compute_per_question_engagement
    per_question = compute_per_question_engagement(3, submissions1, question_ids1)
    assert per_question['q1']['answered_count'] == 2, 'q1 answered count'
    assert per_question['q2']['answered_count'] == 1, 'q2 answered count'
    assert per_question['q3']['answered_count'] == 2, 'q3 answered count'

    # Test compute_per_user_engagement
    per_user = compute_per_user_engagement(3, submissions1, question_ids1)
    assert per_user[0]['answered_count'] == 2, 'User 0 answered count'
    assert per_user[1]['answered_count'] == 2, 'User 1 answered count'
    assert per_user[2]['answered_count'] == 1, 'User 2 answered count'

    # Test compute_completion_rate
    completion = compute_completion_rate(submissions1, question_ids1)
    assert abs(completion - 0.0) < 0.01, f"Completion rate: expected 0, got {completion}"

    # Edge cases
    assert compute_overall_engagement(0, [], []) == 0, 'Zero questions'
    assert compute_overall_engagement(1, [], ['q1']) == 0, 'Zero submissions'
    assert compute_completion_rate([], []) == 0, 'Empty submissions'

    # Test with derived question_ids
    submissions2 = [{'q1': 'a', 'q2': None}, {'q1': None, 'q2': 'b'}]
    overall2 = compute_overall_engagement(2, submissions2)
    assert abs(overall2 - 50.0) < 0.01, f"Derived question_ids: expected 50, got {overall2}"

    # Test is_answered
    assert is_answered('text') == True, 'String answered'
    assert is_answered('') == False, 'Empty string not answered'
    assert is_answered('   ') == False, 'Whitespace not answered'
    assert is_answered(0) == True, 'Zero answered'
    assert is_answered(False) == True, 'False answered'
    assert is_answered(None) == False, 'None not answered'

    print('All tests passed!')

# Example usage
def examples():
    submissions = [
        {'q1': 'Yes', 'q2': None, 'q3': 'Some text'},
        {'q1': 'No', 'q2': 'Answer', 'q3': None},
        {'q1': None, 'q2': None, 'q3': 'Text'}
    ]

    n = 3
    question_ids = ['q1', 'q2', 'q3']

    print('Overall Engagement:', compute_overall_engagement(n, submissions, question_ids))
    print('Per Question:', compute_per_question_engagement(n, submissions, question_ids))
    print('Per User:', compute_per_user_engagement(n, submissions, question_ids))
    print('Completion Rate:', compute_completion_rate(submissions, question_ids))

if __name__ == '__main__':
    examples()
    run_tests()