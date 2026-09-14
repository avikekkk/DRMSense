import { BsBoxSeam, BsCheck, BsDash } from 'react-icons/bs';
import type { ContainerSupport } from '../../types/drm';
import { Section } from './Section';

/** canPlayType is deliberately vague; surface the distinction rather than flattening it. */
function progressiveLabel(value: string): { text: string; className: string } {
  if (value === 'probably') return { text: 'Yes', className: 'text-green-500' };
  if (value === 'maybe') return { text: 'Maybe', className: 'text-amber-500' };
  return { text: '—', className: 'text-gray-300 dark:text-gray-600' };
}

function Mark({ on }: { on: boolean }) {
  return on ? (
    <BsCheck className="w-4 h-4 text-green-500 mx-auto" />
  ) : (
    <BsDash className="w-4 h-4 text-gray-300 dark:text-gray-600 mx-auto" />
  );
}

interface ContainersSectionProps {
  containers: ContainerSupport[];
}

export function ContainersSection({ containers }: ContainersSectionProps) {
  const supported = containers.filter(
    (c) => c.mediaSource || c.progressive !== '' || c.recording,
  );

  return (
    <Section
      icon={BsBoxSeam}
      iconClass="text-violet-500"
      title="Containers"
      count={{ supported: supported.length, total: containers.length }}
      emptyMessage="No container formats detected."
      className="overflow-x-auto"
    >
      <table className="w-full text-sm min-w-[22rem]">
        <thead>
          <tr className="text-xs text-gray-500 dark:text-gray-400">
            <th className="text-left font-normal pb-2">Format</th>
            <th className="font-normal pb-2 px-2" title="Usable with MediaSource (streaming)">
              MSE
            </th>
            <th className="font-normal pb-2 px-2" title="Direct playback via canPlayType">
              Direct
            </th>
            <th className="font-normal pb-2 px-2" title="Usable as a MediaRecorder output">
              Record
            </th>
          </tr>
        </thead>
        <tbody>
          {supported.map((container) => {
            const progressive = progressiveLabel(container.progressive);
            return (
              <tr
                key={container.name}
                className="p-2"
              >
                <td className="py-1.5">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {container.name}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 text-xs ml-2 font-mono">
                    {container.extensions}
                  </span>
                </td>
                <td className="px-2">
                  <Mark on={container.mediaSource} />
                </td>
                <td className={`px-2 text-center text-xs ${progressive.className}`}>
                  {progressive.text}
                </td>
                <td className="px-2">
                  <Mark on={container.recording} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Section>
  );
}
