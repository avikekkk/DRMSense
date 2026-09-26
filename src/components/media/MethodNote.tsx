import {
  AUDIO_PROBE_PARAMS,
  RESOLUTION_LADDER,
  VIDEO_PROBE_PARAMS,
} from '../../constants/codecs';
import { ExternalLink } from '../ui/ExternalLink';

const mbps = (bps: number) => `${Math.round((bps / 1_000_000) * 10) / 10} Mbps`;

/**
 * How the codec results were obtained, and where they can be wrong. Built from
 * the probe constants so the numbers here cannot drift from what is tested.
 * Rendered inside the footer's "About these results" panel.
 */
export function MethodNote() {
  const ladder = RESOLUTION_LADDER.map((r) => `${r.name} at ${mbps(r.bitrate)}`).join(', ');

  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold text-gray-700 dark:text-zinc-200">
        How we check codecs
      </h2>
      <ul className="space-y-2 list-disc pl-4 marker:text-gray-300 dark:marker:text-zinc-600">
        <li>
          We ask about each format with{' '}
          <ExternalLink href="https://developer.mozilla.org/en-US/docs/Web/API/MediaCapabilities/decodingInfo">
            <code className="font-mono">decodingInfo()</code>
          </ExternalLink>
          . We ask about normal streaming without DRM: video at {VIDEO_PROBE_PARAMS.width}×
          {VIDEO_PROBE_PARAMS.height}, {VIDEO_PROBE_PARAMS.framerate} fps and{' '}
          {mbps(VIDEO_PROBE_PARAMS.bitrate)}, and stereo audio at{' '}
          {AUDIO_PROBE_PARAMS.samplerate / 1000} kHz. DRM is checked on the DRM tab.
        </li>
        <li>
          For each codec, the bar and the tags come from its first working profile only.
          Other profiles of the same codec, like 10-bit ones, may do less.
        </li>
        <li>
          The bar asks about each size at 30 fps: {ladder}. &ldquo;Smooth&rdquo; and
          &ldquo;Hardware decode&rdquo; are the browser&rsquo;s own guesses. We don&rsquo;t
          count frames or measure battery use.
        </li>
        <li>
          Browsers can be wrong. Some say yes to things they only partly support, and some
          say yes to spatial audio for every codec. Private mode, battery saver and hardware
          acceleration settings can also change the answers.
        </li>
        <li>
          Older browsers without this API only give a yes or no, using{' '}
          <ExternalLink href="https://developer.mozilla.org/en-US/docs/Web/API/MediaSource/isTypeSupported_static">
            <code className="font-mono">MediaSource.isTypeSupported()</code>
          </ExternalLink>
          . In those browsers there are no bars or tags.
        </li>
        <li>
          Even if your browser can play a format, a streaming service may not send it to you.
          That also depends on the service, your screen and your internet speed.
        </li>
      </ul>
    </section>
  );
}
