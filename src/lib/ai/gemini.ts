import "server-only";
import { GoogleGenAI } from "@google/genai";
import {
  SUGGESTION_RESPONSE_SCHEMA,
  buildSuggestionPrompt,
  type SuggestionInput,
} from "./suggestion";

const MODEL = "gemini-3.5-flash";
const TIMEOUT_MS = 10_000;

// E2E(AI_MOCK=1)용 고정 응답 — 액션·파서는 실코드 경로를 그대로 지난다
const MOCK_RESPONSE = JSON.stringify({
  suggested_type: "no_concept",
  suggested_subtype: "distorted_theorem",
  reason: "이등변삼각형의 성질을 거꾸로 적용한 것으로 보여요",
});

/** 응답 원문 텍스트만 반환 — 파싱·검증은 parseSuggestionResponse 담당 */
export async function requestSuggestion(
  input: SuggestionInput,
): Promise<string> {
  if (process.env.AI_MOCK === "1") {
    return MOCK_RESPONSE;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: buildSuggestionPrompt(input),
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: SUGGESTION_RESPONSE_SCHEMA,
      abortSignal: AbortSignal.timeout(TIMEOUT_MS),
    },
  });
  return response.text ?? "";
}
