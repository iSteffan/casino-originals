export interface BlackjackInsuranceProps {
  label: string;
  acceptLabel: string;
  declineLabel: string;
  onChoose: (accepted: boolean) => void;
  className?: string;
}
