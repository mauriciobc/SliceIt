import {
  Cloud,
  Database,
  Server,
  HardDrive,
  Shield,
  Fingerprint,
  Activity,
  Network,
  GitBranch,
  BrainCircuit,
  Container,
  Globe,
  LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Cloud,
  Database,
  Server,
  Storage: HardDrive,
  Security: Shield,
  Identity: Fingerprint,
  Monitoring: Activity,
  Network,
  DevOps: GitBranch,
  AI: BrainCircuit,
  Container,
  API: Globe,
};

export const iconComponents = iconMap;

export function getIconComponent(name?: string): LucideIcon | undefined {
  if (!name) return undefined;
  return iconMap[name];
}

export function getIconNames(): string[] {
  return Object.keys(iconMap);
}
