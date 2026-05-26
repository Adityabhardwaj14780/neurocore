const formatResponse = (success: boolean, message: string, data?: any) => {
  return {
    success,
    message,
    timestamp: new Date().toISOString(),
    data
  };
};

const paginate = (page: number, limit: number, total: number) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev
  };
};

export default {
  formatResponse,
  paginate
};