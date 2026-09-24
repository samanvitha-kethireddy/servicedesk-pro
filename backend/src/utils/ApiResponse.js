'use strict';

class ApiResponse {
  
  constructor(statusCode, message = 'Success', data = null, meta = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;

    if (meta !== null) {
      this.meta = meta;
    }
  }

  static buildPaginationMeta(totalCount, page, limit) {
    const totalPages = limit > 0 ? Math.ceil(totalCount / limit) : 0;
    return {
      totalCount,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  
  static paginated(statusCode, message, data, totalCount, page, limit) {
    return new ApiResponse(
      statusCode,
      message,
      data,
      ApiResponse.buildPaginationMeta(totalCount, page, limit)
    );
  }
}

module.exports = ApiResponse;