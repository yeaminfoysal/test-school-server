export class ApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: any;

  constructor(statusCode: number, data: any, message = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

export class PaginatedResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };

  constructor(
    statusCode: number,
    data: any[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    },
    message = 'Success'
  ) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
  }
}