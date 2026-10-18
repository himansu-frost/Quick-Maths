// Deterministic Mathematical Question Engine for Quick Maths
// PRD Section 8 & 11: Pure deterministic calculations, zero AI hallucination

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface QuestionInstance {
  id: string;
  topicId: string;
  subtopicId: string;
  difficulty: DifficultyLevel;
  questionText: string;
  correctAnswer: string;
  numericAnswer: number;
  unit?: string;
  acceptedRounding: 'INTEGER' | '2_DECIMALS' | 'EXACT';
  hint: string;
  stepByStepExplanation: string;
  mentalShortcut?: string;
  parameters: Record<string, any>;
}

export interface ValidationResult {
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  numericDifference?: number;
  feedbackMessage: string;
}

// Helper random utilities with deterministic range bounds
export function randomInt(min: number, max: number, step = 1): number {
  const steps = Math.floor((max - min) / step);
  return min + Math.floor(Math.random() * (steps + 1)) * step;
}

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// Formatter for Currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

// Robust answer normalization and comparison
export function validateAnswer(userRaw: string, expectedAnswer: string, expectedNum: number, rounding: 'INTEGER' | '2_DECIMALS' | 'EXACT'): ValidationResult {
  const cleanedUser = userRaw.trim().replace(/[₹$,%]/g, '').replace(/,/g, '').trim();
  const cleanedExpected = expectedAnswer.trim().replace(/[₹$,%]/g, '').replace(/,/g, '').trim();

  // Try numerical comparison
  const parsedUser = parseFloat(cleanedUser);
  const parsedExpected = parseFloat(cleanedExpected);

  if (!isNaN(parsedUser) && !isNaN(parsedExpected)) {
    let tolerance = 0.01;
    if (rounding === 'INTEGER') tolerance = 0.5;
    else if (rounding === '2_DECIMALS') tolerance = 0.05;

    const diff = Math.abs(parsedUser - parsedExpected);
    const isCorrect = diff <= tolerance;

    return {
      isCorrect,
      userAnswer: userRaw,
      correctAnswer: expectedAnswer,
      numericDifference: diff,
      feedbackMessage: isCorrect ? 'Spot on! Excellent calculation.' : `Not quite. The correct answer is ${expectedAnswer}.`,
    };
  }

  // Fallback to strict string match (e.g. for time formats like "4:20 PM")
  const strMatch = cleanedUser.toLowerCase() === cleanedExpected.toLowerCase();
  return {
    isCorrect: strMatch,
    userAnswer: userRaw,
    correctAnswer: expectedAnswer,
    feedbackMessage: strMatch ? 'Great job! That is correct.' : `Incorrect. The expected answer is ${expectedAnswer}.`,
  };
}

// -------------------------------------------------------------
// QUESTION GENERATORS BY TOPIC
// -------------------------------------------------------------

