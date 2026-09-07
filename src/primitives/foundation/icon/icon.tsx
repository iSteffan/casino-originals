import type { ComponentProps, ComponentType } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { AllBetsIcon } from './icons/all-bets';
import { AmountSwapIcon } from './icons/amount-swap';
import { BurgerIcon } from './icons/burger';
import { CalendarIcon } from './icons/calendar';
import { ChatIcon } from './icons/chat';
import { CheckIcon } from './icons/check';
import { ChevronDownIcon } from './icons/chevron-down';
import { ChevronLeftIcon } from './icons/chevron-left';
import { ChevronRightIcon } from './icons/chevron-right';
import { CircleIcon } from './icons/circle';
import { ClockIcon } from './icons/clock';
import { CloseIcon } from './icons/close';
import { CopyIcon } from './icons/copy';
import { DangerIcon } from './icons/danger';
import { DiceIcon } from './icons/dice';
import { EmojiIcon } from './icons/emoji';
import { ExternalLinkIcon } from './icons/external-link';
import { EyeIcon } from './icons/eye';
import { EyeOffIcon } from './icons/eye-off';
import { FavoritesIcon } from './icons/favorites';
import { FavoritesOutlineIcon } from './icons/favorites-outline';
import { FullscreenIcon } from './icons/fullscreen';
import { HelpIcon } from './icons/help';
import { ImageIcon } from './icons/image';
import { InfiniteIcon } from './icons/infinite';
import { InfoIcon } from './icons/info';
import { InstagramIcon } from './icons/instagram';
import { LinkIcon } from './icons/link';
import { LiveIcon } from './icons/live';
import { LiveCasinoCardsIcon } from './icons/live-casino-cards';
import { LoadingIcon } from './icons/loading';
import { LockIcon } from './icons/lock';
import { MailIcon } from './icons/mail';
import { MinusIcon } from './icons/minus';
import { MuteIcon } from './icons/mute';
import { MyBetsIcon } from './icons/my-bets';
import { NotificationsIcon } from './icons/notifications';
import { OptionsIcon } from './icons/options';
import { PasswordLockIcon } from './icons/password-lock';
import { PlusIcon } from './icons/plus';
import { ProviderIcon } from './icons/provider';
import { ReplyIcon } from './icons/reply';
import { SafeCertIcon } from './icons/safe-cert';
import { SearchIcon } from './icons/search';
import { SendIcon } from './icons/send';
import { ShareIcon } from './icons/share';
import { SideMenuCollapseClosedIcon } from './icons/side-menu-collapse-closed';
import { SideMenuCollapseOpenIcon } from './icons/side-menu-collapse-open';
import { TwitterIcon } from './icons/twitter';
import { UserIcon } from './icons/user';
import { UserFilledIcon } from './icons/user-filled';
import { VolumeIcon } from './icons/volume';
import { VolumeLowIcon } from './icons/volume-low';
import { WalletIcon } from './icons/wallet';
import { WarningIcon } from './icons/warning';
import { WideIcon } from './icons/wide';

import { cn } from '#ui/lib/cn';

const icons = {
  'all-bets': AllBetsIcon,
  'amount-swap': AmountSwapIcon,
  calendar: CalendarIcon,
  chat: ChatIcon,
  burger: BurgerIcon,
  check: CheckIcon,
  'chevron-down': ChevronDownIcon,
  'chevron-left': ChevronLeftIcon,
  'chevron-right': ChevronRightIcon,
  circle: CircleIcon,
  clock: ClockIcon,
  close: CloseIcon,
  copy: CopyIcon,
  danger: DangerIcon,
  dice: DiceIcon,
  emoji: EmojiIcon,
  'external-link': ExternalLinkIcon,
  eye: EyeIcon,
  'eye-off': EyeOffIcon,
  favorites: FavoritesIcon,
  'favorites-outline': FavoritesOutlineIcon,
  fullscreen: FullscreenIcon,
  help: HelpIcon,
  image: ImageIcon,
  infinite: InfiniteIcon,
  info: InfoIcon,
  instagram: InstagramIcon,
  link: LinkIcon,
  live: LiveIcon,
  'live-casino-cards': LiveCasinoCardsIcon,
  lock: LockIcon,
  loading: LoadingIcon,
  mail: MailIcon,
  minus: MinusIcon,
  mute: MuteIcon,
  'my-bets': MyBetsIcon,
  notifications: NotificationsIcon,
  options: OptionsIcon,
  'password-lock': PasswordLockIcon,
  plus: PlusIcon,
  provider: ProviderIcon,
  reply: ReplyIcon,
  search: SearchIcon,
  'side-menu-collapse-closed': SideMenuCollapseClosedIcon,
  'side-menu-collapse-open': SideMenuCollapseOpenIcon,
  'safe-cert': SafeCertIcon,
  send: SendIcon,
  share: ShareIcon,
  twitter: TwitterIcon,
  user: UserIcon,
  'user-filled': UserFilledIcon,
  volume: VolumeIcon,
  'volume-low': VolumeLowIcon,
  wallet: WalletIcon,
  warning: WarningIcon,
  wide: WideIcon,
} satisfies Record<string, ComponentType<ComponentProps<'svg'>>>;

const iconVariants = cva('shrink-0', {
  variants: {
    size: {
      sm: 'size-ds-3',
      md: 'size-ds-4',
      lg: 'size-ds-5',
      xl: 'size-ds-6',
    },
    color: {
      primary: 'text-ds-icon-primary',
      secondary: 'text-ds-icon-secondary',
      black: 'text-ds-icon-black',
      white: 'text-ds-icon-white',
      'brand-primary': 'text-ds-icon-brand-primary',
      'brand-secondary': 'text-ds-icon-brand-secondary',
      error: 'text-ds-icon-error',
      info: 'text-ds-icon-info',
      success: 'text-ds-icon-success',
      warning: 'text-ds-icon-warning',
      none: '',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'primary',
  },
});

const animationClasses: Partial<Record<IconName, string>> = {
  loading: 'animate-spin',
};

type IconName = keyof typeof icons;
type IconSize = NonNullable<VariantProps<typeof iconVariants>['size']>;
type IconColor = NonNullable<VariantProps<typeof iconVariants>['color']>;

interface IconProps
  extends
    Omit<ComponentProps<'svg'>, 'color' | 'children'>,
    VariantProps<typeof iconVariants> {
  name: IconName;
  label?: string;
}

export function Icon({ name, size, color, label, className, ...props }: IconProps) {
  const IconSvg = icons[name];

  const a11yProps = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true };

  return (
    <IconSvg
      data-slot="icon"
      className={cn(iconVariants({ size, color }), animationClasses[name], className)}
      {...a11yProps}
      {...props}
    />
  );
}

export const iconNames = Object.keys(icons) as IconName[];

export { iconVariants };
export type { IconColor, IconName, IconSize };
