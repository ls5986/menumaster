import type { AnswerValidation } from '../types/study.types';

// Levenshtein distance calculation
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Calculate similarity percentage between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

// Normalize string for comparison
function normalize(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // remove punctuation
    .replace(/\s+/g, ' '); // normalize spaces
}

// Extract key words (longer than 3 characters)
function extractKeyWords(str: string): string[] {
  return str.split(' ').filter(word => word.length > 3);
}

export function validateAnswer(
  userAnswer: string,
  correctAnswer: string,
  alternatives: string[] = []
): AnswerValidation {
  if (!userAnswer.trim()) {
    return { isCorrect: false, feedback: 'Please enter an answer' };
  }

  const normalized = normalize(userAnswer);
  const correct = normalize(correctAnswer);
  const alts = alternatives.map(normalize);

  // Exact match
  if (normalized === correct || alts.includes(normalized)) {
    return {
      isCorrect: true,
      match: 'exact',
      feedback: 'Perfect! Exact match! 🎯'
    };
  }

  // For ingredient lists (contains commas), check if they got the main ingredients
  if (correctAnswer.includes(',')) {
    const correctIngredients = correctAnswer.split(',').map(i => normalize(i.trim()));
    const userIngredients = userAnswer.split(',').map(i => normalize(i.trim()));
    
    // Count how many correct ingredients they got
    let matches = 0;
    for (const userIng of userIngredients) {
      for (const correctIng of correctIngredients) {
        if (userIng === correctIng || correctIng.includes(userIng) || userIng.includes(correctIng)) {
          matches++;
          break;
        }
      }
    }
    
    // Accept if they got at least 60% of ingredients OR at least 3 key ones
    const percentCorrect = matches / correctIngredients.length;
    if (percentCorrect >= 0.6 || matches >= 3) {
      return {
        isCorrect: true,
        match: 'partial',
        feedback: `Good! You got ${matches} of ${correctIngredients.length} key ingredients! ✨`
      };
    }
  }

  // Close match (80%+ similarity)
  const similarity = calculateSimilarity(normalized, correct);
  if (similarity >= 0.8) {
    return {
      isCorrect: true,
      match: 'close',
      similarity,
      feedback: 'Close enough! Great job! ✨'
    };
  }

  // Check if all key words are present
  const keyWords = extractKeyWords(correct);
  const hasAllKeyWords = keyWords.every(kw => normalized.includes(kw));
  
  if (hasAllKeyWords && keyWords.length >= 2) {
    return {
      isCorrect: true,
      match: 'partial',
      feedback: 'Good! You got all the key parts! 👍'
    };
  }

  // Check alternative answers with fuzzy matching
  for (const alt of alts) {
    const altSimilarity = calculateSimilarity(normalized, alt);
    if (altSimilarity >= 0.8) {
      return {
        isCorrect: true,
        match: 'close',
        similarity: altSimilarity,
        feedback: 'Alternative answer accepted! ✅'
      };
    }
  }

  // Wrong answer
  return {
    isCorrect: false,
    feedback: `Not quite. The correct answer is: ${correctAnswer}`
  };
}

// Fuzzy search for finding similar items
export function fuzzySearch(query: string, items: string[]): string[] {
  const normalized = normalize(query);
  
  return items
    .map(item => ({
      item,
      similarity: calculateSimilarity(normalized, normalize(item))
    }))
    .filter(result => result.similarity >= 0.5)
    .sort((a, b) => b.similarity - a.similarity)
    .map(result => result.item);
}

