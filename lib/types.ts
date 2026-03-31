export interface NavItem {
  label: string;
  href: string;
}

export interface CheckmarkFeature {
  text: string;
}

export interface FeatureSectionData {
  id: string;
  title: string;
  titleHighlight?: string;
  description: string;
  features: CheckmarkFeature[];
  imageAlt: string;
  imageSide: 'left' | 'right';
  mockupLabel?: string;
}
