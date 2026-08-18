import {
  Building2,
  ChartNoAxesColumn,
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  Quote,
  Receipt,
  Send,
  Settings2,
  ShieldAlert,
  Star,
  UserPlus,
  GraduationCap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  to: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ title: 'Dashboard', to: '/', icon: LayoutDashboard }],
  },
  {
    label: 'Website',
    items: [
      { title: 'Messages', to: '/site/messages', icon: MessageSquare },
      { title: 'Quotes', to: '/site/quotes', icon: Quote },
      { title: 'Purchases', to: '/site/purchases', icon: Receipt },
      { title: 'Reviews', to: '/site/reviews', icon: Star },
      { title: 'Newsletter', to: '/site/newsletter', icon: Newspaper },
      { title: 'Training', to: '/site/training', icon: GraduationCap },
      { title: 'Issues', to: '/site/issues', icon: ShieldAlert },
    ],
  },
  {
    label: 'Products',
    items: [
      { title: 'Organizations', to: '/organizations', icon: Building2 },
      { title: 'Provisioning', to: '/provisioning', icon: UserPlus },
      { title: 'Defaults', to: '/defaults', icon: Settings2 },
    ],
  },
  {
    label: 'Operations',
    items: [
      { title: 'SMS', to: '/sms', icon: Send },
      { title: 'Analytics', to: '/analytics', icon: ChartNoAxesColumn },
    ],
  },
];
