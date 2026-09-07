import type { ComponentProps } from 'react';

export function VolumeIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M5 7.50008H2.5V12.5001H5L9.16667 15.8334V4.16675L5 7.50008Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M15.4167 4.58342C16.1282 5.29461 16.6927 6.13903 17.0778 7.06844C17.4629 7.99786 17.6611 8.99404 17.6611 10.0001C17.6611 11.0061 17.4629 12.0023 17.0778 12.9317C16.6927 13.8611 16.1282 14.7056 15.4167 15.4167M12.5 6.66675C13.384 7.55082 13.8807 8.74985 13.8807 10.0001C13.8807 11.2503 13.384 12.4493 12.5 13.3334"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
