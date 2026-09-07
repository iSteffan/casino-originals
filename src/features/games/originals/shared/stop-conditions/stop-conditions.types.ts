export interface StopConditionsLabels {
  onWin: string;
  onLoss: string;
  stopProfit: string;
  stopLoss: string;
  reset: string;
  increaseBy: string;
}

export interface StopConditionsProps {
  labels: StopConditionsLabels;
  onWinValue: number;
  onLossValue: number;
  stopProfitValue: string;
  stopLossValue: string;
  isActiveOnWin: boolean;
  isActiveOnLoss: boolean;
  onWinChange: (value: number) => void;
  onLossChange: (value: number) => void;
  onStopProfitChange: (value: string) => void;
  onStopLossChange: (value: string) => void;
  onWinToggle: (active: boolean) => void;
  onLossToggle: (active: boolean) => void;
  onResetOnWinFromActive?: () => void;
  onResetOnLossFromActive?: () => void;
  disabled?: boolean;
  className?: string;
}
