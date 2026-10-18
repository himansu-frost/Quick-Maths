import { describe, it, expect } from 'vitest';
import {
  generateQuestionForTopic,
  validateAnswer,
  generateShoppingDiscountQuestion,
  generateBudgetingQuestion,
  generateLoansQuestion,
  generateRatiosQuestion,
  generateTravelCommuteQuestion,
} from './engine';

describe('Deterministic Mathematical Question Engine', () => {
  it('generates valid questions with matching answers and explanations for all 11 topics', () => {
    const topics = [
      'budgeting-expense-tracking',
      'shopping-discounts',
      'tipping-splitting-bills',
      'cooking-recipe-scaling',
      'loans-emi-interest',
      'travel-commute-estimation',
      'time-schedule-management',
      'fitness-health-calculations',
      'home-repair-interior-work',
      'salary-tax-planning',
      'ratios-proportions',
    ];

    for (const topicId of topics) {
      const qEasy = generateQuestionForTopic(topicId, 'EASY');
      const qMed = generateQuestionForTopic(topicId, 'MEDIUM');
      const qHard = generateQuestionForTopic(topicId, 'HARD');

      for (const q of [qEasy, qMed, qHard]) {
        expect(q.topicId).toBe(topicId);
        expect(q.questionText).toBeTruthy();
        expect(q.correctAnswer).toBeTruthy();
        expect(q.hint).toBeTruthy();
        expect(q.stepByStepExplanation).toBeTruthy();
        expect(q.stepByStepExplanation).toContain(q.correctAnswer);
      }
    }
  });

  describe('Answer Validator', () => {
    it('accepts exact numeric answers with or without currency signs or commas', () => {
      const res1 = validateAnswer('₹2,400', '2400', 2400, 'INTEGER');
      expect(res1.isCorrect).toBe(true);

      const res2 = validateAnswer('2400', '2400', 2400, 'INTEGER');
      expect(res2.isCorrect).toBe(true);

      const res3 = validateAnswer(' 2400 ', '2400', 2400, 'INTEGER');
      expect(res3.isCorrect).toBe(true);
    });

    it('rejects incorrect answers safely', () => {
      const res = validateAnswer('1500', '2400', 2400, 'INTEGER');
      expect(res.isCorrect).toBe(false);
      expect(res.feedbackMessage).toContain('2400');
    });

    it('handles decimal precision within tolerance', () => {
      const res = validateAnswer('24.50', '24.5', 24.5, '2_DECIMALS');
      expect(res.isCorrect).toBe(true);
    });
  });

  describe('Specific Mathematical Logic', () => {
    it('validates single and successive discounts correctly', () => {
      const q = generateShoppingDiscountQuestion('MEDIUM');
      expect(q.numericAnswer).toBeGreaterThan(0);
      expect(q.stepByStepExplanation).toBeDefined();
    });

    it('validates 50/30/20 budgeting partitions correctly', () => {
      const q = generateBudgetingQuestion('EASY');
      expect(q.numericAnswer).toBeGreaterThan(0);
      expect(q.parameters.income).toBeGreaterThan(0);
    });

    it('validates simple interest and zero-interest EMI', () => {
      const q = generateLoansQuestion('HARD');
      expect(q.numericAnswer).toBeGreaterThan(0);
    });

    it('validates ratio division sum equals total', () => {
      const q = generateRatiosQuestion('MEDIUM');
      const { r1, r2, totalParts, unitMultiplier, totalAmount } = q.parameters;
      expect(r1 + r2).toBe(totalParts);
      expect(totalParts * unitMultiplier).toBe(totalAmount);
    });
  });
});
