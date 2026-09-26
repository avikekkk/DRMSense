import type { ReactNode } from 'react';
import { RiArrowRightSLine, RiInformationLine } from 'react-icons/ri';
import { ExternalLink } from './ui/ExternalLink';

/** The web standards this app is built on, and the open source work it uses. */
const APIS = [
  {
    name: 'Media Capabilities API',
    use: 'Checks which codecs, sizes and features your browser can play.',
    spec: 'https://www.w3.org/TR/media-capabilities/',
    docs: 'https://developer.mozilla.org/en-US/docs/Web/API/Media_Capabilities_API',
  },
  {
    name: 'Encrypted Media Extensions (EME)',
    use: 'Checks which DRM systems your browser supports.',
    spec: 'https://www.w3.org/TR/encrypted-media-2/',
    docs: 'https://developer.mozilla.org/en-US/docs/Web/API/Encrypted_Media_Extensions_API',
  },
  {
    name: 'Media Source Extensions (MSE)',
    use: 'Gives a simple yes or no in browsers without the Media Capabilities API.',
    spec: 'https://www.w3.org/TR/media-source-2/',
    docs: 'https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API',
  },
];

const TOOLS = [
  { name: 'React', href: 'https://react.dev/' },
  { name: 'Tailwind CSS', href: 'https://tailwindcss.com/' },
  { name: 'Vite', href: 'https://vite.dev/' },
  { name: 'Remix Icon', href: 'https://remixicon.com/' },
  { name: 'react-icons', href: 'https://react-icons.github.io/react-icons/' },
  { name: 'Inter', href: 'https://rsms.me/inter/' },
  { name: 'JetBrains Mono', href: 'https://www.jetbrains.com/lp/mono/' },
];

/**
 * Everything about where the results come from, folded behind one toggle so it
 * stays out of the way. `children` holds the codec method note.
 */
export function Credits({ children }: { children?: ReactNode }) {
  return (
    <footer className="mt-12 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs leading-relaxed text-gray-500 dark:text-zinc-400">
      <details className="group">
        <summary className="flex items-center gap-1.5 w-fit cursor-pointer list-none hover:text-gray-900 dark:hover:text-zinc-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 [&::-webkit-details-marker]:hidden">
          <RiInformationLine className="w-4 h-4 shrink-0" />
          About these results, and credits
          <RiArrowRightSLine className="w-3.5 h-3.5 transition-transform group-open:rotate-90 motion-reduce:transition-none" />
        </summary>

        <div className="mt-4 space-y-6 text-gray-600 dark:text-zinc-300">
          <p>
            These results are what your browser says it supports. We don&rsquo;t play any real
            video or audio. We ask the browser using standard web APIs and show its answers, so
            they can differ between browsers, devices and settings. Everything runs on your
            device. Nothing is sent to us or anyone else.
          </p>

          {children}

          <section>
            <h2 className="mb-2 text-xs font-semibold text-gray-700 dark:text-zinc-200">
              Web APIs we use
            </h2>
            <ul className="space-y-2">
              {APIS.map((api) => (
                <li key={api.name}>
                  <span className="text-gray-700 dark:text-zinc-200">{api.name}</span>
                  <span className="block">
                    {api.use} <ExternalLink href={api.spec}>Spec</ExternalLink>,{' '}
                    <ExternalLink href={api.docs}>MDN docs</ExternalLink>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-xs font-semibold text-gray-700 dark:text-zinc-200">
              Credits
            </h2>
            <p>
              The specs are written by the{' '}
              <ExternalLink href="https://www.w3.org/groups/wg/media/">
                W3C Media Working Group
              </ExternalLink>
              . The API guides are written by the MDN community. DRMSense is built with{' '}
              {TOOLS.map((tool, i) => (
                <span key={tool.name}>
                  <ExternalLink href={tool.href}>{tool.name}</ExternalLink>
                  {i < TOOLS.length - 2 ? ', ' : i === TOOLS.length - 2 ? ' and ' : '.'}
                </span>
              ))}{' '}
              Thank you to everyone who works on them.
            </p>
          </section>
        </div>
      </details>
    </footer>
  );
}
