import { userSettings } from "@/features/user-settings";
import { generateCardsForUser } from "@/lib/cards/generateCardsForUser";

type RequestBody = {
  languageCode: string;
};
type Params = { userId: string };

/**
 * Updates a user's language preference setting
 * This endpoint creates or updates a user_setting entry related to practice_language
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const { userId } = await params;

    // Parse and validate request body
    const body = await req.json();
    const { languageCode } = body as Partial<RequestBody>;

    // Validate the language code
    const validation = userSettings.validateLanguageCode(languageCode);
    if (!validation.success) {
      return new Response(
        JSON.stringify({
          data: null,
          error: "invalid-request",
          details: validation.error.format(),
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // At this point languageCode is validated and not undefined
    const validatedLanguageCode = validation.data.languageCode;

    // Verify user exists
    const user = await userSettings.getUserById(userId);
    const userNativeLanguage = user?.nativeLanguage;

    if (userNativeLanguage?.toLowerCase() === languageCode) {
      return new Response(
        JSON.stringify({
          data: null,
          error: "languages-are-the-same",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!user) {
      return new Response(
        JSON.stringify({ data: null, error: "user-not-found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Update the language preference
    const result = await userSettings.updateLanguagePreference(
      userId,
      validatedLanguageCode
    );

    // generate cards for new language
    generateCardsForUser(userId, validatedLanguageCode, userNativeLanguage);

    return new Response(
      JSON.stringify({
        data: result,
        error: null,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error updating language preference:", error);

    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ data: null, error: error.message }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ data: null, error: "internal-server-error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

/**
 * Retrieves a user's current language preference setting
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const { userId } = await params;

    // Verify user exists
    const user = await userSettings.getUserById(userId);

    if (!user) {
      return new Response(
        JSON.stringify({ data: null, error: "user-not-found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Get the language preference
    const result = await userSettings.getLanguagePreference(userId);

    return new Response(
      JSON.stringify({
        data: result,
        error: null,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error retrieving language preference:", error);

    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ data: null, error: error.message }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ data: null, error: "internal-server-error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