// 1. SHOPPING & DISCOUNTS
export function generateShoppingDiscountQuestion(difficulty: DifficultyLevel): QuestionInstance {
  const qType = pickRandom(['single_discount', 'successive_discount', 'reverse_discount']);

  if (qType === 'single_discount' || difficulty === 'EASY') {
    const prices = difficulty === 'EASY' 
      ? [500, 800, 1000, 1200, 1500, 2000, 2500, 3000] 
      : [1450, 2350, 3499, 4500, 5200, 6800];
    const discounts = difficulty === 'EASY' 
      ? [10, 20, 25, 50] 
      : [15, 30, 35, 40, 45];

    const price = pickRandom(prices);
    const discount = pickRandom(discounts);
    const discountAmount = (price * discount) / 100;
    const finalPrice = Math.round(price - discountAmount);

    return {
      id: `shop-single-${Date.now()}-${randomInt(100, 999)}`,
      topicId: 'shopping-discounts',
      subtopicId: 'single-percentage-discounts',
      difficulty,
      questionText: `A jacket priced at ₹${price.toLocaleString()} is on sale with a ${discount}% discount. What is the final checkout price?`,
      correctAnswer: `${finalPrice}`,
      numericAnswer: finalPrice,
      unit: '₹',
      acceptedRounding: 'INTEGER',
      hint: `A ${discount}% discount means you pay ${100 - discount}% of the original price. Or find ${discount}% and subtract it from ₹${price}.`,
      stepByStepExplanation: `1. Calculate the discount amount: ₹${price} × ${discount}/100 = ₹${discountAmount}.\n2. Subtract the discount from the original price: ₹${price} - ₹${discountAmount} = ₹${finalPrice}.`,
      mentalShortcut: discount === 25 
        ? `To find 25%, divide the price by 4 (₹${price} ÷ 4 = ₹${discountAmount}) and subtract!` 
        : `Find 10% first (₹${price / 10}), multiply by ${discount / 10}, and subtract from the price.`,
      parameters: { price, discount, discountAmount, finalPrice },
    };
  } else if (qType === 'successive_discount') {
    const price = pickRandom([1000, 2000, 2500, 4000, 5000]);
    const d1 = pickRandom([20, 30, 40, 50]);
    const d2 = pickRandom([10, 20]);

    const step1Price = price * (1 - d1 / 100);
    const finalPrice = Math.round(step1Price * (1 - d2 / 100));
    const effectiveDiscount = Math.round(d1 + d2 - (d1 * d2) / 100);

    return {
      id: `shop-succ-${Date.now()}-${randomInt(100, 999)}`,
      topicId: 'shopping-discounts',
      subtopicId: 'successive-discounts',
      difficulty,
      questionText: `A gadget costs ₹${price.toLocaleString()}. The store offers a ${d1}% discount, plus an additional ${d2}% coupon applied at checkout. What is the final price?`,
      correctAnswer: `${finalPrice}`,
      numericAnswer: finalPrice,
      unit: '₹',
      acceptedRounding: 'INTEGER',
      hint: `Apply the first ${d1}% discount to ₹${price}, then take ${d2}% off that new intermediate price (not the original).`,
      stepByStepExplanation: `1. Apply ${d1}% on ₹${price}: ₹${price} - ₹${(price * d1) / 100} = ₹${step1Price}.\n2. Apply ${d2}% on intermediate price ₹${step1Price}: ₹${step1Price} - ₹${(step1Price * d2) / 100} = ₹${finalPrice}.\nNotice total discount is ${effectiveDiscount}%, NOT ${d1 + d2}%!`,
      mentalShortcut: `Successive discount formula: A + B - (A × B)/100 = ${d1} + ${d2} - ${(d1 * d2) / 100} = ${effectiveDiscount}% total discount.`,
      parameters: { price, d1, d2, finalPrice, effectiveDiscount },
    };
  } else {
    // Reverse discount
    const discount = pickRandom([10, 20, 25, 50]);
    const originalPrice = pickRandom([1000, 1500, 2000, 2400, 3000, 4000]);
    const finalPrice = originalPrice * (1 - discount / 100);

    return {
      id: `shop-rev-${Date.now()}-${randomInt(100, 999)}`,
      topicId: 'shopping-discounts',
      subtopicId: 'single-percentage-discounts',
      difficulty: 'HARD',
      questionText: `After a ${discount}% discount was applied, Sarah paid ₹${finalPrice.toLocaleString()} for a smartwatch. What was the original price before the discount?`,
      correctAnswer: `${originalPrice}`,
      numericAnswer: originalPrice,
      unit: '₹',
      acceptedRounding: 'INTEGER',
      hint: `Sarah paid ${100 - discount}% of the original price. So ₹${finalPrice} equals ${(100 - discount) / 100} × Original Price.`,
      stepByStepExplanation: `1. Final price is ${100 - discount}% of Original Price.\n2. Original Price = Final Price ÷ ${(100 - discount) / 100} = ₹${finalPrice} ÷ ${(100 - discount) / 100} = ₹${originalPrice}.`,
      mentalShortcut: discount === 20 
        ? `If 80% is ₹${finalPrice}, then 10% is ₹${finalPrice / 8}. Multiply by 10 to get 100% (₹${originalPrice}).` 
        : `Divide by ${(100 - discount) / 100} to restore the original amount.`,
      parameters: { originalPrice, discount, finalPrice },
    };
  }
}

