import * as z from "zod";

const envSchema = z.object({
  DIFY_API_KEY: z.string().nonempty("DIFY_API_KEY is required"),
  DIFY_API_ENDPOINT: z.string().nonempty("DIFY_API_ENDPOINT is required"),
  GEMINI_API_KEY: z.string().nonempty("GEMINI_API_KEY is required"),
});

export const serverEnv = (() => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Invalid server environment variables:", error.errors);
    } else {
      console.error("Unknown error during environment validation:", error);
    }
    throw new Error("Server environment variables validation failed");
  }
})();
