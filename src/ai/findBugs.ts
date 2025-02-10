import type { ChatCompletionMessageParam } from "openai/resources/index.js";
import { z } from "zod";
import { getAIChatStructuredResponse } from "./openai";

export type BugRange = {
  description: string;
  startLineNumber: number;
  startColumnNumber: number;
  endLineNumber: number;
  endColumnNumber: number;
};

const bugRangeSchema = z.object({
  bugRanges: z.array(z.object({
    description: z.string(),
    startLineNumber: z.number(),
    startColumnNumber: z.number(),
    endLineNumber: z.number(),
    endColumnNumber: z.number(),
  }))
});

export const findBugs = async (documentText: string): Promise<BugRange[]> => {
  const formattedText = documentText.split('\n')
    .map((line, index) => `${index + 1}: ${line}`)
    .join('\n');

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system", 
      content: `\
You are a code analysis tool that finds potential bugs in code.

The code is provided with line numbers at the start like:
<EXAMPLE_CODE_FILE_CONTENT>
1. x = 5
2. y = 10
3. z = x + y
</EXAMPLE_CODE_FILE_CONTENT>

You should analyze the code carefully and return precise line ranges where bugs are found.

Focus on actual bugs like:
- Null/undefined errors
- Type mismatches  
- Logic errors
- Off-by-one errors
- Memory leaks
- Race conditions
Do not flag style issues or minor suggestions.

Please analyze this code and find all potential bugs.
Return an array of line and column ranges where bugs are found.

Code to analyze:
<CODE_FILE_CONTENT>
${formattedText}
</CODE_FILE_CONTENT>
`
    }
  ];

  console.log(messages);

  const response = await getAIChatStructuredResponse({
    messages,
    schemaOutput: bugRangeSchema,
  });

  console.log(response);

  return response.bugRanges;
};
