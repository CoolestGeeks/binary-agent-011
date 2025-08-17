
export const GEMINI_PROMPT_TEMPLATE = `
You are the showrunner for a binary-art web agent. The agent acts as a guide, moving around a canvas to present and explain concepts using binary art symbols.
When the user asks a question, produce a JSON response that defines:
1) A short voice explanation (SSML) suitable for text-to-speech.
2) A timed storyboard of scenes where the agent and symbols move and appear on a 2D canvas.

THE CANVAS:
- A 2D space. The top-left corner is {x:0, y:0}. The bottom-right is {x:100, y:100}.
- The agent and symbols are positioned based on the center of their art. For example, {x:50, y:50} is the exact center of the screen.

RETURN EXACTLY THIS JSON (no extra text, no markdown):

{
  "narration_ssml": "<speak>...</speak>",
  "voice_hint": { "language": "en", "style": "friendly", "rate": 0.98, "pitch": 0 },
  "scenes": [
    {
      "duration_ms": 1200,
      "agent_action": "wave",
      "agent_position": {"x": 50, "y": 50},
      "caption": "Hello!"
    },
    {
      "duration_ms": 4000,
      "agent_action": "idle",
      "agent_position": {"x": 25, "y": 50},
      "symbol_art": "0000011111100000\\n0001111111111100\\n0011111111111110\\n0111011111101110\\n0110001111100110\\n1110000111000111\\n1110000111000111\\n1111000110001111\\n0111101101011110\\n0111111111111110\\n0011111111111110\\n0001111111111100\\n0000011111100000\\n0000000000000000\\n0000000000000000\\n0000000000000000",
      "symbol_position": {"x": 65, "y": 50},
      "caption": "Let's look at this!"
    }
  ]
}

CONSTRAINTS FOR "narration_ssml":
- English, ≤ 90 words total, clear and beginner-friendly.
- Use SSML <speak> ... </speak>. No <break> longer than 400ms.
- No lists or markdown. Plain sentences only.

CONSTRAINTS FOR "scenes":
- 3–6 total scenes. Total duration 8–15 seconds.
- Each scene must include: "duration_ms", "agent_action" (one of ["idle","wave","blink"]), and "agent_position" (a JSON object with "x" and "y" from 0-100).
- Scenes can optionally include "symbol_art" and a "symbol_position". When a symbol is shown, the agent should move to a different position to "present" it, not overlap it.
- "symbol_art" MUST be a 16x16 grid of '0's and '1's, formatted as a single JSON string with '\\n' for newlines. Each of the 16 lines must have exactly 16 characters.
- Optional: "caption" (≤ 40 chars, plain text).
- Visual flow:
    1) Start with just the agent, usually waving or idle in the center.
    2) Move the agent to the side and introduce a "symbol_art" to visually represent the narration.
    3) You can have multiple symbol scenes, with the agent moving to present each one.
    4) End with just the agent on screen.

STYLE & AESTHETICS:
- The agent is like a video game character (e.g., Mario) guiding the user through a level. Its movement should be logical.
- Be creative with the binary art to visually represent the core idea of the narration.
- No emojis or markdown anywhere in the JSON.

USER QUESTION:
"<INSERT USER QUESTION HERE>"
`;

const USER_ROBOT_ART = `
00000000000000000000000000000000000000000000000000000000000000000000000000000000
00000000000000000111111111111111111111111111111111111111111100000000000000000000
00000000000000000111111111111111111111111111111111111111111111000000000000000000
0000000000000001111000000000000000000000000000000000000001111000000000000000000
0000000000000001111000111111000000000000000000000111111000111100000000000000000
0000000000000001111001111111100000000000000000001111111100111100000000000000000
0000000000000001111001111111100000000000000000001111111100111100000000000000000
0000000000000001111000111111000000000000000000000111111000111100000000000000000
0000000000000001111000000000000000000000000000000000000000111100000000000000000
0000000000000001111000000000000011111111111111100000000000111100000000000000000
0000000000000001111000000000000001111111111111000000000000111100000000000000000
0000000000000001111111111111111111111111111111111111111111111110000000000000000
0000000000000000011111111111111111111111111111111111111111111100000000000000000
0000000000000000000000000011111111111111111111111111111000000000000000000000000
0000000000000000000000001111111111111111111111111111111110000000000000000000000
0000000000000000000000011111111111111111111111111111111111100000000000000000000
0000000000000000000000000111111111111111111111111111111100000000000000000000000
0000000000000000000000000000111111111111111111111111110000000000000000000000000
00000000000000000000000000000000000000000000000000000000000000000000000000000000
`.trim();

const createBlinkFrame = (baseArt: string): string => {
  const lines = baseArt.trim().split('\n');

  // Bounding boxes for both eyes, adjusted for the new art dimensions
  const eyeBoxes = [
    { top: 4, bottom: 8, left: 16, right: 24, blinkRow: 6 }, // Left eye (on screen)
    { top: 4, bottom: 8, left: 55, right: 63, blinkRow: 6 }, // Right eye (on screen)
  ];

  let newLines = [...lines];

  for (const eye of eyeBoxes) {
      // Erase the eye region by setting '1's to '0's
      for (let r = eye.top; r <= eye.bottom; r++) {
          if (newLines[r]) {
              const chars = newLines[r].split('');
              for (let c = eye.left; c <= eye.right; c++) {
                  if (chars[c] === '1') {
                      chars[c] = '0';
                  }
              }
              newLines[r] = chars.join('');
          }
      }

      // Draw a horizontal line for the closed eye
      if (newLines[eye.blinkRow]) {
          const blinkChars = newLines[eye.blinkRow].split('');
          for (let c = eye.left + 2; c <= eye.right - 2; c++) {
              blinkChars[c] = '1';
          }
          newLines[eye.blinkRow] = blinkChars.join('');
      }
  }

  return newLines.join('\n');
};

const USER_ROBOT_ART_BLINK = createBlinkFrame(USER_ROBOT_ART);

// Create a 10-frame idle loop with one blink at the end
const idleFrames = Array(9).fill(USER_ROBOT_ART);
idleFrames.push(USER_ROBOT_ART_BLINK);


export const AGENT_ART = {
  idle: idleFrames,
  blink: [USER_ROBOT_ART_BLINK],
  wave: [USER_ROBOT_ART],
};
