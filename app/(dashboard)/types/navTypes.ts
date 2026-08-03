export interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "default" | "ghost";
}

export interface SuperAdminNavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "default" | "ghost";
}
