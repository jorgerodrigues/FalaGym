import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { processCardReview } from "../processCardReview";
import * as easeFactor from "../calculateEaseFactor";
import * as dueDate from "../calculateNextDueDate";
import * as interval from "../calculateNextInterval";
import { Card } from "../../types";

describe("processCardReview", () => {
  const mockCard: Card = {
    id: "test-id",
    front: "Test Front",
    back: "Test Back",
    repetitions: 2,
    easeFactor: 2.5,
    interval: 6,
    userId: "test-user-id",
    createdAt: new Date("2023-01-01T00:00:00Z"),
    updatedAt: new Date("2023-01-10T00:00:00Z"),
    nextDueDate: new Date("2023-01-15T00:00:00Z"),
  };

  const mockCurrentTime = 1673913600000; // 2023-01-17T00:00:00Z

  beforeEach(() => {
    // Setup spies
    vi.spyOn(easeFactor, "calculateNewEaseFactor").mockReturnValue(2.7);
    vi.spyOn(interval, "calculateNextInterval").mockReturnValue(12);
    vi.spyOn(dueDate, "calculateNextDueDate").mockReturnValue(
      new Date("2023-01-27T00:00:00Z")
    );
    
    // Mock Date constructor to return consistent time
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockCurrentTime));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should process a successful review (rating >= 3)", () => {
    const rating = 4;

    const result = processCardReview(mockCard, rating, mockCurrentTime);

    // Verify calculation functions were called with correct parameters
    expect(easeFactor.calculateNewEaseFactor).toHaveBeenCalledWith(
      mockCard.easeFactor,
      rating
    );
    expect(interval.calculateNextInterval).toHaveBeenCalledWith(
      mockCard,
      rating
    );
    expect(dueDate.calculateNextDueDate).toHaveBeenCalledWith(
      expect.any(Date),
      12 // The mocked return value of calculateNextInterval
    );

    // Verify return values
    expect(result).toEqual({
      ...mockCard,
      easeFactor: 2.7,
      interval: 12,
      newDueDate: new Date("2023-01-27T00:00:00Z"),
      repetitions: 3, // Incremented
      lastReviewedAt: mockCurrentTime,
    });
  });

  it("should process a failed review (rating < 3)", () => {
    const rating = 2;

    const result = processCardReview(mockCard, rating, mockCurrentTime);

    // Verify calculation functions were called with correct parameters
    expect(easeFactor.calculateNewEaseFactor).toHaveBeenCalledWith(
      mockCard.easeFactor,
      rating
    );
    expect(interval.calculateNextInterval).toHaveBeenCalledWith(
      mockCard,
      rating
    );
    expect(dueDate.calculateNextDueDate).toHaveBeenCalledWith(
      expect.any(Date),
      12 // The mocked return value of calculateNextInterval
    );

    // Verify return values
    expect(result).toEqual({
      ...mockCard,
      easeFactor: 2.7,
      interval: 12,
      newDueDate: new Date("2023-01-27T00:00:00Z"),
      repetitions: 0, // Reset to 0 on failure
      lastReviewedAt: mockCurrentTime,
    });
  });

  it("should use the card's nextDueDate if available", () => {
    const rating = 3;

    processCardReview(mockCard, rating, mockCurrentTime);

    // The first parameter to calculateNextDueDate should be based on nextDueDate
    expect(dueDate.calculateNextDueDate).toHaveBeenCalledWith(
      expect.any(Date),
      expect.any(Number)
    );

    const mockCalls = vi.mocked(dueDate.calculateNextDueDate).mock.calls;
    const dateParam = mockCalls[0][0];
    expect(dateParam.toISOString()).toBe(
      new Date(mockCard.nextDueDate!).toISOString()
    );
  });

  it("should use current date if nextDueDate is not available", () => {
    const cardWithoutDueDate = { ...mockCard };
    delete cardWithoutDueDate.nextDueDate;

    const rating = 3;

    processCardReview(cardWithoutDueDate, rating, mockCurrentTime);

    // The first parameter to calculateNextDueDate should be a new date
    expect(dueDate.calculateNextDueDate).toHaveBeenCalled();

    // Can't easily check the exact date since it's created during execution
    // but we can verify it was called
    expect(dueDate.calculateNextDueDate).toHaveBeenCalledWith(
      expect.any(Date),
      expect.any(Number)
    );
  });

  it("should handle string dates in nextDueDate", () => {
    const cardWithStringDate = {
      ...mockCard,
      nextDueDate: "2023-01-15T00:00:00Z",
    };

    const rating = 3;

    processCardReview(cardWithStringDate, rating, mockCurrentTime);

    // Verify a Date object was created for the string date
    expect(dueDate.calculateNextDueDate).toHaveBeenCalled();

    const mockCalls = vi.mocked(dueDate.calculateNextDueDate).mock.calls;
    const dateParam = mockCalls[0][0];
    expect(dateParam instanceof Date).toBe(true);
  });

  it("should preserve all other card properties", () => {
    const cardWithExtraProps: Card & { customField: string } = {
      ...mockCard,
      customField: "custom value",
    };

    const rating = 4;

    const result = processCardReview(
      cardWithExtraProps,
      rating,
      mockCurrentTime
    );

    // Verify all original properties are preserved
    expect(result.id).toBe(mockCard.id);
    expect(result.front).toBe(mockCard.front);
    expect(result.back).toBe(mockCard.back);
    expect(result.userId).toBe(mockCard.userId);
    expect(result.createdAt).toBe(mockCard.createdAt);
    expect(result.updatedAt).toBe(mockCard.updatedAt);
  });
});
