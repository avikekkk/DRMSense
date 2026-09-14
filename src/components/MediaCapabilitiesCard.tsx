import type { DetailedMediaCapabilities } from '../types/drm';
import { Card } from './ui/Card';
import { AudioCodecSection, VideoCodecSection } from './media/CodecSections';

interface MediaCapabilitiesCardProps {
  capabilities: DetailedMediaCapabilities;
}

export function MediaCapabilitiesCard({ capabilities }: MediaCapabilitiesCardProps) {
  return (
    <div className="space-y-6">
      <Card className="col-span-full">
        <VideoCodecSection codecs={capabilities.videoCodecs} />
      </Card>

      <Card className="col-span-full">
        <AudioCodecSection codecs={capabilities.audioCodecs} />
      </Card>
    </div>
  );
}
