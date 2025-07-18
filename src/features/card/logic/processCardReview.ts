import { Card } from "../types";
import { calculateNewEaseFactor } from "./calculateEaseFactor";
import { calculateNextDueDate } from "./calculateNextDueDate";
import { calculateNextInterval } from "./calculateNextInterval";

export const processCardReview = (card: Card, rating: number, currentTime?: Date | number) => {
  const isSuccessful = rating >= 3;
  const newRepetitions = isSuccessful ? card.repetitions + 1 : 0;
  const newEaseFactor = calculateNewEaseFactor(card.easeFactor, rating);
  const newInterval = calculateNextInterval(card, rating);

  const currentDueDate = card?.nextDueDate
    ? new Date(card.nextDueDate)
    : new Date();

  const newDueDate = calculateNextDueDate(
    new Date(currentDueDate),
    newInterval
  );

  // Use provided currentTime or default to new Date()
  const reviewTime = currentTime !== undefined ? currentTime : new Date();

  return {
    ...card,
    easeFactor: newEaseFactor,
    interval: newInterval,
    newDueDate: newDueDate,
    repetitions: newRepetitions,
    lastReviewedAt: reviewTime,
  };
};
