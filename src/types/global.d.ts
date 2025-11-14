// Déclaration pour les imports de modules
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg' {
  import React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

// Déclaration pour les chemins d'import
// Cette partie est particulièrement importante pour résoudre les problèmes de chemins
declare module '@/Pages/dashboards/AdminDashboard' {
  import { FC } from 'react';
  const AdminDashboard: FC;
  export default AdminDashboard;
}
