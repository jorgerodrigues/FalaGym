import React from "react";
import { CardSelect } from "../../../components/CardSelect";

type LanguageSelectorArgs = {
  titleContent: string | React.ReactElement;
  possibleLanguages: Array<{ id: string; content: string }>;
  onSelectLanguage: (lanCode: string) => void;
  selectedLanguage: string;
  error?: string;
};

export const LanguageSelector: React.FC<LanguageSelectorArgs> = ({
  titleContent,
  possibleLanguages,
  onSelectLanguage,
  selectedLanguage,
  error,
}) => {
  // Transform possibleLanguages into the format expected by CardSelect
  const cardSelectOptions = possibleLanguages.map((language) => ({
    id: language.id,
    content: language.content,
  }));

  return (
    <div className="w-full flex flex-col items-center md:w-[30%] px-small">
      <div className="py-large text-center">
        {typeof titleContent === "string" ? (
          <h1 className="text-large">{titleContent}</h1>
        ) : (
          titleContent
        )}
      </div>

      {error && (
        <p className="py-large" style={{ color: "red" }} aria-live="assertive">
          {error}
        </p>
      )}
      <CardSelect
        options={cardSelectOptions}
        onSelect={onSelectLanguage}
        selectedId={selectedLanguage}
        className="max-w-lg w-full"
        size="lg"
        columns={1}
      />
    </div>
  );
};