// 2. BUDGETING & EXPENSE TRACKING
export function generateBudgetingQuestion(difficulty: DifficultyLevel): QuestionInstance {
  const isDailyCap = pickRandom([true, false]);

  if (!isDailyCap || difficulty === 'EASY') {
    const incomes = [30000, 40000, 50000, 60000, 75000, 90000, 100000];
    const income = pickRandom(incomes);
    const category = pickRandom(['Needs (50%)', 'Wants (30%)', 'Savings (20%)']);

    let target = 0;
    let percent = 0;
    if (category.includes('50%')) {
      percent = 50;
      target = income * 0.5;
    } else if (category.includes('30%')) {
      percent = 30;
      target = income * 0.3;
    } else {
      percent = 20;
      target = income * 0.2;
    }

    return {
      id: `budget-503020-${Date.now()}-${randomInt(100, 999)}`,
      topicId: 'budgeting-expense-tracking',
      subtopicId: 'monthly-savings-50-30-20',
      difficulty,
      questionText: `Under the 50/30/20 budgeting rule, if your monthly net take-home pay is ₹${income.toLocaleString()}, how much should be allocated to ${category}?`,
      correctAnswer: `${target}`,
      numericAnswer: target,
      unit: '₹',
      acceptedRounding: 'INTEGER',
      hint: `Multiply your income of ₹${income} by ${percent}%.`,
      stepByStepExplanation: `1. Target percentage is ${percent}%.\n2. Allocation = ₹${income} × (${percent} / 100) = ₹${target}.`,
      mentalShortcut: percent === 20 
        ? `To find 20%: find 10% by dropping a zero (₹${income / 10}), then double it (₹${target})!` 
        : `Multiply the first digits and match zeroes.`,
      parameters: { income, percent, target, category },
    };
  } else {
    // Daily cap
    const discretionary = pickRandom([9000, 12000, 15000, 18000, 21000, 24000, 30000]);
    const days = pickRandom([30, 25, 20]);
    const dailyCap = Math.round(discretionary / days);

    return {
      id: `budget-daily-${Date.now()}-${randomInt(100, 999)}`,
      topicId: 'budgeting-expense-tracking',
      subtopicId: 'daily-expense-tracking',
      difficulty,
      questionText: `You have ₹${discretionary.toLocaleString()} remaining for flexible spending over the next ${days} days. What is your daily spending cap to stay within budget?`,
      correctAnswer: `${dailyCap}`,
      numericAnswer: dailyCap,
      unit: '₹',
      acceptedRounding: 'INTEGER',
      hint: `Divide your total remaining discretionary funds by the number of days.`,
      stepByStepExplanation: `1. Daily Spending Cap = Remaining Budget ÷ Days = ₹${discretionary} ÷ ${days} = ₹${dailyCap} per day.`,
      mentalShortcut: `Divide ₹${discretionary} by ${days / 10} and then by 10.`,
      parameters: { discretionary, days, dailyCap },
    };
  }
}

// 3. TIPPING & SPLITTING BILLS
export function generateTippingSplittingQuestion(difficulty: DifficultyLevel): QuestionInstance {
  const subtotal = pickRandom([1200, 1500, 1800, 2400, 3000, 3600, 4200, 4800]);
  const tipPercent = pickRandom([10, 12, 15, 18, 20]);
  const people = pickRandom([2, 3, 4, 5, 6]);

  const tipAmount = (subtotal * tipPercent) / 100;
  const totalBill = subtotal + tipAmount;
  const perPerson = Math.round((totalBill / people) * 100) / 100;

  return {
    id: `tip-split-${Date.now()}-${randomInt(100, 999)}`,
    topicId: 'tipping-splitting-bills',
    subtopicId: 'equal-bill-splitting-tipping',
    difficulty,
    questionText: `A restaurant food bill comes to ₹${subtotal.toLocaleString()}. A ${tipPercent}% service tip is added. If ${people} friends split the total bill equally, how much does each person pay?`,
    correctAnswer: `${perPerson}`,
    numericAnswer: perPerson,
    unit: '₹',
    acceptedRounding: '2_DECIMALS',
    hint: `Calculate the total bill including the ${tipPercent}% tip, then divide by ${people}.`,
    stepByStepExplanation: `1. Calculate the tip: ₹${subtotal} × ${tipPercent}/100 = ₹${tipAmount}.\n2. Total bill = ₹${subtotal} + ₹${tipAmount} = ₹${totalBill}.\n3. Per person share = ₹${totalBill} ÷ ${people} = ₹${perPerson}.`,
    mentalShortcut: `Divide the subtotal first: ₹${subtotal} ÷ ${people} = ₹${subtotal / people}. Then add ${tipPercent}% to that single share!`,
    parameters: { subtotal, tipPercent, people, totalBill, perPerson },
  };
}

