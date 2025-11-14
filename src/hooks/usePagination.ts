import { useState, useCallback, useEffect } from 'react';

interface UsePaginationProps {
  initialPage?: number;
  itemsPerPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
}

interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  updateTotalItems: (count: number) => void;
}

const usePagination = ({
  initialPage = 1,
  itemsPerPage: initialItemsPerPage = 10,
  totalItems: initialTotalItems = 0,
  onPageChange,
}: UsePaginationProps = {}): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);
  const [totalItems, setTotalItems] = useState(initialTotalItems);
  
  // Calculer le nombre total de pages
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Mettre à jour la page courante si elle dépasse le nombre total de pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Appeler le callback quand la page change
  useEffect(() => {
    if (onPageChange) {
      onPageChange(currentPage);
    }
  }, [currentPage, onPageChange]);

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

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    nextPage,
    prevPage,
    goToPage,
    setItemsPerPage,
    updateTotalItems,
  };
};

export default usePagination;
