export interface QuantityDTO {
  value: number;
  unit: string;
  measurementType: string;
}

export interface CalculationRequest {
  first: QuantityDTO;
  second: QuantityDTO;
  targetUnit?: string;
}

export interface CalculationResponse {
  data?: any;
  Data?: any;
  message?: string;
  Message?: string;
}