// 4. COOKING & RECIPE SCALING
export function generateCookingScalingQuestion(difficulty: DifficultyLevel): QuestionInstance {
  const ingredients = [
    { name: 'flour', unit: 'grams', baseQty: 200 },
    { name: 'milk', unit: 'ml', baseQty: 150 },
    { name: 'sugar', unit: 'grams', baseQty: 100 },
    { name: 'butter', unit: 'grams', baseQty: 80 },
    { name: 'pasta', unit: 'grams', baseQty: 250 },
  ];
  const item = pickRandom(ingredients);
  const origServings = pickRandom([2, 4, 6]);
  const targetServings = pickRandom([3, 5, 8, 10, 12]);

  const factor = targetServings / origServings;
  const scaledQty = Math.round(item.baseQty * factor * 10) / 10;

  return {
    id: `cooking-scale-${Date.now()}-${randomInt(100, 999)}`,
    topicId: 'cooking-recipe-scaling',
    subtopicId: 'scaling-servings',
    difficulty,
    questionText: `A recipe for ${origServings} servings calls for ${item.baseQty} ${item.unit} of ${item.name}. How many ${item.unit} of ${item.name} are needed to prepare ${targetServings} servings?`,
    correctAnswer: `${scaledQty}`,
    numericAnswer: scaledQty,
    unit: item.unit,
    acceptedRounding: '2_DECIMALS',
    hint: `Find the quantity needed for 1 serving (${item.baseQty} ÷ ${origServings}), then multiply by ${targetServings}.`,
    stepByStepExplanation: `1. Calculate the scaling factor: ${targetServings} ÷ ${origServings} = ${factor.toFixed(2)}.\n2. Multiply original quantity: ${item.baseQty} × ${factor.toFixed(2)} = ${scaledQty} ${item.unit}.`,
    mentalShortcut: `Unit rate method: ${item.baseQty} ÷ ${origServings} = ${item.baseQty / origServings} per serving. Multiply by ${targetServings}.`,
    parameters: { origServings, targetServings, baseQty: item.baseQty, unit: item.unit, scaledQty },
  };
}

// 5. LOANS, EMI & INTEREST
export function generateLoansQuestion(difficulty: DifficultyLevel): QuestionInstance {
  const isNoCost = pickRandom([true, false]) && difficulty !== 'EASY';

  if (isNoCost) {
    const price = pickRandom([30000, 48000, 60000, 72000]);
    const months = pickRandom([6, 12]);
    const fee = pickRandom([299, 499, 799]);
    const monthlyPay = price / months;
    const totalCost = price + fee;

    return {
      id: `loan-nocost-${Date.now()}-${randomInt(100, 999)}`,
      topicId: 'loans-emi-interest',
      subtopicId: 'simple-interest-emi',
      difficulty: 'HARD',
      questionText: `A laptop priced at ₹${price.toLocaleString()} is offered on a ${months}-month "Zero-Interest EMI" with a one-time non-refundable processing fee of ₹${fee}. What is the total overall cost paid for the laptop?`,
      correctAnswer: `${totalCost}`,
      numericAnswer: totalCost,
      unit: '₹',
      acceptedRounding: 'INTEGER',
      hint: `Even with zero interest, the processing fee adds to the total purchase price.`,
      stepByStepExplanation: `1. Monthly installment = ₹${price} ÷ ${months} = ₹${monthlyPay}/month.\n2. Total loan repayment = ₹${price}.\n3. Total overall cost = Principal + Processing Fee = ₹${price} + ₹${fee} = ₹${totalCost}.`,
      mentalShortcut: `Add the upfront processing fee directly to the sticker price!`,
      parameters: { price, months, fee, totalCost },
    };
  } else {
    // Simple Interest
    const principal = pickRandom([10000, 20000, 40000, 50000, 80000, 100000]);
    const rate = pickRandom([5, 6, 8, 10, 12]);
    const years = pickRandom([2, 3, 4, 5]);

    const interest = (principal * rate * years) / 100;
    const totalRepay = principal + interest;

    return {
      id: `loan-si-${Date.now()}-${randomInt(100, 999)}`,
      topicId: 'loans-emi-interest',
      subtopicId: 'simple-interest-emi',
      difficulty,
      questionText: `Calculate the total simple interest on a loan of ₹${principal.toLocaleString()} borrowed at an annual rate of ${rate}% for ${years} years.`,
      correctAnswer: `${interest}`,
      numericAnswer: interest,
      unit: '₹',
      acceptedRounding: 'INTEGER',
      hint: `Simple Interest = (Principal × Rate × Time in years) ÷ 100.`,
      stepByStepExplanation: `1. Interest per year = ${rate}% of ₹${principal} = ₹${(principal * rate) / 100}.\n2. Total interest for ${years} years = ₹${(principal * rate) / 100} × ${years} = ₹${interest}.\n3. Total repayment would be ₹${principal} + ₹${interest} = ₹${totalRepay}.`,
      mentalShortcut: `Combine Rate × Time first: ${rate}% × ${years} years = ${rate * years}%. Then take ${rate * years}% of ₹${principal}.`,
      parameters: { principal, rate, years, interest, totalRepay },
    };
  }
}

