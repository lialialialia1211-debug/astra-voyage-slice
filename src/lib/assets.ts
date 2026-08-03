export type AssetManifest = Readonly<Record<string, string>>;

export type AssetResolution =
  | { kind: 'ready'; id: string; url: string; label: string }
  | { kind: 'placeholder'; id: string; url: null; label: string };

export function resolveAsset(id: string, manifest: AssetManifest): AssetResolution {
  const url = manifest[id];
  return url
    ? { kind: 'ready', id, url, label: id }
    : { kind: 'placeholder', id, url: null, label: `缺少美術：${id}` };
}
