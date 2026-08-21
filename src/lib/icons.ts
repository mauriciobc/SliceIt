import { icons, LucideIcon } from 'lucide-react';

const aliases: Record<string, string> = {
  Storage: 'HardDrive',
  Security: 'Shield',
  Identity: 'Fingerprint',
  Fingerprint: 'FingerprintPattern',
  DevOps: 'GitBranch',
  AI: 'BrainCircuit',
  API: 'Globe',
};

export const iconComponents: Record<string, LucideIcon> = icons;

export function getIconComponent(name?: string): LucideIcon | undefined {
  if (!name) return undefined;
  if (iconComponents[name]) return iconComponents[name];
  const aliasTarget = aliases[name];
  return aliasTarget ? iconComponents[aliasTarget] : undefined;
}

export function getIconNames(): string[] {
  return Object.keys(iconComponents);
}

export function searchIconNames(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return getIconNames();
  return getIconNames().filter((name) => name.toLowerCase().includes(q));
}