// 6. TRAVEL & COMMUTE ESTIMATION
export function generateTravelCommuteQuestion(difficulty: DifficultyLevel): QuestionInstance {
  const mileage = pickRandom([12, 15, 18, 20, 25, 40]);
  const distance = pickRandom([60, 90, 150, 240, 300, 450]);
  const fuelPrice = pickRandom([95, 100, 105]);

  const litresNeeded = distance / mileage;
  const totalCost = Math.round(litresNeeded * fuelPrice * 100) / 100;

  return {
    id: `travel-fuel-${Date.now()}-${randomInt(100, 999)}`,
    topicId: 'travel-commute-estimation',
    subtopicId: 'fuel-mileage-cost',
    difficulty,
    questionText: `A vehicle gives a mileage of ${mileage} km/L. If you drive a distance of ${distance} km with fuel priced at ₹${fuelPrice}/L, what will be the total fuel expense?`,
    correctAnswer: `${totalCost}`,
    numericAnswer: totalCost,
    unit: '₹',
    acceptedRounding: '2_DECIMALS',
    hint: `Divide distance by mileage to get litres needed, then multiply by fuel price per litre.`,
    stepByStepExplanation: `1. Litres of fuel needed = ${distance} km ÷ ${mileage} km/L = ${litresNeeded.toFixed(2)} litres.\n2. Total fuel cost = ${litresNeeded.toFixed(2)} L × ₹${fuelPrice}/L = ₹${totalCost}.`,
    mentalShortcut: `Calculate litres needed first: ${distance} ÷ ${mileage} = ${litresNeeded}. Then multiply by ₹${fuelPrice}.`,
    parameters: { mileage, distance, fuelPrice, litresNeeded, totalCost },
  };
}

// 7. TIME & SCHEDULE MANAGEMENT
export function generateTimeScheduleQuestion(difficulty: DifficultyLevel): QuestionInstance {
  const startHour = randomInt(1, 9);
  const startMin = pickRandom([15, 30, 45, 50]);
  const durHours = randomInt(1, 3);
  const durMins = pickRandom([20, 25, 35, 40, 45]);

  let totalMins = startMin + durMins;
  let endHour = startHour + durHours;
  if (totalMins >= 60) {
    endHour += Math.floor(totalMins / 60);
    totalMins = totalMins % 60;
  }
  const formattedMinutes = totalMins < 10 ? `0${totalMins}` : `${totalMins}`;
  const formattedAnswer = `${endHour}:${formattedMinutes}`;

  return {
    id: `time-calc-${Date.now()}-${randomInt(100, 999)}`,
    topicId: 'time-schedule-management',
    subtopicId: 'elapsed-time-deadlines',
    difficulty,
    questionText: `A workshop starts at ${startHour}:${startMin} PM and runs for ${durHours} hour(s) and ${durMins} minutes. At what time will the workshop finish? (Format as H:MM)`,
    correctAnswer: formattedAnswer,
    numericAnswer: endHour * 60 + totalMins,
    unit: 'time',
    acceptedRounding: 'EXACT',
    hint: `Add the full hours first, then add the minutes, remembering that 60 minutes creates a new hour.`,
    stepByStepExplanation: `1. Add ${durHours} hours to ${startHour}:${startMin} PM = ${startHour + durHours}:${startMin} PM.\n2. Add ${durMins} minutes: ${startMin} + ${durMins} = ${startMin + durMins} minutes.\n3. Since ${startMin + durMins} >= 60, convert 60 minutes into 1 hour: ${endHour}:${formattedMinutes} PM.`,
    mentalShortcut: `Jump to the next whole hour first, then add what remains of the duration minutes!`,
    parameters: { startHour, startMin, durHours, durMins, formattedAnswer },
  };
}

