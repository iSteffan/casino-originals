export interface BlackjackCardVisual {
  id: string;
  src: string;
  label: string;
}

export interface BlackjackCardProps {
  src: string;
  label: string;
  width?: number;
  height?: number;
  className?: string;
}
