'use server';
/**
 * @fileOverview AI-powered suggestion flow for generating new todos, plans, or story ideas.
 *
 * - suggestNewEntries - A function that generates suggestions based on existing entries.
 * - SuggestNewEntriesInput - The input type for the suggestNewEntries function.
 * - SuggestNewEntriesOutput - The return type for the suggestNewEntries function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNewEntriesInputSchema = z.object({
  existingEntries: z
    .string()
    .describe(
      'A string containing all existing entries (todos, plans, stories) the user has made.'
    ),
  type: z
    .enum(['todo', 'plan', 'story'])
    .describe('The type of entry to generate suggestions for.'),
});
export type SuggestNewEntriesInput = z.infer<typeof SuggestNewEntriesInputSchema>;

const SuggestNewEntriesOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested new entries based on existing entries.'),
});
export type SuggestNewEntriesOutput = z.infer<typeof SuggestNewEntriesOutputSchema>;

export async function suggestNewEntries(input: SuggestNewEntriesInput): Promise<SuggestNewEntriesOutput> {
  return suggestNewEntriesFlow(input);
}

const suggestNewEntriesPrompt = ai.definePrompt({
  name: 'suggestNewEntriesPrompt',
  input: {schema: SuggestNewEntriesInputSchema},
  output: {schema: SuggestNewEntriesOutputSchema},
  prompt: `You are an AI assistant helping a user expand their life management system.

  The user has provided their existing entries of type "{{{type}}}".
  Based on these entries, suggest 3 new entries of the same type that the user might find useful or interesting.
  Be creative and diverse in your suggestions.

  Existing Entries:
  {{{existingEntries}}}

  Suggestions:
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const suggestNewEntriesFlow = ai.defineFlow(
  {
    name: 'suggestNewEntriesFlow',
    inputSchema: SuggestNewEntriesInputSchema,
    outputSchema: SuggestNewEntriesOutputSchema,
  },
  async input => {
    const {output} = await suggestNewEntriesPrompt(input);
    return output!;
  }
);
