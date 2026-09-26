import { RiKeyLine, RiShieldCheckLine, RiShieldFlashLine, RiShieldKeyholeLine, RiShieldLine } from 'react-icons/ri';
import { useState } from 'react';
import type { IconType } from 'react-icons';
import type { DRMSystemInfo } from '../types/drm';
import { Card } from './ui/Card';
import { GuidePanel, GuideToggle, type GuideEntry } from './ui/Guide';

const ICONS: Record<string, IconType> = {
  Shield: RiShieldLine,
  ShieldCheck: RiShieldCheckLine,
  ShieldAlert: RiShieldFlashLine,
  ShieldLock: RiShieldKeyholeLine,
  Key: RiKeyLine,
};

function isHardwareLevel(level: string): boolean {
  return /L1|SL3000|Hardware/i.test(level);
}

/** Plain-English meaning of each row, shared by the row tooltips and the "How to read" key. */
const HINTS = {
  security: 'How well this DRM protects video on this device. Hardware is stronger than software.',
  robustness: 'The security levels the browser agreed to, strongest first. HW means hardware, SW means software.',
  encryption: 'Ways of encrypting video that this DRM can unlock. Most services use cenc or cbcs.',
  hdcp: 'The highest HDCP version your screen connection can promise. 4K services often ask for 2.2 or higher.',
  playback:
    'Codecs that play with this DRM. The size after @ is the largest the browser says works, so H.264 @ 4K means up to 4K.',
  persistent: 'Can save a license for offline viewing, like downloaded shows.',
  distinctive: 'Can use an ID unique to this device. Some services need this.',
  keySystems: 'The DRM names we tried for this system, and which ones worked.',
};

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-baseline gap-3 py-1.5 border-b border-border dark:border-border-dark last:border-0">
      <span title={hint} className="text-xs text-gray-400 dark:text-gray-500 shrink-0 cursor-help">
        {label}
      </span>
      <span className="text-right text-xs font-medium text-gray-700 dark:text-gray-300">{children}</span>
    </div>
  );
}

function Pills({ values, empty }: { values: string[]; empty: string }) {
  if (values.length === 0) {
    return <span className="text-xs text-gray-300 dark:text-zinc-600">{empty}</span>;
  }

  return (
    <span className="flex flex-wrap justify-end gap-1">
      {values.map((value) => (
        <span
          key={value}
          className="text-2xs font-mono text-gray-500 dark:text-zinc-400"
        >
          {value}
        </span>
      ))}
    </span>
  );
}

/** Hardware-decoded codecs get the same solid box as the "Hardware decode" tag on the Codecs tab. */
function codecClass(hardware: boolean | undefined): string {
  return hardware
    ? 'px-1 text-2xs font-mono bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
    : 'text-2xs font-mono text-gray-500 dark:text-zinc-400';
}

interface DRMCardProps {
  system: DRMSystemInfo;
}

