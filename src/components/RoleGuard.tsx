import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'partner' | 'client')[];
  redirectTo?: string;
}

/**
 * RoleGuard - Protège les routes selon le rôle de l'utilisateur
 * 
 * Utilisation :
 * <RoleGuard allowedRoles={['admin']}>
 *   <AdminDashboard />
 * </RoleGuard>
 */
const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles,
  redirectTo = '/' 
}) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      // Si pas connecté, rediriger vers login
      if (!user) {
        navigate('/login', { 
          state: { from: window.location.pathname },
          replace: true 
        });
        return;
      }

      // Si pas de profil, rediriger
      if (!profile) {
        console.warn('Accès refusé: pas de profil');
        navigate(redirectTo, { replace: true });
        return;
      }

      // Vérifier le rôle (gérer les variantes de partner)
      const userRole = profile.role?.toLowerCase() || '';
      const isPartner = userRole === 'partner' || userRole.startsWith('partner_');
      const isAdmin = userRole === 'admin';
      
      console.log('Vérification des rôles - Rôle utilisateur:', userRole);
      console.log('Rôles autorisés:', allowedRoles);
      
      let hasAccess = false;
      
      // Si l'utilisateur est admin, il a accès à tout
      if (isAdmin) {
        hasAccess = true;
      } else {
        hasAccess = allowedRoles.some(role => {
          // Si le rôle autorisé est 'partner' et que l'utilisateur est un partenaire
          if (role === 'partner' && isPartner) return true;
          // Si le rôle de l'utilisateur correspond exactement au rôle autorisé
          if (userRole === role.toLowerCase()) return true;
          // Pour les partenaires avec des rôles spécifiques (partner_*)
          if (isPartner && role === 'partner') return true;
          return false;
        });
      }
      
      console.log('Accès accordé:', hasAccess, { userRole, isPartner, isAdmin, allowedRoles });
      
      console.log('Accès accordé:', hasAccess);

      if (!hasAccess) {
        console.warn(`Accès refusé: rôle ${profile.role} non autorisé pour cette page`);
        console.warn(`Rôles autorisés:`, allowedRoles);
        navigate(redirectTo, { replace: true });
        return;
      }
    }
  }, [user, profile, loading, allowedRoles, navigate, redirectTo]);

  // Afficher le loading pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Si pas connecté ou pas de profil, ne rien afficher
  if (!user || !profile) {
    return null;
  }

  // Vérifier le rôle final
  const userRole = profile.role?.toLowerCase() || '';
  const isPartner = userRole === 'partner' || userRole.startsWith('partner_');
  const isAdmin = userRole === 'admin';
  
  console.log('Vérification finale des rôles - Rôle utilisateur:', userRole);
  console.log('Rôles autorisés:', allowedRoles);
  
  let hasAccess = false;
  
  // Si l'utilisateur est admin, il a accès à tout
  if (isAdmin) {
    hasAccess = true;
  } else {
    hasAccess = allowedRoles.some(role => {
      if (role === 'partner' && isPartner) return true;
      return userRole === role.toLowerCase();
    });
  }
  
  console.log('Accès final accordé:', hasAccess);

  if (!hasAccess) {
    return null;
  }

  // Si tout est OK, afficher le contenu
  return <>{children}</>;
};

export default RoleGuard;
