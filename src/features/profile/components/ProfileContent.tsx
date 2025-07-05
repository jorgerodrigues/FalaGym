"use client";

import { Button } from "@/components/Button";
import { useEffect, useState } from "react";
import { PersonIcon } from "@/icons/Person";
import { CardSelect } from "@/components/CardSelect";
import { TextInput } from "@/components/TextInput";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetcher } from "@/lib/api/apiFetcher";
import { useUser } from "@/providers/LoggedUserProvider";

export type LanguagePreferenceMutationVars = {
  languageCode: string;
};

export type LanguagePreferenceQueryData = {
  data: {
    userId: string;
    languageCode: string;
    updatedAt: string;
  };
  error: string | null;
};

export const ProfileContent = () => {
  const [language, setLanguage] = useState<string>();
  const [firstName, setFirstName] = useState<string | null | undefined>();
  const [lastName, setLastName] = useState<string | null | undefined>();
  const [email, setEmail] = useState<string | null | undefined>();
  const { user, loading } = useUser();

  const userId = user?.id;

  const { data: languageToPractice, isSuccess } = useQuery({
    enabled: Boolean(userId),
    queryKey: ["userPreference", userId],
    queryFn: async () =>
      await apiFetcher<LanguagePreferenceQueryData>(
        `/api/user/${userId}/language-preference`
      ),
  });

  const { mutate: updateLanguageToLearn, isPending: isSaving } = useMutation<
    unknown,
    Error,
    LanguagePreferenceMutationVars
  >({
    mutationFn: async (vars) =>
      await apiFetcher(`/api/user/${userId}/language-preference`, {
        method: "PUT",
        body: JSON.stringify({
          languageCode: vars.languageCode,
        }),
      }),
  });

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (languageToPractice?.data && isSuccess) {
      setLanguage(languageToPractice.data.languageCode);
    }
  }, [isSuccess, languageToPractice]);

  const handleUpdateLanguage = (languageCode: string) => {
    if (languageCode === "") {
      return;
    }
    try {
      setLanguage(languageCode);
      updateLanguageToLearn({ languageCode });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div>loading</div>;
  }

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto gap-large">
      <div className="flex flex-col items-center justify-center gap-xSmall w-full text-center">
        <div className="flex items-center justify-center rounded-xl overflow-hidden border-control-secondary">
          <div className="w-full h-full flex items-center justify-center rounded-xl">
            <PersonIcon size={64} />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold mt-4">{`${firstName} ${lastName}`}</h1>
          <p className="text-text-light">{email}</p>
        </div>
      </div>

      <div className="flex flex-col w-full gap-large">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="flex flex-col gap-small">
          <TextInput
            label="First Name"
            type="text"
            placeholder="Your first name"
            defaultValue={firstName ?? ""}
            disabled
          />
          <TextInput
            label="Last Name"
            type="text"
            placeholder="Your last name"
            defaultValue={lastName ?? ""}
            disabled
          />
          <TextInput label="Email" type="email" value={email ?? ""} disabled />
        </div>
      </div>

      <div className="w-full flex flex-col gap-small">
        <div>
          <h2 className="text-xl font-semibold">Language to practice</h2>
          <p className="text-sm text-text-light">
            Select the language you want to practice now. You can change at any
            point and your progress is always saved.
          </p>
        </div>

        <div className="flex gap-small">
          <CardSelect
            columns={2}
            options={[
              { id: "da", content: "🇩🇰 Danish" },
              { id: "en", content: "🇬🇧 English" },
              { id: "it", content: "🇮🇹 Italian" },
              { id: "es", content: "🇪🇸 Spanish" },
              { id: "pt", content: "🇧🇷 Portuguese" },
            ]}
            onSelect={(id) => setLanguage(id)}
            selectedId={language}
          />
        </div>
        <div className="mt-6">
          <Button
            variant="primary"
            onClick={() => handleUpdateLanguage(language ?? "")}
            isLoading={isSaving}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
