import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';

declare module './toast' {
  export interface ToastProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> {
    variant?: 'default' | 'destructive' | 'success' | 'warning';
  }

  export interface ToastActionElement extends React.ReactElement {}

  export const Toast: React.ForwardRefExoticComponent<
    ToastProps & React.RefAttributes<HTMLLIElement>
  >;
  
  export const ToastTitle: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
  >;
  
  export const ToastDescription: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
  >;
  
  export const ToastClose: React.ForwardRefExoticComponent<
    React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>
  >;
  
  export const ToastAction: React.ForwardRefExoticComponent<
    React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>
  >;
  
  export const ToastViewport: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
  >;
  
  export const ToastProvider: React.FC<React.PropsWithChildren>;
}
