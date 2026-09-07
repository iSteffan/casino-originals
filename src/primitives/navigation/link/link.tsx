import type { ComponentPropsWithRef } from 'react';

import NextLink from 'next/link';

import { formControlFocusRing } from '#ui/lib/class-presets';
import { cn } from '#ui/lib/cn';

type LinkProps = Omit<ComponentPropsWithRef<'a'>, 'href'> & {
  href: string;
};

type LinkHrefKind = 'blocked' | 'internal' | 'native';

const URI_SCHEME_PATTERN = /^[a-z][a-z\d+.-]*:/i;
const BLOCKED_SCHEME_PATTERN = /^(?:javascript|data|vbscript):/i;

function classifyHref(href: string): LinkHrefKind {
  const normalizedHref = href.trim();
  const compactHref = normalizedHref.replace(/[\u0000-\u0020\u007f]/g, '');
  const browserNormalizedHref = compactHref.replaceAll('\\', '/');

  if (BLOCKED_SCHEME_PATTERN.test(compactHref)) return 'blocked';
  if (
    compactHref === '' ||
    compactHref.startsWith('#') ||
    browserNormalizedHref.startsWith('//') ||
    URI_SCHEME_PATTERN.test(compactHref)
  ) {
    return 'native';
  }

  return 'internal';
}

function getSafeRel(target: string | undefined, rel: string | undefined) {
  if (target?.toLowerCase() !== '_blank') return rel;

  const tokens = rel?.split(/\s+/).filter(Boolean) ?? [];
  const normalizedTokens = new Set(tokens.map((token) => token.toLowerCase()));

  if (!normalizedTokens.has('noopener')) tokens.push('noopener');
  if (!normalizedTokens.has('noreferrer')) tokens.push('noreferrer');

  return tokens.join(' ');
}

function Link({ href, target, rel, download, className, children, ...props }: LinkProps) {
  const normalizedHref = href.trim();
  const hrefKind = classifyHref(normalizedHref);
  const resolvedRel = getSafeRel(target, rel);
  const hasDownload = download != null && download !== false;
  const resolvedClassName = cn(formControlFocusRing, className);

  if (hrefKind === 'internal' && !hasDownload) {
    return (
      <NextLink
        href={normalizedHref}
        target={target}
        rel={resolvedRel}
        className={resolvedClassName}
        {...props}
      >
        {children}
      </NextLink>
    );
  }

  return (
    <a
      href={hrefKind === 'blocked' ? undefined : normalizedHref}
      target={target}
      rel={resolvedRel}
      download={download}
      className={resolvedClassName}
      {...props}
    >
      {children}
    </a>
  );
}

export { Link };
export type { LinkProps };