// 8. FITNESS & HEALTH CALCULATIONS
export function generateFitnessHealthQuestion(difficulty: DifficultyLevel): QuestionInstance {
  const weight = pickRandom([50, 60, 65, 70, 75, 80, 85, 90]);
  const ratio = pickRandom([1.4, 1.6, 1.8, 2.0]);
  const proteinTarget = Math.round(weight * ratio * 10) / 10;

  return {
    id: `fit-protein-${Date.now()}-${randomInt(100, 999)}`,
    topicId: 'fitness-health-calculations',
    subtopicId: 'nutrition-macro-targets',
    difficulty,
    questionText: `An active adult weighing ${weight} kg aims for an educational target of ${ratio}g of protein per kg of body weight daily. What is their daily protein target in grams?`,
    correctAnswer: `${proteinTarget}`,
    numericAnswer: proteinTarget,
    unit: 'grams',
    acceptedRounding: 'INTEGER',
    hint: `Multiply body weight (${weight} kg) by target ratio (${ratio} g/kg).`,
    stepByStepExplanation: `1. Target Daily Protein = Weight in kg × Ratio = ${weight} × ${ratio} = ${proteinTarget} grams.\n(Note: Purely educational mathematical calculation, not individual medical advice).`,
    mentalShortcut: ratio === 2.0 
      ? `Simply double the weight: ${weight} × 2 = ${proteinTarget}g.` 
      : `Multiply by 1.5 first and adjust, or do ${weight} × ${Math.floor(ratio)} + ${weight} × 0.${(ratio * 10) % 10}.`,
    parameters: { weight, ratio, proteinTarget },
  };
}

// 9. HOME REPAIR & INTERIOR WORK
export function generateHomeRepairQuestion(difficulty: DifficultyLevel): QuestionInstance {
  const length = randomInt(3, 8);
  const height = randomInt(3, 4);
  const area = length * height;
  const coverage = 10; // 10 sq m per litre
  const coats = pickRandom([2, 3]);
  const litresNeeded = (area * coats) / coverage;

  return {
    id: `repair-paint-${Date.now()}-${randomInt(100, 999)}`,
    topicId: 'home-repair-interior-work',
    subtopicId: 'wall-area-paint-estimation',
    difficulty,
    questionText: `A wall measures ${length} metres long and ${height} metres high. If 1 litre of paint covers ${coverage} m² for 1 coat, how many litres of paint are required to apply ${coats} coats?`,
    correctAnswer: `${litresNeeded}`,
    numericAnswer: litresNeeded,
    unit: 'litres',
    acceptedRounding: '2_DECIMALS',
    hint: `Calculate total wall area (Length × Height), multiply by ${coats} coats, then divide by coverage per litre.`,
    stepByStepExplanation: `1. Wall Area = ${length}m × ${height}m = ${area} m².\n2. Total surface to paint for ${coats} coats = ${area} × ${coats} = ${area * coats} m².\n3. Paint needed = ${area * coats} ÷ ${coverage} = ${litresNeeded} litres.`,
    mentalShortcut: `Compute total square metres first: ${area * coats} m², then divide by 10 by moving decimal left: ${litresNeeded} litres.`,
    parameters: { length, height, area, coverage, coats, litresNeeded },
  };
}

