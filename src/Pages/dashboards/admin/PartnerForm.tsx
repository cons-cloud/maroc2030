import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface PartnerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner?: any;
  onSuccess: () => void;
}

const PartnerForm: React.FC<PartnerFormProps> = ({ open, onOpenChange, partner, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    company_name: '',
    phone: '',
    role: 'partner_hotel',
    address: '',
    city: '',
    country: 'Morocco',
    is_verified: true,
  });
  const { toast } = useToast();

  // Remplir le formulaire avec les données du partenaire en mode édition
  useEffect(() => {
    if (partner) {
      setFormData({
        email: partner.email || '',
        password: '',
        full_name: partner.full_name || '',
        company_name: partner.company_name || '',
        phone: partner.phone || '',
        role: partner.role || 'partner_hotel',
        address: partner.address || '',
        city: partner.city || '',
        country: partner.country || 'Morocco',
        is_verified: partner.is_verified || false,
      });
    } else {
      // Réinitialiser le formulaire pour un nouveau partenaire
      setFormData({
        email: '',
        password: '',
        full_name: '',
        company_name: '',
        phone: '',
        role: 'partner_hotel',
        address: '',
        city: '',
        country: 'Morocco',
        is_verified: true,
      });
    }
  }, [partner, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (partner) {
        // Mise à jour d'un partenaire existant
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            company_name: formData.company_name,
            phone: formData.phone,
            role: formData.role,
            address: formData.address,
            city: formData.city,
            country: formData.country,
            is_verified: formData.is_verified,
            updated_at: new Date().toISOString(),
          })
          .eq('id', partner.id);

        if (error) throw error;

        toast.success('Succès', 'Le partenaire a été mis à jour avec succès.');
      } else {
        // Création d'un nouveau partenaire
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
              company_name: formData.company_name,
              phone: formData.phone,
              role: formData.role,
              address: formData.address,
              city: formData.city,
              country: formData.country,
              is_verified: formData.is_verified,
            },
          },
        });

        if (authError) throw authError;

        toast.success('Succès', 'Le partenaire a été créé avec succès.');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving partner:', error);
      toast.error('Erreur', error.message || 'Une erreur est survenue lors de la sauvegarde du partenaire.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{partner ? 'Modifier le partenaire' : 'Ajouter un partenaire'}</DialogTitle>
          <DialogDescription>
            {partner 
              ? 'Mettez à jour les informations du partenaire.'
              : 'Remplissez les champs pour ajouter un nouveau partenaire.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nom complet *</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                placeholder="Nom et prénom"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company_name">Nom de l'entreprise *</Label>
              <Input
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
                placeholder="Nom de l'entreprise"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required={!partner}
                disabled={!!partner}
                placeholder="email@exemple.com"
              />
            </div>
            
            {!partner && (
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+212 6 12 34 56 78"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Type de partenaire *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleSelectChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="partner_hotel">Hôtel</SelectItem>
                  <SelectItem value="partner_car">Location de voiture</SelectItem>
                  <SelectItem value="partner_tour">Tour opérateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Adresse complète"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Ville"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Pays"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                id="is_verified"
                name="is_verified"
                type="checkbox"
                checked={formData.is_verified}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="is_verified" className="text-sm font-medium leading-none">
                Partenaire vérifié
              </Label>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {partner ? 'Mettre à jour' : 'Créer le partenaire'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerForm;
