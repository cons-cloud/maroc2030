import { Search, Filter as FilterIcon, X } from 'lucide-react';
import { Input } from './input';
import Button from './Button';

// Composant Select simplifié pour éviter les problèmes d'importation
const SimpleSelect = ({
  value,
  onValueChange,
  children,
  className = '',
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className={`block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm ${className}`}
  >
    {children}
  </select>
);

const SelectItem = ({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) => (
  <option value={value}>
    {children}
  </option>
);

export interface FilterOption {
  value: string;
  label: string;
}

export interface DataTableFiltersProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterOptions?: {
    label: string;
    value: string;
    options: FilterOption[];
    onValueChange: (value: string) => void;
  }[];
  onResetFilters?: () => void;
  className?: string;
}

export const DataTableFilters = ({
  searchPlaceholder = 'Rechercher...',
  searchValue,
  onSearchChange,
  filterOptions = [],
  onResetFilters,
  className = '',
}: DataTableFiltersProps) => {
  const hasActiveFilters = searchValue || filterOptions.some(opt => opt.value);

  return (
    <div className={`flex flex-col sm:flex-row gap-3 mb-6 ${className}`}>
      {/* Champ de recherche */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-full"
          aria-label="Rechercher"
        />
      </div>

      {/* Filtres */}
      {filterOptions.map((filter) => (
        <div key={filter.label} className="w-full sm:w-auto">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FilterIcon className="h-4 w-4 text-gray-400" />
            </div>
            <SimpleSelect
              value={filter.value}
              onValueChange={filter.onValueChange}
              className="pl-10 w-full sm:w-[180px]"
            >
              <SelectItem value="">Tous</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SimpleSelect>
          </div>
        </div>
      ))}

      {/* Bouton de réinitialisation */}
      {hasActiveFilters && onResetFilters && (
        <Button
          variant="ghost"
          onClick={onResetFilters}
          className="shrink-0"
        >
          <X className="mr-2 h-4 w-4" />
          Réinitialiser
        </Button>
      )}
    </div>
  );
};

export default DataTableFilters;
