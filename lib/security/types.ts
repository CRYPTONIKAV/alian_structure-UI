export interface SecurityScanResult {
  id: string;
  status: 'passed' | 'failed' | 'warning';
  score: number;
  timestamp: string;
}

export interface ContractAnalysisContext {
  contractId: string;
  bytecodeLength: number;
  estimatedSizeBytes: number;
  /** @deprecated Backward-compatible alias for estimatedSizeBytes */
  estimatedSizeByes?: number;
  features: string[];
}