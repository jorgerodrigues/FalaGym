import { storage } from "./storageBucket";

export type SignedUrlAction = "read" | "write" | "delete";

export const generateSignedStorageUrl = async (options: {
  bucketIdentifier: string;
  fileName: string;
  action: SignedUrlAction;
}): Promise<string> => {
  const { bucketIdentifier, fileName, action } = options;
  if (!bucketIdentifier) {
    throw new Error("Invalid bucket identifier provided.");
  }
  const bucketName = bucketIdentifier;
  const config = {
    version: "v4" as const,
    action,
    expires: Date.now() + 5 * 60 * 1000, // 5 minutes
  };

  const bucket = storage().bucket(bucketName);

  const [url] = await bucket.file(fileName).getSignedUrl(config);
  return url;
};

export const uploadFileToBucket = async (options: {
  source: Buffer;
  bucketName: string;
  fileName: string;
  contentType?: string;
}) => {
  const { source, bucketName, fileName, contentType } = options;

  const encodedFileName = encodeURIComponent(fileName);

  try {
    const url = await generateSignedStorageUrl({
      bucketIdentifier: bucketName,
      fileName: encodedFileName,
      action: "write",
    });

    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": contentType ?? "application/octet-stream" },
      body: source,
    });
    if (!res.ok)
      throw new Error(`Upload failed: ${res.status} ${res.statusText}`);

    const readUrl = await generateSignedStorageUrl({
      bucketIdentifier: bucketName,
      fileName: encodedFileName,
      action: "read",
    });

    return { success: true, data: { url: readUrl } };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Upload failed",
    };
  }
};
