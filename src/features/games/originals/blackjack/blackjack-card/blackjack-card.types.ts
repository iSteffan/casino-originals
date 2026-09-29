export interface BlackjackCardVisual {
  id: string;
  src: string;
  label: string;
  layoutKey?: string;
  concealed?: boolean;
}

export interface BlackjackCardProps {
  card: {
    rank: string;
    suit: string;
  };
  flipped: boolean;
  isDealer: boolean;
  isActiveHand?: boolean;
  handIndex: 0 | 1;
  className?: string;
}

export interface BlackjackCardStaticProps {
  src: string;
  label: string;
  className?: string;
}
