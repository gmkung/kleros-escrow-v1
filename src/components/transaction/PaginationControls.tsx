
import React from 'react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ 
  currentPage, 
  totalPages,
  onPageChange
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // If there are fewer pages than maxPagesToShow, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, last page, current page, and pages around current
      if (currentPage <= 3) {
        // If current page is near the start
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(null); // Ellipsis
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // If current page is near the end
        pages.push(1);
        pages.push(null); // Ellipsis
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // If current page is in the middle
        pages.push(1);
        pages.push(null); // Ellipsis
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push(null); // Ellipsis
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <Pagination className="mb-12">
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => onPageChange(currentPage - 1)}
              className="cursor-pointer bg-tron-dark/80 text-violet-200 hover:bg-violet-900/40 hover:text-violet-100 border-violet-700/30"
            />
          </PaginationItem>
        )}
        
        {getPageNumbers().map((page, i) => (
          page === null ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationLink
                className="cursor-default bg-transparent text-violet-300"
              >
                ...
              </PaginationLink>
            </PaginationItem>
          ) : (
            <PaginationItem key={`page-${page}`}>
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => onPageChange(page as number)}
                className={`cursor-pointer ${page === currentPage
                  ? 'bg-violet-600/70 text-violet-100 border-violet-500'
                  : 'bg-tron-dark/80 text-violet-300 hover:bg-violet-900/40 hover:text-violet-100 border-violet-700/30'
                }`}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        ))}
        
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext 
              onClick={() => onPageChange(currentPage + 1)}
              className="cursor-pointer bg-tron-dark/80 text-violet-200 hover:bg-violet-900/40 hover:text-violet-100 border-violet-700/30"
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationControls;
