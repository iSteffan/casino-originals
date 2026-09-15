export type CashierCurrencyId = 'btc' | 'eth' | 'usdt';

export interface CashierBalance {
  id: CashierCurrencyId;
  label: string;
  icon: string;
}

export interface CashierFormattedAmount {
  prefix?: string;
  whole: string;
  wholeValue?: number;
  fraction?: string;
  fractionValue?: number;
  fractionDigits: number;
  suffix?: string;
}

export interface CashierDropdownItem {
  balance: CashierBalance;
  formattedAmount: string;
}

export interface CashierDropdownProps {
  currentBalance: CashierBalance;
  currentFormattedAmount: CashierFormattedAmount;
  items: readonly CashierDropdownItem[];
  onSelectBalance: (balance: CashierBalance) => void;
  displayFiat: boolean;
  onDisplayFiatChange: (checked: boolean) => void;
  labels: {
    menu: string;
    displayInFiat: string;
  };
  defaultOpen?: boolean;
}
