/// <reference types="vite/client" />

// Déclarations pour les variables d'environnement
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // Ajoutez d'autres variables d'environnement ici si nécessaire
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Déclarations pour les modules qui n'ont pas de types TypeScript
declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.webp';

// Déclarations pour les modules CSS
interface CSSModuleClasses {
  [key: string]: string;
}

declare module '*.module.css' {
  const classes: CSSModuleClasses;
  export default classes;
}

declare module '*.module.scss' {
  const classes: CSSModuleClasses;
  export default classes;
}

// Déclarations pour les modules JavaScript/TypeScript
declare module '*.js';
declare module '*.jsx';
declare module '*.ts';
declare module '*.tsx';