// 10. SALARY & TAX PLANNING
export function generateSalaryTaxQuestion(difficulty: DifficultyLevel): QuestionInstance {
  const basic = pickRandom([20000, 25000, 30000, 40000, 50000, 60000]);
  const pfRate = 12; // 12% statutory PF rate
  const pfAmount = (basic * pfRate) / 100;

  return {
    id: `salary-pf-${Date.now()}-${randomInt(100, 999)}`,
    topicId: 'salary-tax-planning',
    subtopicId: 'ctc-vs-take-home',
    difficulty,
    questionText: `An employee's Basic Salary is ₹${basic.toLocaleString()} per month. If Employee Provident Fund (PF) is deducted at the standard rate of 12% of Basic, what is the monthly PF deduction?`,
    correctAnswer: `${pfAmount}`,
    numericAnswer: pfAmount,
    unit: '₹',
    acceptedRounding: 'INTEGER',
    hint: `Calculate 12% of the Basic Salary (10% + 2%).`,
    stepByStepExplanation: `1. PF Deduction = Basic Salary × 12% = ₹${basic} × 0.12 = ₹${pfAmount}.`,
    mentalShortcut: `10% of ₹${basic} = ₹${basic * 0.1}. 1% = ₹${basic * 0.01}, so 2% = ₹${basic * 0.02}. Add them together: ₹${basic * 0.1} + ₹${basic * 0.02} = ₹${pfAmount}.`,
    parameters: { basic, pfRate, pfAmount },
  };
}

// 11. RATIOS & PROPORTIONS
export function generateRatiosQuestion(difficulty: DifficultyLevel): QuestionInstance {
  const r1 = randomInt(2, 5);
  const r2 = randomInt(3, 7);
  const totalParts = r1 + r2;
  const unitMultiplier = pickRandom([100, 250, 500, 1000, 2000]);
  const totalAmount = totalParts * unitMultiplier;
  const askFor = pickRandom(['A', 'B']);
  const chosenPart = askFor === 'A' ? r1 : r2;
  const answer = chosenPart * unitMultiplier;

  return {
    id: `ratio-share-${Date.now()}-${randomInt(100, 999)}`,
    topicId: 'ratios-proportions',
    subtopicId: 'sharing-amounts-ratios',
    difficulty,
    questionText: `An amount of ₹${totalAmount.toLocaleString()} is divided between Person A and Person B in the ratio ${r1} : ${r2}. How much does Person ${askFor} receive?`,
    correctAnswer: `${answer}`,
    numericAnswer: answer,
    unit: '₹',
    acceptedRounding: 'INTEGER',
    hint: `Add the ratio parts (${r1} + ${r2} = ${totalParts}). Divide ₹${totalAmount} by ${totalParts} to find 1 part's worth.`,
    stepByStepExplanation: `1. Total ratio parts = ${r1} + ${r2} = ${totalParts} parts.\n2. Value of 1 part = ₹${totalAmount} ÷ ${totalParts} = ₹${unitMultiplier}.\n3. Person ${askFor}'s share = ${chosenPart} parts × ₹${unitMultiplier} = ₹${answer}.`,
    mentalShortcut: `₹${totalAmount} ÷ ${totalParts} = ₹${unitMultiplier}. Multiply by ${chosenPart} to get ₹${answer}.`,
    parameters: { r1, r2, totalParts, unitMultiplier, totalAmount, askFor, chosenPart, answer },
  };
}

// Master Dispatcher
export function generateQuestionForTopic(topicId: string, difficulty: DifficultyLevel = 'MEDIUM'): QuestionInstance {
  switch (topicId) {
    case 'shopping-discounts':
      return generateShoppingDiscountQuestion(difficulty);
    case 'budgeting-expense-tracking':
      return generateBudgetingQuestion(difficulty);
    case 'tipping-splitting-bills':
      return generateTippingSplittingQuestion(difficulty);
    case 'cooking-recipe-scaling':
      return generateCookingScalingQuestion(difficulty);
    case 'loans-emi-interest':
      return generateLoansQuestion(difficulty);
    case 'travel-commute-estimation':
      return generateTravelCommuteQuestion(difficulty);
    case 'time-schedule-management':
      return generateTimeScheduleQuestion(difficulty);
    case 'fitness-health-calculations':
      return generateFitnessHealthQuestion(difficulty);
    case 'home-repair-interior-work':
      return generateHomeRepairQuestion(difficulty);
    case 'salary-tax-planning':
      return generateSalaryTaxQuestion(difficulty);
    case 'ratios-proportions':
      return generateRatiosQuestion(difficulty);
    default:
      return generateShoppingDiscountQuestion(difficulty);
  }
}
