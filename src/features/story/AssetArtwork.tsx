import { userAssetUrl } from '../../lib/user-assets';

interface AssetArtworkProps {
  assetId: string;
  alt: string;
  fallbackLabel: string;
  className: string;
}

export function AssetArtwork({ assetId, alt, fallbackLabel, className }: AssetArtworkProps) {
  const url = userAssetUrl(assetId);
  if (url) return <img alt={alt} className={className} src={url} />;

  return (
    <div aria-label={alt} className={`${className} asset-fallback`} role="img">
      <span>{fallbackLabel}</span>
      <small>{assetId}</small>
    </div>
  );
}
