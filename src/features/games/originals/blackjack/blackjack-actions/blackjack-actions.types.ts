export interface BlackjackActionItem {
  id?: string;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export interface BlackjackActionsProps {
  actions: readonly BlackjackActionItem[];
  className?: string;
}
