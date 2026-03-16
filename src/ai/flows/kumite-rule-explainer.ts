'use server';
/**
 * @fileOverview An AI agent that answers natural language questions about WKF kumite rules.
 *
 * - kumiteRuleExplainer - A function that handles the kumite rule explanation process.
 * - KumiteRuleExplainerInput - The input type for the kumiteRuleExplainer function.
 * - KumiteRuleExplainerOutput - The return type for the kumiteRuleExplainer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Schema for the input of the kumiteRuleExplainer function.
 * Represents a natural language question about WKF kumite rules or point-awarding scenarios.
 */
const KumiteRuleExplainerInputSchema = z.object({
  question: z.string().describe('The natural language question about WKF kumite rules or point-awarding scenarios.'),
});
export type KumiteRuleExplainerInput = z.infer<typeof KumiteRuleExplainerInputSchema>;

/**
 * Schema for the output of the kumiteRuleExplainer function.
 * Represents a clear and concise explanation of the WKF kumite rule or scenario.
 */
const KumiteRuleExplainerOutputSchema = z.object({
  explanation: z.string().describe('A clear and concise explanation of the WKF kumite rule or scenario.'),
});
export type KumiteRuleExplainerOutput = z.infer<typeof KumiteRuleExplainerOutputSchema>;

/**
 * Answers natural language questions about WKF kumite rules or specific point-awarding scenarios
 * based on official WKF guidelines.
 *
 * @param input - The input containing the natural language question.
 * @returns A promise that resolves to an object containing the AI's explanation.
 */
export async function kumiteRuleExplainer(input: KumiteRuleExplainerInput): Promise<KumiteRuleExplainerOutput> {
  return kumiteRuleExplainerFlow(input);
}

/**
 * Defines the Genkit prompt for the kumite rule explainer.
 * Instructs the AI to act as an expert kumite judge and coach, providing WKF-compliant explanations.
 */
const kumiteRuleExplainerPrompt = ai.definePrompt({
  name: 'kumiteRuleExplainerPrompt',
  input: {schema: KumiteRuleExplainerInputSchema},
  output: {schema: KumiteRuleExplainerOutputSchema},
  prompt: `You are an expert kumite judge and coach, deeply knowledgeable in the official World Karate Federation (WKF) Kumite Rules.
Your task is to provide clear, concise, and accurate explanations to natural language questions about WKF kumite rules or specific point-awarding scenarios.
Always base your answers strictly on the official WKF guidelines. If a question is outside the scope of WKF kumite rules, politely state that you can only answer questions related to WKF rules.

Question: {{{question}}}

Provide your explanation in the 'explanation' field.`,
});

/**
 * Defines the Genkit flow for the kumite rule explainer.
 * This flow orchestrates the call to the AI prompt to get rule explanations.
 */
const kumiteRuleExplainerFlow = ai.defineFlow(
  {
    name: 'kumiteRuleExplainerFlow',
    inputSchema: KumiteRuleExplainerInputSchema,
    outputSchema: KumiteRuleExplainerOutputSchema,
  },
  async (input) => {
    const {output} = await kumiteRuleExplainerPrompt(input);
    if (!output) {
      throw new Error('Failed to get an explanation from the AI model.');
    }
    return output;
  }
);
