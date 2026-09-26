import { useState } from 'react';
import { useCapabilityDetection } from './hooks/useCapabilityDetection';
import { DRMCard, DRMGuide } from './components/DRMCard';
import { EmptyState } from './components/EmptyState';
import { Credits } from './components/Credits';
import { LoadingSpinner } from './components/LoadingSpinner';
import { MediaCapabilitiesCard } from './components/MediaCapabilitiesCard';
import { MethodNote } from './components/media/MethodNote';
import { PageHeader } from './components/PageHeader';
import { SystemInfoCard } from './components/SystemInfoCard';
import { TabBar, type Tab } from './components/TabBar';

type TabId = 'drm' | 'media';

const TABS: readonly Tab<TabId>[] = [
  { id: 'drm', label: 'DRM' },
  { id: 'media', label: 'Codecs' },
];

function App() {
  const { drmSystems, mediaCapabilities, systemInfo, loading } = useCapabilityDetection();
  const [activeTab, setActiveTab] = useState<TabId>('drm');

  const supportedDrmSystems = drmSystems.filter((system) => system.supported);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 font-sans text-gray-900 dark:text-zinc-100">
      <div className="max-w-[1100px] mx-auto px-6 py-10">
        <PageHeader />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <SystemInfoCard info={systemInfo} />
            <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

            <div className="min-h-[400px]">
              {activeTab === 'media' && mediaCapabilities && (
                <MediaCapabilitiesCard capabilities={mediaCapabilities} />
              )}

              {activeTab === 'drm' && supportedDrmSystems.length > 0 && <DRMGuide />}

              {activeTab === 'drm' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {supportedDrmSystems.length > 0 ? (
                    supportedDrmSystems.map((system) => (
                      <DRMCard key={system.name} system={system} />
                    ))
                  ) : (
                    <EmptyState />
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <Credits>
          <MethodNote />
        </Credits>
      </div>
    </div>
  );
}

export default App;
