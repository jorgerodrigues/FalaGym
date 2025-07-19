"use client";

import { Button } from "@/components/Button";
import { useAnimatedText } from "@/hooks/useAnimatedText";
import { apiFetcher } from "@/lib/api/apiFetcher";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card as CardType } from "@/features/card/types";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState, useRef } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useUser } from "@/providers/LoggedUserProvider";
import { useTranslations } from "next-intl";
import { Accordion, AccordionItem } from "@/components/Accordion";
import { SpeakerIcon } from "@/icons/Speaker";
import { PauseIcon } from "@/icons/Pause";
import { STORAGE_BUCKETS_PUBLIC_URL } from "@/constants/storageBuckets";

export default function Page() {
  const t = useTranslations("sentence");
  const [showDefinition, setShowDefinition] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [availableCards, setAvailableCards] = useState<Array<CardType>>([]);
  const [isRefetching, setIsRefetching] = useState(false);
  const selectedCardIdRef = useRef<string | null>(null);

  const { user, setFullPageLoading } = useUser();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["cards", user.id],
    queryFn: () =>
      apiFetcher<Array<CardType>>(`api/card/types/sentence/${user.id}`),
    enabled: Boolean(user.id),
  });

  const { mutate: logCard } = useMutation({
    mutationFn: (r: number) => {
      if (!selectedCardId) {
        throw new Error("No card selected");
      }
      return apiFetcher(`api/card/${selectedCardId}/review`, {
        method: "POST",
        body: JSON.stringify({
          rating: r,
        }),
      });
    },
  });

  useEffect(() => {
    selectedCardIdRef.current = selectedCardId;
  }, [selectedCardId]);

  useEffect(() => {
    if (data && data.length > 0) {
      setAvailableCards(data);
      const hasValidSelection =
        selectedCardIdRef.current &&
        data.find((card) => card.id === selectedCardIdRef.current);
      if (!hasValidSelection) {
        setSelectedCardId(data[0].id);
      }
      setIsRefetching(false);
    } else if (data && data.length === 0) {
      setIsRefetching(false);
    }
  }, [data, isRefetching]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setFullPageLoading?.(isLoading);
  }, [isLoading, setFullPageLoading]);

  const selectedSentence = useMemo(() => {
    if (!availableCards?.length || !selectedCardId) {
      return null;
    }

    const item = availableCards.find((i) => i.id === selectedCardId);

    if (!item) {
      return null;
    }

    const fullUrl = item.sentence?.audioUrl
      ? `${STORAGE_BUCKETS_PUBLIC_URL.AUDIO}/${item.sentence.audioUrl}`
      : undefined;

    return {
      id: item.id,
      sentence: item.front,
      translation: item.back,
      audioUrl: fullUrl,
      definitions:
        item.sentence?.words?.map((word) => ({
          id: word.id,
          word: word.word,
          definition: word.definition,
        })) || [],
    };
  }, [availableCards, selectedCardId]);

  const audioPlayer = useAudioPlayer(selectedSentence?.audioUrl);

  const handleNextSentence = async () => {
    if (!availableCards?.length) {
      return;
    }

    if (availableCards?.length > 1) {
      const nextCard = availableCards?.[1];
      setAvailableCards((prev) => prev.filter((c) => c.id !== selectedCardId));
      setSelectedCardId(nextCard.id);
      setShowDefinition(false);
      audioPlayer.stop();
      return;
    }

    if (availableCards?.length === 1) {
      setIsRefetching(true);

      setAvailableCards((prev) => prev.filter((c) => c.id !== selectedCardId));
      setSelectedCardId(null);

      try {
        await refetch();

        setShowDefinition(false);
        audioPlayer.stop();
        return;
      } catch {
        // Reset to show loading state
        setShowDefinition(false);
        audioPlayer.stop();
        setIsRefetching(false);
        return;
      }
    }

    setShowDefinition(false);
    audioPlayer.stop();
    return;
  };

  const handleSkip = () => {
    handleNextSentence();
  };

  const handleShowAnswer = () => {
    setShowDefinition(true);
  };

  const handleWrong = () => {
    if (!selectedCardId) {
      return;
    }

    handleNextSentence();

    // Log the review in background - no need to wait
    logCard(0, {
      onError: (error) => {
        console.error("Failed to log review:", error);
      },
    });
    return;
  };

  const handleRight = () => {
    if (!selectedCardId) {
      return;
    }

    handleNextSentence();

    logCard(5, {
      onError: (error) => {
        console.error("Failed to log review:", error);
      },
    });
  };

  return (
    <motion.div
      className={`flex flex-col w-full items-center justify-center h-full min-h-[80vh] p-small lg:py-large`}
      layout={"position"}
    >
      {selectedSentence ? (
        <div
          key={selectedSentence.id}
          className={
            "flex flex-col md:max-w-[600px] xl:max-w-[850px] gap-xLarge w-full py-large"
          }
          style={{ width: "100%" }}
        >
          <Sentence
            content={selectedSentence.sentence}
            onSkip={handleSkip}
            onShowAnswer={handleShowAnswer}
            answerDisplayed={showDefinition}
            audioUrl={selectedSentence.audioUrl}
            onPlayPauseAudio={audioPlayer.togglePlayPause}
            isPlaying={audioPlayer.isPlaying}
            isAudioLoading={audioPlayer.isLoading}
          />
          <AnimatePresence mode={"wait"}>
            {showDefinition && (
              <Definition
                sentenceDefinition={selectedSentence.translation}
                words={selectedSentence.definitions}
              />
            )}
          </AnimatePresence>
        </div>
      ) : isLoading || isRefetching ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-500">Loading sentences...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 gap-4">
          <p className="text-gray-500">No sentences available</p>

          <Button variant="primary" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}
      {selectedSentence && (
        <div
          className={
            "fixed bottom-large left-0 right-0 mx-auto w-full md:max-w-[600px] xl:max-w-[850px]"
          }
        >
          <SentenceButtons
            skipLabel={showDefinition ? t("wrong") : t("skip")}
            confirmLabel={showDefinition ? t("right") : t("show-answer")}
            onConfirm={showDefinition ? handleRight : handleShowAnswer}
            onSkip={showDefinition ? handleWrong : handleSkip}
          />
        </div>
      )}
    </motion.div>
  );
}

