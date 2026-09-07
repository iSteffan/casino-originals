const MAX_INPUT_LENGTH = 30;

interface DecimalParts {
  fraction: string;
  integer: string;
}

interface ScaledDecimal {
  coefficient: bigint;
  scale: number;
}

function parseDecimalParts(value: string): DecimalParts | null {
  const normalized = stripNumberGrouping(value.trim());
  if (!normalized || normalized === '.' || !/^\d*\.?\d*$/.test(normalized)) {
    return null;
  }

  const [rawInteger = '', fraction = ''] = normalized.split('.');
  return {
    integer: rawInteger.replace(/^0+(?=\d)/, '') || '0',
    fraction,
  };
}

function isZeroDecimal({ fraction, integer }: DecimalParts) {
  return !/[1-9]/.test(integer) && !/[1-9]/.test(fraction);
}

function toScaledDecimal(value: string): ScaledDecimal | null {
  const parts = parseDecimalParts(value);
  if (!parts) return null;

  return {
    coefficient: BigInt(`${parts.integer}${parts.fraction}`),
    scale: parts.fraction.length,
  };
}

function compareScaledDecimals(left: ScaledDecimal, right: ScaledDecimal) {
  const scale = Math.max(left.scale, right.scale);
  const leftCoefficient = left.coefficient * 10n ** BigInt(scale - left.scale);
  const rightCoefficient = right.coefficient * 10n ** BigInt(scale - right.scale);

  if (leftCoefficient === rightCoefficient) return 0;
  return leftCoefficient > rightCoefficient ? 1 : -1;
}

function formatDecimalParts(value: string, precision: number) {
  const parts = parseDecimalParts(value);
  if (!parts || isZeroDecimal(parts)) return null;

  const safePrecision = Number.isInteger(precision) && precision > 0 ? precision : 0;
  return {
    integer: parts.integer,
    fraction: parts.fraction.slice(0, safePrecision).padEnd(safePrecision, '0'),
  };
}

export function stripNumberGrouping(input: string) {
  return input.replace(/,/g, '');
}

export function isValidGroupedNumberInput(input: string, precision: number) {
  if (input === '') return true;
  if (input.length > MAX_INPUT_LENGTH) return false;

  const normalized = stripNumberGrouping(input);
  if ((normalized.match(/\./g) || []).length > 1) return false;
  if (!/^\d*\.?\d*$/.test(normalized)) return false;

  const decimalIndex = normalized.indexOf('.');
  if (decimalIndex !== -1 && normalized.length - decimalIndex - 1 > precision) {
    return false;
  }

  return true;
}

export function formatNumberGrouped(value: string, precision: number) {
  const parts = formatDecimalParts(value, precision);
  if (!parts) return '';

  const groupedInteger = parts.integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.fraction ? `${groupedInteger}.${parts.fraction}` : groupedInteger;
}

export function formatNumberEditable(value: string, precision: number) {
  const parts = formatDecimalParts(value, precision);
  if (!parts) return '';

  return parts.fraction ? `${parts.integer}.${parts.fraction}` : parts.integer;
}

export function isGroupedNumberEmpty(value: string) {
  const parts = parseDecimalParts(value);
  return !parts || isZeroDecimal(parts);
}

export function compareNonNegativeDecimals(left: string, right: string) {
  const leftParts = parseDecimalParts(left);
  const rightParts = parseDecimalParts(right);
  if (!leftParts || !rightParts) return null;

  if (leftParts.integer.length !== rightParts.integer.length) {
    return leftParts.integer.length > rightParts.integer.length ? 1 : -1;
  }
  if (leftParts.integer !== rightParts.integer) {
    return leftParts.integer > rightParts.integer ? 1 : -1;
  }

  const fractionLength = Math.max(leftParts.fraction.length, rightParts.fraction.length);
  const leftFraction = leftParts.fraction.padEnd(fractionLength, '0');
  const rightFraction = rightParts.fraction.padEnd(fractionLength, '0');
  if (leftFraction === rightFraction) return 0;
  return leftFraction > rightFraction ? 1 : -1;
}

export function compareDecimalProduct(
  leftFactor: string,
  rightFactor: string,
  value: string,
) {
  const left = toScaledDecimal(leftFactor);
  const right = toScaledDecimal(rightFactor);
  const target = toScaledDecimal(value);
  if (!left || !right || !target) return null;

  return compareScaledDecimals(
    {
      coefficient: left.coefficient * right.coefficient,
      scale: left.scale + right.scale,
    },
    target,
  );
}

export function normalizeGroupedNumber(value: string): string {
  let normalized = stripNumberGrouping(value.trim());
  if (!normalized || normalized === '.') return '';

  if (normalized.endsWith('.')) {
    normalized = normalized.slice(0, -1);
  }

  if (!normalized) return '';

  const dotIndex = normalized.indexOf('.');
  const intPartRaw = dotIndex === -1 ? normalized : normalized.slice(0, dotIndex);
  let decPart = dotIndex === -1 ? undefined : normalized.slice(dotIndex + 1);

  const intPart = intPartRaw.replace(/^0+(?=\d)/, '') || '0';

  if (decPart !== undefined) {
    decPart = decPart.replace(/0+$/, '');
  }

  if (!decPart) {
    return intPart === '0' ? '' : intPart;
  }

  return `${intPart}.${decPart}`;
}
