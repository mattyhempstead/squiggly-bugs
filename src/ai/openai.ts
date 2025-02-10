import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod.js";
import { type ChatCompletionMessageParam } from "openai/resources/index.js";
import { type z } from "zod";
import { env } from "../env";

export const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const getAIChatStructuredResponse = async <T extends z.ZodType>({
  model = "gpt-4o",
  messages,
  schemaOutput,
}: {
  model?: "gpt-4o" | "gpt-4o-mini";
  messages: ChatCompletionMessageParam[];
  schemaOutput: T;
}): Promise<z.infer<T>> => {
  const response = await client.beta.chat.completions.parse({
    model,
    messages: messages,
    response_format: zodResponseFormat(schemaOutput, "response"),
  });

  const message = response.choices[0]?.message;

  if (!message?.parsed) {
    const errorMessage = message?.refusal ?? "Failed to get AI response";
    throw new Error(errorMessage);
  }

  return message.parsed;
};
