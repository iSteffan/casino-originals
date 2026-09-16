import type { ComponentPropsWithRef, ComponentType } from 'react';

export interface LayoutLinkProps extends Omit<ComponentPropsWithRef<'a'>, 'href'> {
  href: string;
  'data-active'?: true;
}

export type LayoutLinkComponent = ComponentType<LayoutLinkProps>;
