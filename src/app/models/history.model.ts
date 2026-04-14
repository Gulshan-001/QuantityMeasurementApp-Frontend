// ═══════════════════════════════════════════════════════════
// history.model.ts — History Item Model
// Matches the actual backend API response shape:
// { id, operationType, operationCode, inputType, outputType,
//   inputData, resultData, isSuccess, errorMessage, createdAt }
// ═══════════════════════════════════════════════════════════

export interface HistoryItem {
  id?:            number;
  operationType:  string;   // "Add", "Convert", "Compare", etc.
  operationCode?: number;
  inputType?:     string;   // "length", "weight", etc.
  outputType?:    string;
  inputData:      string;   // e.g. "2 feet + 24 inch"
  resultData:     string;   // e.g. "4 feet"
  isSuccess?:     boolean;
  errorMessage?:  string;
  createdAt?:     string;
}
