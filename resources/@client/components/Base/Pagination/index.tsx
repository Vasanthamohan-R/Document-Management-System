import { twMerge } from "tailwind-merge";
import Lucide from "@/components/Base/Lucide";

interface PaginationProps {
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    totalItems?: number;
    itemsPerPage?: number;
    className?: string;
    maxPagesToShow?: number;
}

const Pagination = ({
    totalPages,
    currentPage,
    onPageChange,
    totalItems = 0,
    itemsPerPage = 10,
    className,
    maxPagesToShow = 5,
}: PaginationProps) => {
    if (totalPages <= 1 && totalItems <= itemsPerPage) return null;

    const getPageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = [];

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            const half = Math.floor(maxPagesToShow / 2);
            let start = Math.max(1, currentPage - half);
            let end = Math.min(totalPages, start + maxPagesToShow - 1);

            if (end - start + 1 < maxPagesToShow) {
                start = Math.max(1, end - maxPagesToShow + 1);
            }

            if (start > 1) {
                pages.push(1);
                if (start > 2) pages.push("...");
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages) {
                if (end < totalPages - 1) pages.push("...");
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div
            className={twMerge("flex items-center justify-between", className)}
        >
            {/* Left side - Results info */}
            {totalItems > 0 && (
                <div className="text-sm text-slate-500">
                    Results: {startItem} - {endItem} of {totalItems}
                </div>
            )}

            {/* Right side - Pagination buttons */}
            <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Lucide
                        icon="ChevronLeft"
                        strokeWidth={2}
                        className="w-4 h-4"
                    />
                </button>

                {/* Page Numbers */}
                {pageNumbers.map((page, index) =>
                    page === "..." ? (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-2 text-sm text-slate-400"
                        >
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page as number)}
                            className={twMerge(
                                "min-w-[32px] h-8 px-2 text-sm rounded transition-all",
                                currentPage === page
                                    ? "bg-blue-600 text-white font-medium"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
                            )}
                        >
                            {page}
                        </button>
                    ),
                )}

                {/* Next Button */}
                <button
                    onClick={() =>
                        onPageChange(Math.min(currentPage + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Lucide
                        icon="ChevronRight"
                        strokeWidth={2}
                        className="w-4 h-4"
                    />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
