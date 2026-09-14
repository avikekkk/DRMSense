import { useState } from 'react';
import { useCapabilityDetection } from './hooks/useCapabilityDetection';
import { buildExportPayload, downloadJson, exportFilename } from './utils/exportData';
import { DRMCard } from './components/DRMCard';
import { EmptyState } from './components/EmptyState';
import { ExportButton } from './components/ExportButton';
import { LoadingSpinner } from './components/LoadingSpinner';
import { MediaCapabilitiesCard } from './components/MediaCapabilitiesCard';
import { PageHeader } from './components/PageHeader';
import { SystemInfoCard } from './components/SystemInfoCard';
import { TabBar, type Tab } from './components/TabBar';
import { ThemeToggle } from './components/ThemeToggle';

type TabId = 'drm' | 'media';

const TABS: readonly Tab<TabId>[] = [
  { id: 'drm', label: 'DRM' },
  { id: 'media', label: 'Codecs' },
];

function App() {
  const { drmSystems, mediaCapabilities, systemInfo, loading } = useCapabilityDetection();
  const [activeTab, setActiveTab] = useState<TabId>('drm');

  const supportedDrmSystems = drmSystems.filter((system) => system.supported);

  const handleExport = () => {
    const payload = buildExportPayload(systemInfo, drmSystems, mediaCapabilities);
    downloadJson(payload, exportFilename(payload.exportedAt));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 font-sans text-gray-900 dark:text-zinc-100">
      <ThemeToggle />
      <ExportButton onExport={handleExport} />

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

        <div className="mt-12 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-gray-400 dark:text-zinc-500 leading-relaxed">
          Uses EME and Media Capabilities APIs. Results vary by browser, OS, and hardware.
        </div>
      </div>
    </div>
  );
}

export default App;
