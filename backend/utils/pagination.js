function paginateUtil(page, limit, totalCount) {
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.max(parseInt(limit, 10) || 5, 1);
    const totalPages = Math.max(Math.ceil(totalCount / parsedLimit), 1);
    const currentPage = Math.min(parsedPage, totalPages);
    const offset = (currentPage - 1) * parsedLimit;

    return {
        limit: parsedLimit,
        offset,
        totalCount,
        totalPages,
        currentPage,
        hasPrevPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
        prevPage: currentPage > 1 ? currentPage - 1 : null,
        nextPage: currentPage < totalPages ? currentPage + 1 : null,
    };
}

exports.paginateUtil = paginateUtil;
