import { cn } from '#ui/lib/cn';
import { Icon } from '#ui/primitives/foundation/icon/icon';

export function buildTowersAdornment(
  safePerRow: number,
  unsafePerRow: number,
  isSelected: boolean,
) {
  const indicators = [
    ...Array.from({ length: safePerRow }, () => 'check' as const),
    ...Array.from({ length: unsafePerRow }, () => 'close' as const),
  ];

  return indicators.map((name, index) => (
    <Icon
      key={index}
      name={name}
      size="md"
      color="none"
      className={cn(
        isSelected
          ? 'text-ds-text-primary'
          : name === 'check'
            ? 'text-ds-text-brand-primary'
            : 'text-ds-foreground-quaternary',
      )}
    />
  ));
}
