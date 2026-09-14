import { RiKeyLine, RiShieldCheckLine, RiShieldFlashLine, RiShieldKeyholeLine, RiShieldLine } from 'react-icons/ri';
import type { IconType } from 'react-icons';
import type { DRMSystemInfo } from '../types/drm';
import { Card } from './ui/Card';

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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-baseline gap-3 py-1.5 border-b border-border dark:border-border-dark last:border-0">
      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{label}</span>
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
        <Row label="Security">
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
          <Row label="Video Robustness">
            <Pills values={system.videoRobustness} empty="—" />
          </Row>
        )}

        <Row label="Encryption">
          <Pills values={system.encryptionSchemes} empty="Not reported" />
        </Row>

        {system.hdcpVersions.length > 0 && (
          <Row label="Max HDCP">
            <span className="font-mono text-2xs">
              {system.hdcpVersions[system.hdcpVersions.length - 1]}
            </span>
          </Row>
        )}

        {supportedCodecs.length > 0 && (
          <Row label="Encrypted Playback">
            <span className="flex flex-wrap justify-end gap-1">
              {supportedCodecs.map((codec) => (
                <span
                  key={codec.name}
                  title={
                    codec.powerEfficient
                      ? 'Hardware-accelerated under this key system'
                      : 'Software decode under this key system'
                  }
                  className="text-2xs font-mono text-gray-500 dark:text-zinc-400"
                >
                  {codec.name}
                  {codec.maxResolution ? ` ≤${codec.maxResolution}` : ''}
                  {codec.powerEfficient ? ' ⚡' : ''}
                </span>
              ))}
            </span>
          </Row>
        )}

        <Row label="Persistent License">
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
        <Row label="Distinctive ID">
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
            <p className="text-xs text-gray-400 dark:text-zinc-500 mb-1">Key Systems</p>
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
