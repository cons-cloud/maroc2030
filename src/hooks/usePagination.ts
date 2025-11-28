import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface UsePaginationProps {
  /** Page initiale (par défaut: 1) */
  initialPage?: number;
  /** Nombre d'éléments par page (par défaut: 10) */
  itemsPerPage?: number;
  /** Nombre total d'éléments (par défaut: 0) */
  totalItems?: number;
  /** Nombre maximal de pages à afficher dans la pagination (par défaut: 5) */
  maxVisiblePages?: number;
  /** Appelé lorsque la page change */
  onPageChange?: (page: number) => void;
  /** Appelé lorsque le nombre d'éléments par page change */
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  /** Si vrai, synchronise la page avec les paramètres d'URL (par défaut: false) */
  syncWithUrl?: boolean;
  /** Clé à utiliser pour la page dans les paramètres d'URL (par défaut: 'page') */
  pageParamName?: string;
  /** Clé à utiliser pour le nombre d'éléments par page dans les paramètres d'URL (par défaut: 'perPage') */
  perPageParamName?: string;
}

export interface UsePaginationReturn {
  /** Page actuelle */
  currentPage: number;
  /** Nombre total de pages */
  totalPages: number;
  /** Nombre d'éléments par page */
  itemsPerPage: number;
  /** Nombre total d'éléments */
  totalItems: number;
  /** Tableau des numéros de page à afficher */
  visiblePageNumbers: number[];
  /** Aller à la page suivante */
  nextPage: () => void;
  /** Aller à la page précédente */
  prevPage: () => void;
  /** Aller à une page spécifique */
  goToPage: (page: number) => void;
  /** Définir le nombre d'éléments par page */
  setItemsPerPage: (count: number) => void;
  /** Mettre à jour le nombre total d'éléments */
  updateTotalItems: (count: number) => void;
  /** Vérifie si on peut aller à la page précédente */
  canGoBack: boolean;
  /** Vérifie si on peut aller à la page suivante */
  canGoForward: boolean;
  /** Indices de début et de fin des éléments de la page actuelle */
  range: { start: number; end: number };
}

const usePagination = ({
  initialPage = 1,
  itemsPerPage: initialItemsPerPage = 10,
  totalItems: initialTotalItems = 0,
  maxVisiblePages = 5,
  onPageChange,
  onItemsPerPageChange,
  syncWithUrl = false,
  pageParamName = 'page',
  perPageParamName = 'perPage',
}: UsePaginationProps = {}): UsePaginationReturn => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialiser l'état depuis les paramètres d'URL si syncWithUrl est activé
  const getInitialState = useCallback(() => {
    if (!syncWithUrl) {
      return {
        page: initialPage,
        perPage: initialItemsPerPage,
      };
    }

    const pageFromUrl = parseInt(searchParams.get(pageParamName) || '', 10);
    const perPageFromUrl = parseInt(searchParams.get(perPageParamName) || '', 10);

    return {
      page: !isNaN(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : initialPage,
      perPage: !isNaN(perPageFromUrl) && perPageFromUrl > 0 ? perPageFromUrl : initialItemsPerPage,
    };
  }, [initialPage, initialItemsPerPage, searchParams, syncWithUrl, pageParamName, perPageParamName]);

  const { page: initialPageState, perPage: initialItemsPerPageState } = getInitialState();
  
  const [currentPage, setCurrentPage] = useState(initialPageState);
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPageState);
  const [totalItems, setTotalItems] = useState(initialTotalItems);
  
  // Calculer le nombre total de pages
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Mettre à jour les paramètres d'URL si syncWithUrl est activé
  useEffect(() => {
    if (!syncWithUrl) return;

    const params = new URLSearchParams(searchParams);
    
    if (currentPage > 1) {
      params.set(pageParamName, currentPage.toString());
    } else {
      params.delete(pageParamName);
    }
    
    if (itemsPerPage !== 10) { // 10 est la valeur par défaut
      params.set(perPageParamName, itemsPerPage.toString());
    } else {
      params.delete(perPageParamName);
    }
    
    setSearchParams(params, { replace: true });
  }, [currentPage, itemsPerPage, searchParams, setSearchParams, syncWithUrl, pageParamName, perPageParamName]);

  // Mettre à jour la page courante si elle dépasse le nombre total de pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Appeler le callback quand la page change
  useEffect(() => {
    onPageChange?.(currentPage);
  }, [currentPage, onPageChange]);

  // Appeler le callback quand le nombre d'éléments par page change
  useEffect(() => {
    onItemsPerPageChange?.(itemsPerPage);
  }, [itemsPerPage, onItemsPerPageChange]);

  // Calculer les numéros de page visibles pour la pagination
  const visiblePageNumbers = useMemo(() => {
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages, maxVisiblePages]);

  const goToPage = useCallback(
    (page: number) => {
      const newPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(newPage);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  const setItemsPerPage = useCallback((count: number) => {
    setItemsPerPageState(count);
    setCurrentPage(1); // Reset à la première page quand on change le nombre d'éléments par page
  }, []);

  const updateTotalItems = useCallback((count: number) => {
    setTotalItems(count);
  }, []);

  // Calculer si on peut naviguer en arrière ou en avant
  const canGoBack = currentPage > 1;
  const canGoForward = currentPage < totalPages;
  
  // Calculer la plage d'éléments de la page actuelle
  const range = {
    start: (currentPage - 1) * itemsPerPage + 1,
    end: Math.min(currentPage * itemsPerPage, totalItems)
  };

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    visiblePageNumbers,
    nextPage,
    prevPage,
    goToPage,
    setItemsPerPage,
    updateTotalItems,
    canGoBack,
    canGoForward,
    range,
  };
};

export default usePagination;
