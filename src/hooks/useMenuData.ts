import { useMemo } from 'react';
import testableItemsData from '../data/testable_menu_items.json';
import type { QuestionItem } from '../types/menu.types';

export function useMenuData() {
  const questions = useMemo(() => {
    const allQuestions: QuestionItem[] = [];
    const items = (testableItemsData as any).menu_items || [];
    
    items.forEach((item: any) => {
      if (item.status === 'inactive') return; // Skip inactive items
      
      const lines = item.description_lines || [];
      lines.forEach((line: any, index: number) => {
        allQuestions.push({
          id: `${item.id}_${index}`,
          itemName: item.name,
          category: item.category,
          component: {
            underline_text: line.context || '',
            full_text: line.full_text || '',
            answer: '', // Not used in new format, individual_blanks are used instead
            alternatives: [],
            individual_blanks: line.individual_blanks || []
          },
          status: item.status
        });
      });
    });
    
    return allQuestions;
  }, []);

  // Group questions by item for flashcard mode
  const flashcardItems = useMemo(() => {
    const items = (testableItemsData as any).menu_items || [];
    return items
      .filter((item: any) => item.status !== 'inactive')
      .map((item: any) => ({
        id: item.id || item.name,
        name: item.name,
        category: item.category,
        status: item.status,
        lines: (item.description_lines || []).map((line: any) => ({
          full_text: line.full_text || '',
          context: line.context || '',
          individual_blanks: line.individual_blanks || []
        }))
      }));
  }, []);

  const questionsByCategory = useMemo(() => {
    return questions.reduce((acc, question) => {
      if (!acc[question.category]) {
        acc[question.category] = [];
      }
      acc[question.category].push(question);
      return acc;
    }, {} as Record<string, QuestionItem[]>);
  }, [questions]);

  const categories = useMemo(() => {
    return Object.keys(questionsByCategory).sort();
  }, [questionsByCategory]);

  return {
    questions,
    questionsByCategory,
    categories,
    totalQuestions: questions.length,
    flashcardItems
  };
}

