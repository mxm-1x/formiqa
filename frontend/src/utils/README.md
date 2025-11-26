# Engagement Rate Utilities

This module provides utilities for computing engagement metrics in multi-question form applications.

## Functions

### `computeOverallEngagement(n, submissions, questionIds?)`
Returns the overall engagement rate (0-100%) defined as:
```
(total answered responses across all questions and all submissions) / (n * m) * 100
```
Where:
- `n` = number of questions
- `m` = number of submissions

### `computePerQuestionEngagement(n, submissions, questionIds?)`
Returns a map/dict of question ID to:
- `answeredCount`: number of submissions that answered that question
- `engagementPercent`: `answeredCount / m * 100`

### `computePerUserEngagement(n, submissions, questionIds?)`
Returns an array/list of objects with:
- `userIndex`: index of the submission (0-based)
- `answeredCount`: number of questions answered by this user
- `engagementPercent`: `answeredCount / n * 100`

### `computeCompletionRate(submissions, questionIds?)`
Returns the percentage of submissions that answered ALL questions:
```
(completed submissions) / m * 100
```

## Input Validation

- `n` must be a positive integer
- `submissions` is an array of objects where keys are question IDs and values are responses
- `questionIds` is optional; if not provided, unique question IDs are derived from submissions
- A response is considered "answered" if it's not null, not undefined, and not an empty/whitespace string

## Usage Examples

### TypeScript/JavaScript
```typescript
import {
  computeOverallEngagement,
  computePerQuestionEngagement,
  computePerUserEngagement,
  computeCompletionRate
} from './engagementUtils';

const submissions = [
  { q1: 'Yes', q2: null, q3: 'Some text' },
  { q1: 'No', q2: 'Answer', q3: null }
];

const n = 3;
const questionIds = ['q1', 'q2', 'q3'];

console.log(computeOverallEngagement(n, submissions, questionIds));
// Output: 66.666...

console.log(computePerQuestionEngagement(n, submissions, questionIds));
// Output: Map { 'q1' => { answeredCount: 2, engagementPercent: 100 }, ... }

console.log(computeCompletionRate(submissions, questionIds));
// Output: 0 (no submission answered all 3 questions)
```

### Python
```python
from engagement_utils import (
    compute_overall_engagement,
    compute_per_question_engagement,
    compute_per_user_engagement,
    compute_completion_rate
)

submissions = [
    {'q1': 'Yes', 'q2': None, 'q3': 'Some text'},
    {'q1': 'No', 'q2': 'Answer', 'q3': None}
]

n = 3
question_ids = ['q1', 'q2', 'q3']

print(compute_overall_engagement(n, submissions, question_ids))
# Output: 66.666...

print(compute_completion_rate(submissions, question_ids))
# Output: 0.0
```

## Performance

All functions operate in O(n*m) time and O(n) space, suitable for large datasets (m up to 100k).

## Testing

Run unit tests:
- TypeScript: Call `runTests()` function
- Python: Run `python engagement_utils.py` or call `run_tests()`