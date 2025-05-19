export interface AngleSpec {
  /** Human‑readable label, e.g. "front", "back‑right‑¾" */
  label: string;
  /** System instruction, passed verbatim into the system prompt */
  prompt: string;
}

export interface FrameResult {
  filePath: string;      // absolute path to the PNG frame on disk
  matched: boolean;      // did the model say it matches?
  explanation?: string;  // model's short rationale (optional)
} 