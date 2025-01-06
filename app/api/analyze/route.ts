import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function cleanTranscript(text: string): string {
  if (!text) return "";

  // First, normalize spaces and remove extra whitespace
  let cleanText = text.trim().replace(/\s+/g, " ");

  // Split into sentences for better processing
  const sentences = cleanText
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Process each sentence to remove duplicates
  const processedSentences = sentences.reduce(
    (acc: string[], sentence: string) => {
      // Skip if this sentence is too similar to the previous one
      if (acc.length > 0 && acc[acc.length - 1].includes(sentence)) {
        return acc;
      }

      // Clean up the sentence
      const words = sentence.split(" ");
      const cleanWords = [];
      let prevWord = "";
      let repeatCount = 0;

      for (const word of words) {
        if (word.toLowerCase() === prevWord.toLowerCase()) {
          repeatCount++;
          if (repeatCount <= 2) {
            // Allow up to 2 repetitions
            cleanWords.push(word);
          }
        } else {
          repeatCount = 0;
          cleanWords.push(word);
          prevWord = word;
        }
      }

      acc.push(cleanWords.join(" "));
      return acc;
    },
    []
  );

  // Join sentences back together
  cleanText = processedSentences.join(". ") + ".";

  // Truncate if still too long
  if (cleanText.length > 15000) {
    cleanText = cleanText.slice(0, 15000) + "...";
  }

  return cleanText;
}

export async function POST(req: Request) {
  try {
    const { transcription } = await req.json();

    console.log("--- Incoming Transcription ---");
    console.log("Original length:", transcription?.length);
    console.log("Original text:", transcription);

    if (!transcription || transcription.trim().length === 0) {
      console.log("Empty transcription received");
      return NextResponse.json(
        {
          error: "Empty transcription",
          keyPoints: [],
          actionItems: [],
          decisions: [],
          summary: "No transcription provided.",
        },
        { status: 400 }
      );
    }

    // Clean and deduplicate the transcription
    const processedTranscription = cleanTranscript(transcription);

    console.log("--- Cleaned Transcription ---");
    console.log("Cleaned length:", processedTranscription.length);
    console.log("Cleaned text:", processedTranscription);

    // Process transcription with AI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI meeting assistant. Analyze the following meeting transcription and extract the key information. Focus on identifying:
1. Key discussion points
2. Action items with assignees and deadlines if mentioned
3. Important decisions made
4. Numbers, metrics, and statistics mentioned
5. Problems and proposed solutions

Return your analysis in this JSON format:
{
  "keyPoints": ["point1", "point2"],
  "actionItems": [
    {
      "text": "action description",
      "assignee": "person name or null",
      "deadline": "date or null"
    }
  ],
  "decisions": ["decision1", "decision2"],
  "summary": "comprehensive meeting summary including metrics and key outcomes"
}`,
        },
        {
          role: "user",
          content: processedTranscription,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    console.log("--- AI Processing Complete ---");

    let analysis;
    try {
      let responseText = completion.choices[0].message.content.trim();
      analysis = JSON.parse(responseText);

      console.log("--- Analysis Result ---");
      console.log(JSON.stringify(analysis, null, 2));

      if (
        analysis.keyPoints.length === 0 &&
        analysis.actionItems.length === 0
      ) {
        console.log("Warning: Empty analysis results");
      }
    } catch (error) {
      console.error("--- JSON Parse Error ---");
      console.error("Error details:", error);

      analysis = {
        keyPoints: ["Meeting analysis unavailable"],
        actionItems: [],
        decisions: [],
        summary:
          "The meeting contained discussion and action items that need to be reviewed.",
      };
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("--- API Error ---");
    console.error("Error details:", error);

    return NextResponse.json(
      {
        error: "Failed to analyze meeting",
        keyPoints: [],
        actionItems: [],
        decisions: [],
        summary: "Failed to analyze meeting.",
      },
      { status: 500 }
    );
  }
}
