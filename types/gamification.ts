export interface FreezeState {
  isActive: boolean;
  activatedAt: number | null;
  expiresAt: number | null;
  remainingTime: number;
  hasBeenShownModal: boolean;
}

export interface FreezeStorageData {
  isActive: boolean;
  activatedAt: number | null;
  expiresAt: number | null;
  hasBeenShownModal: boolean;
}

export interface FreezeAnalyticsParams {
  pair?: string;
  amount?: number;
  [key: string]: any;
}
