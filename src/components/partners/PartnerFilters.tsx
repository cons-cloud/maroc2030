import React from 'react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import Button from "@/components/ui/button";

type PartnerFiltersProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: 'all' | 'verified' | 'pending';
  onStatusChange: (value: 'all' | 'verified' | 'pending') => void;
  filterRole: 'all' | 'partner_hotel' | 'partner_car' | 'partner_tour';
  onRoleChange: (value: 'all' | 'partner_hotel' | 'partner_car' | 'partner_tour') => void;
  onResetFilters: () => void;
};

const PartnerFilters: React.FC<PartnerFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterRole,
  onRoleChange,
  onResetFilters,
}) => {
  const hasActiveFilters = 
    searchTerm !== '' || 
    filterStatus !== 'all' || 
    filterRole !== 'all';

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Rechercher un partenaire..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Rechercher un partenaire"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select
          value={filterStatus}
          onValueChange={(value: 'all' | 'verified' | 'pending') => onStatusChange(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="verified">Vérifiés</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center">
        <Select
          value={filterRole}
          onValueChange={(value: 'all' | 'partner_hotel' | 'partner_car' | 'partner_tour') => onRoleChange(value as any)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type de partenaire" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="partner_hotel">Hôtel</SelectItem>
            <SelectItem value="partner_car">Voiture</SelectItem>
            <SelectItem value="partner_tour">Tour opérateur</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {hasActiveFilters && (
        <Button
          variant="ghost"
          onClick={onResetFilters}
          className="flex items-center gap-2 text-sm"
        >
          <X className="h-4 w-4" />
          Réinitialiser
        </Button>
      )}
    </div>
  );
};

export default React.memo(PartnerFilters);
