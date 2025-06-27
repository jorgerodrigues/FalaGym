"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useAnimatedText } from "@/hooks/useAnimatedText";
import { apiFetcher } from "@/lib/api/apiFetcher";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card as CardType } from "@/features/card/types";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/providers/LoggedUserProvider";
import { useTranslations } from "next-intl";
import colors from "tailwindcss/colors";

export default function Page() {
  const [showDefinition, setShowDefinition] = useState(false);
  const [selectedSentenceIdx, setSelectedSentenceIdx] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const { user, setFullPageLoading } = useUser();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["cards", user.id],
    queryFn: () =>
      apiFetcher<Array<CardType>>(`api/card/types/sentence/${user.id}`),
    enabled: Boolean(user.id),
  });

  const { mutate: logCard } = useMutation({
    mutationFn: (r: number) =>
      apiFetcher(`api/card/${selectedCardId}/review`, {
        method: "POST",
        body: JSON.stringify({
          rating: r,
        }),
      }),
  });

  useEffect(() => {
    // Only run this effect when data is available and not empty
    if (data && data.length > 0) {
      const cardInfo = data[selectedSentenceIdx];
      if (cardInfo) {
        setSelectedCardId(cardInfo.id);
      }
    }
  }, [data, selectedSentenceIdx]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setFullPageLoading?.(isLoading);
  }, [isLoading, setFullPageLoading]);

  const selectedSentence = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }

    if (selectedSentenceIdx < 0) {
      return null;
    }

    const rawData = !data?.[selectedSentenceIdx]
      ? data?.[0]
      : data?.[selectedSentenceIdx];

    return {
      id: rawData.id,
      sentence: rawData.front,
      translation: rawData.back,
      definitions: rawData?.sentence?.words?.map((word) => ({
        id: word.id,
        word: word.word,
        definition: word.definition,
      })),
    };
  }, [data, selectedSentenceIdx]);

  const handleNextSentence = async () => {
    if (!data?.length) return;

    if (selectedSentenceIdx < data?.length - 1) {
      setSelectedSentenceIdx((prev) => prev + 1);
    }

    if (selectedSentenceIdx === data?.length - 1) {
      await refetch();
      setSelectedSentenceIdx(0);
    }

    setShowDefinition(false);
    return;
  };

  const handleSkip = () => {
    handleNextSentence();
  };

  const handleShowAnswer = () => {
    setShowDefinition(true);
  };

  const handleWrong = () => {
    logCard(0);
    handleNextSentence();
    return;
  };

  const handleRight = () => {
    logCard(5);
    handleNextSentence();
  };

  return (
    <motion.div
      className={`flex flex-col w-full items-center justify-center h-full md:min-h-[80vh] p-small lg:p-large`}
      layout={"position"}
    >
      {selectedSentence && (
        <div
          key={selectedSentence.id ?? "loading"}
          className={
            "flex flex-col md:max-w-[600px] xl:max-w-[850px] gap-xLarge w-full py-large"
          }
          style={{ width: "100%" }}
        >
          <Sentence
            content={selectedSentence?.sentence ?? ""}
            onSkip={handleSkip}
            onShowAnswer={handleShowAnswer}
            answerDisplayed={showDefinition}
          />
          <AnimatePresence mode={"wait"}>
            {showDefinition && (
              <Definition
                onWrong={handleWrong}
                onRight={handleRight}
                sentenceDefinition={selectedSentence?.translation ?? ""}
                words={selectedSentence?.definitions ?? []}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

type SentenceProps = {
  content: string;
  answerDisplayed?: boolean;
  onSkip: () => void;
  onShowAnswer: () => void;
};

const Sentence: React.FC<SentenceProps> = ({
  content,
  onSkip,
  onShowAnswer,
  answerDisplayed,
}) => {
  const contentValue = useAnimatedText(content);
  const t = useTranslations("sentence");

  const textVariants = {
    large: {
      fontSize: "1.5rem", // text-3xl
      fontWeight: "400",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    small: {
      fontSize: "1rem", // text-lg
      fontWeight: "300",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  return (
    <motion.div
      layout={"position"}
      className={"flex flex-col items-center gap-xLarge overflow-auto w-full"}
      style={{ width: "100%" }}
    >
      <motion.p
        layout={"position"}
        variants={textVariants}
        initial="large"
        animate={answerDisplayed ? "small" : "large"}
        className={
          "w-full max-h-[75dvh] text-center text-text-dark text-pretty"
        }
        style={{ width: "100%", minWidth: "100%" }}
      >
        {contentValue}
      </motion.p>
      {!answerDisplayed && (
        <motion.div
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className={"flex w-full justify-between"}
          style={{ width: "100%" }}
        >
          <Button variant="secondary" onClick={onSkip}>
            {t("skip")}
          </Button>
          <Button variant="primary" onClick={onShowAnswer}>
            {t("show-answer")}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

type DefinitionProps = {
  sentenceDefinition: string;
  words: Array<WordDefinition>;
  onWrong: () => void;
  onRight: () => void;
};

type WordDefinition = {
  word: string;
  definition: string;
};

const Definition: React.FC<DefinitionProps> = ({
  sentenceDefinition,
  words,
  onWrong,
  onRight,
}) => {
  const t = useTranslations("sentence");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={"flex flex-col item-center justify-center gap-large w-full"}
    >
      <Card
        className={
          "flex items-center w-full gap-large max-h-[50dvh] md:max-h-[90dvh]"
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
          className={"flex flex-col w-full gap-small h-full overflow-y-scroll"}
        >
          {words.map((w) => {
            return (
              <div key={w.word} className={"flex flex-col"}>
                <p className={"font-medium capitalize"}>{w.word}: </p>
                <p>{w.definition}</p>
              </div>
            );
          })}
        </div>
      </Card>
      <div className={"flex w-full justify-between"}>
        <Button variant="secondary" onClick={onWrong}>
          {t("wrong")}
        </Button>
        <Button variant="primary" onClick={onRight}>
          {t("right")}
        </Button>
      </div>
    </motion.div>
  );
};
