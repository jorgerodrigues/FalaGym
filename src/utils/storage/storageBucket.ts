import { Storage } from "@google-cloud/storage";

export const storage = () => {
  const credentials = JSON.parse(
    Buffer.from(process.env.GCP_BUCKET_KEY as string, "base64").toString()
  );
  return new Storage({
    projectId: credentials?.project_id ?? "",
    credentials: {
      type: process.env.GCP_TYPE,
      private_key: credentials?.private_key ?? "",
      client_email: credentials?.client_email ?? "",
      client_id: credentials?.client_id ?? "",
    },
  });
};
