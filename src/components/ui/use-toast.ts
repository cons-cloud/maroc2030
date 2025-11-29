import { useToast as useShadcnToast, type ToasterToast } from '@/components/ui/use-toast-shadcn';

type Toast = Omit<ToasterToast, 'open' | 'onOpenChange'> & {
  id?: string;
};

export function useToast() {
  const { toast: shadcnToast } = useShadcnToast();

  const toast = (props: Toast) => {
    const { title, description, variant = 'default', duration = 5000 } = props;
    
    const toastProps: any = {
      title,
      description,
      variant,
      duration,
    };
    
    // Ajouter un ID aléatoire si non fourni
    if (!props.id) {
      toastProps.id = Math.random().toString(36).substr(2, 9);
    }
    
    shadcnToast(toastProps);
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  toast.success = (title: string, description?: string, duration?: number) => {
    toast({ 
      id: generateId(),
      title, 
      description, 
      variant: 'success', 
      duration 
    });
  };

  toast.error = (title: string, description?: string, duration?: number) => {
    toast({ 
      id: generateId(),
      title, 
      description, 
      variant: 'destructive', 
      duration 
    });
  };

  toast.warning = (title: string, description?: string, duration?: number) => {
    toast({ 
      id: generateId(),
      title, 
      description, 
      variant: 'warning', 
      duration 
    });
  };

  toast.info = (title: string, description?: string, duration?: number) => {
    toast({ 
      id: generateId(),
      title,
      description,
      variant: 'default',
      duration
    });
  };

  return { toast };
}

export { default as Toaster } from '@/components/ui/toaster';
