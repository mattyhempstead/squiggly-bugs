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

export const findBugs = async (documentText: string): Promise<BugRange[]> => {
  const lines = documentText.split('\n');
  const formattedText = lines
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
- Silly mistakes
- Spelling mistakes

Do not flag style issues or minor suggestions.

Please analyze this code and find all potential bugs.
Return an array of line ranges where bugs are found.

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
    schemaOutput: z.object({
    bugRanges: z.array(z.object({
      description: z.string().describe(`
A description of the bug, formatted as plain text.
Do not refer to specific line numbers as they are an unreliable reference point.

Format it like (replace the {} with the actual values):
<EXAMPLE>
{a short title}

{a single sentence with details}
</EXAMPLE>

You must include the empty line between the title and description.
      `),
      startLineNumber: z.number(),
        endLineNumber: z.number(),
      }))
    })
  });

  console.log(response);

  return response.bugRanges.map(range => ({
    ...range,
    startColumnNumber: 0,
    endColumnNumber: lines[range.endLineNumber - 1]?.length ?? 0
  }));
};
