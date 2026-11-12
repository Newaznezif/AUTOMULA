export type FormFieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "file"
  | "custom"
  | "unknown";

export type AnswerConfidence = "high" | "medium" | "low" | "unsupported";

export interface DetectedFormOption {
  label: string;
  value: string;
}

export interface DetectedFormField {
  fieldId: string;
  question: string;
  fieldType: FormFieldType;
  required: boolean;
  options: DetectedFormOption[];
  hasExistingValue: boolean;
  maxLength?: number;
  sectionContext?: string;
}

export interface DetectedForm {
  title: string;
  pageOrigin: string;
  fields: DetectedFormField[];
  detectedAt: string;
}

export interface AnswerSuggestion {
  fieldId: string;
  answer: string | string[] | boolean | null;
  confidence: AnswerConfidence;
  sourceIds: string[];
  reasoningSummary: string;
  needsReview: boolean;
}

export interface ApprovedFieldValue {
  fieldId: string;
  value: string | string[] | boolean;
  approvedAt: string;
}

export interface FillResult {
  fieldId: string;
  status: "filled" | "skipped" | "failed";
  message?: string;
}
