export interface OfficialMerchandiseProduct {
  id: string;
  name: string;
  shortName?: string;
  category: OfficialMerchandiseCategory;
  description: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  accentClass?: string;
  iconName?: string;
  sizes?: string[];
  tags: string[];
  comingSoon: boolean;
  launchAt?: string;
  featured?: boolean;
  active: boolean;
  purchaseEnabled?: boolean;
}
