import * as z from "zod";

const envSchema = z.object({
  DIFY_API_KEY: z.string().nonempty("DIFY_API_KEY is required"),
  DIFY_API_ENDPOINT: z.string().nonempty("DIFY_API_ENDPOINT is required"),
  GEMINI_API_KEY: z.string().nonempty("GEMINI_API_KEY is required"),
});

export const serverEnv = (() => {
  const isProd = process.env.NODE_ENV === "production";

  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Invalid server environment variables:", error.errors);

      if (!isProd) {
        throw new Error("Server environment variables validation failed");
      }

      console.warn("Using fallback values for missing environment variables");
      return {
        DIFY_API_KEY: process.env.DIFY_API_KEY || "",
        DIFY_API_ENDPOINT:
          process.env.DIFY_API_ENDPOINT || "https://api.dify.ai/v1",
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
      };
    }
    throw error;
  }
})();
