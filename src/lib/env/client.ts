import * as z from "zod";
import { clientSchema } from "./schema";

// NEXT_PUBLIC_ で始まる環境変数のみを抽出
const extractPublicVariables = (env: NodeJS.ProcessEnv) => {
  return Object.entries(env).reduce((acc, [key, value]) => {
    if (key.startsWith("NEXT_PUBLIC_")) {
      acc[key] = value || "";
    }
    return acc;
  }, {} as Record<string, string>);
};

export const clientEnv = (() => {
  const isProd = process.env.NODE_ENV === "production";
  const publicVars = extractPublicVariables(process.env);

  try {
    return clientSchema.parse(publicVars);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Invalid client environment variables:", error.errors);

      if (!isProd) {
        throw new Error("Client environment variables validation failed");
      }

      console.warn(
        "Using fallback values for missing client environment variables"
      );
      return publicVars;
    }
    throw error;
  }
})();