const SentenceButtons = ({
  onSkip,
  onConfirm,
  skipLabel,
  confirmLabel,
}: {
  confirmLabel: string;
  skipLabel: string;
  onSkip: () => void;
  onConfirm: () => void;
}) => {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className={"flex w-full justify-between"}
      style={{ width: "100%" }}
    >
      <Button variant="secondary" onClick={onSkip}>
        {skipLabel}
      </Button>
      <Button variant="primary" onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </motion.div>
  );
};

type SentenceProps = {
  content: string;
  answerDisplayed?: boolean;
  onSkip: () => void;
  onShowAnswer: () => void;
  audioUrl?: string;
  onPlayPauseAudio: () => void;
  isPlaying: boolean;
  isAudioLoading?: boolean;
};

const Sentence: React.FC<SentenceProps> = ({
  content,
  answerDisplayed,
  audioUrl,
  onPlayPauseAudio,
  isPlaying,
  isAudioLoading,
}) => {
  const contentValue = useAnimatedText(content);

  const textVariants = {
    large: {
      fontSize: "1.5rem", // text-3xl
      fontWeight: "400",
      transition: { duration: 0.3, ease: "easeOut" as const },
    },
    small: {
      fontSize: "1rem", // text-lg
      fontWeight: "300",
      transition: { duration: 0.3, ease: "easeOut" as const },
    },
  };

  return (
    <motion.div
      layout={"position"}
      className={"flex flex-col items-center gap-xLarge overflow-auto w-full"}
      style={{ width: "100%" }}
    >
      <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
        <motion.p
          layout={"position"}
          variants={textVariants}
          initial="large"
          animate={answerDisplayed ? "small" : "large"}
          className={
            "max-h-[75dvh] text-center text-text-dark text-pretty flex-1"
          }
          style={{ minWidth: "0" }}
        >
          {contentValue}
        </motion.p>
        {audioUrl && (
          <motion.button
            layout={"position"}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            onClick={onPlayPauseAudio}
            className="flex-shrink-0 p-3 hover:bg-gray-100 rounded-full transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible::ring-2 focus-visible::ring-blue-500"
            aria-label={
              isAudioLoading
                ? "Loading..."
                : isPlaying
                ? "Pause audio"
                : "Play audio"
            }
            disabled={isAudioLoading}
          >
            {isAudioLoading ? (
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            ) : isPlaying ? (
              <PauseIcon size={24} className="text-blue-600" />
            ) : (
              <SpeakerIcon
                size={24}
                className="text-gray-600 hover:text-blue-600"
              />
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

type DefinitionProps = {
  sentenceDefinition: string;
  words: Array<WordDefinition>;
};

type WordDefinition = {
  word: string;
  definition: string;
};

const Definition: React.FC<DefinitionProps> = ({
  sentenceDefinition,
  words,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={"flex flex-col item-center justify-center gap-large w-full"}
    >
      <div
        className={
          "flex flex-col items-center w-full gap-large h-full overflow-scroll"
        }
      >
        <p
          className={
            "text-lg font-medium wrap-pretty md:max-w-[600px] w-full text-center"
          }
        >
          {sentenceDefinition}
        </p>
        <div
          className={
            "flex flex-col w-full gap-small h-full overflow-y-scroll p-xSmall"
          }
        >
          <Accordion spacing="none" defaultOpen={[0]}>
            {words.map((w) => {
              return (
                <AccordionItem key={w.word} title={w.word}>
                  <p>{w.definition}</p>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </motion.div>
  );
};