export function DRMCard({ system }: DRMCardProps) {
  const Icon = ICONS[system.icon] ?? RiShieldLine;
  const hardware = isHardwareLevel(system.securityLevel);
  const supportedCodecs = system.supportedCodecs.filter((c) => c.supported);

  return (
    <Card>
      <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <Icon className="w-4 h-4 text-gray-800 dark:text-zinc-100 shrink-0" />
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-zinc-100">{system.name}</h2>
          <p className="text-2xs font-mono text-gray-400 dark:text-zinc-500 truncate">
            {system.keySystem}
          </p>
        </div>
      </div>

      <div>
        <Row label="Security" hint={HINTS.security}>
          <span
            className={
              hardware
                ? 'text-green-600 dark:text-green-400'
                : 'text-amber-600 dark:text-amber-400'
            }
          >
            {system.securityLevel}
          </span>
        </Row>

        {system.videoRobustness.length > 0 && (
          <Row label="Video Robustness" hint={HINTS.robustness}>
            <Pills values={system.videoRobustness} empty="—" />
          </Row>
        )}

        <Row label="Encryption" hint={HINTS.encryption}>
          <Pills values={system.encryptionSchemes} empty="Not reported" />
        </Row>

        {system.hdcpVersions.length > 0 && (
          <Row label="Max HDCP" hint={HINTS.hdcp}>
            <span className="font-mono text-2xs">
              {system.hdcpVersions[system.hdcpVersions.length - 1]}
            </span>
          </Row>
        )}

        {supportedCodecs.length > 0 && (
          <Row label="Encrypted Playback" hint={HINTS.playback}>
            <span className="flex flex-wrap justify-end gap-x-3 gap-y-1">
              {supportedCodecs.map((codec) => (
                <span
                  key={codec.name}
                  title={
                    codec.powerEfficient
                      ? 'The browser says your graphics chip plays this with this DRM'
                      : 'Played in software with this DRM'
                  }
                  className={codecClass(codec.powerEfficient)}
                >
                  {codec.name}
                  {codec.maxResolution ? ` @ ${codec.maxResolution}` : ''}
                  {codec.powerEfficient && <span className="sr-only"> (hardware decode)</span>}
                </span>
              ))}
            </span>
          </Row>
        )}

        <Row label="Persistent License" hint={HINTS.persistent}>
          <span
            className={
              system.persistentLicenseSupport
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-300 dark:text-zinc-600'
            }
          >
            {system.persistentLicenseSupport ? 'Yes' : 'No'}
          </span>
        </Row>
        <Row label="Distinctive ID" hint={HINTS.distinctive}>
          <span
            className={
              system.distinctiveIdentifier
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-300 dark:text-zinc-600'
            }
          >
            {system.distinctiveIdentifier ? 'Yes' : 'No'}
          </span>
        </Row>

        {system.keySystems.length > 1 && (
          <div className="pt-2 mt-1 border-t border-zinc-200 dark:border-zinc-800">
            <p title={HINTS.keySystems} className="text-xs text-gray-400 dark:text-zinc-500 mb-1 w-fit cursor-help">
              Key Systems
            </p>
            <div className="space-y-0.5">
              {system.keySystems.map((ks) => (
                <div key={ks.keySystem} className="flex items-center gap-2 text-2xs">
                  <span
                    className={
                      ks.supported
                        ? 'text-green-500'
                        : 'text-gray-200 dark:text-zinc-700'
                    }
                  >
                    {ks.supported ? '✓' : '✗'}
                  </span>
                  <span className="font-mono text-gray-500 dark:text-zinc-400">{ks.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

const YES = 'text-green-600 dark:text-green-400';

const GUIDE: GuideEntry[] = [
  {
    sample: <span className="text-xs font-medium text-green-600 dark:text-green-400">L1 (Hardware)</span>,
    meaning:
      'Hardware security. Video is protected inside a secure chip. Services usually need this for HD and 4K.',
  },
  {
    sample: <span className="text-xs font-medium text-amber-600 dark:text-amber-400">L3 (Software)</span>,
    meaning: 'Software security. Many services limit this to lower quality.',
  },
  {
    sample: <span className="text-2xs font-mono text-gray-500 dark:text-zinc-400">SW_SECURE_DECODE</span>,
    meaning: HINTS.robustness,
  },
  {
    sample: <span className="text-2xs font-mono text-gray-500 dark:text-zinc-400">cenc cbcs</span>,
    meaning: HINTS.encryption,
  },
  {
    sample: <span className="text-2xs font-mono text-gray-700 dark:text-gray-300">2.3</span>,
    meaning: `Max HDCP: ${HINTS.hdcp}`,
  },
  {
    sample: <span className={codecClass(false)}>H.264 @ 4K</span>,
    meaning: HINTS.playback,
  },
  {
    sample: <span className={codecClass(true)}>H.264 @ 4K</span>,
    meaning: 'A filled box means hardware decode: the browser says your graphics chip plays it.',
  },
  {
    sample: <span className={`text-xs font-medium ${YES}`}>Yes</span>,
    meaning: 'Persistent License: offline viewing. Distinctive ID: a device ID some services need.',
  },
  {
    sample: (
      <span className="flex items-center gap-2 text-2xs">
        <span className="text-green-500">✓</span>
        <span className="text-gray-200 dark:text-zinc-700">✗</span>
      </span>
    ),
    meaning: HINTS.keySystems,
  },
];

/** One key for every DRM card, so the cards themselves stay compact. */
export function DRMGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4">
      <div className="flex justify-end mb-2">
        <GuideToggle open={open} onToggle={() => setOpen(!open)} controls="drm-guide" />
      </div>
      {open && <GuidePanel id="drm-guide" entries={GUIDE} />}
    </div>
  );
}
