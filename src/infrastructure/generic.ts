export type Response<T> = {
  result: T;
};

export type ResponseMulti<T> = {
  result: T[];
};

export type PaginatedResponse<T> = {
  result: T[];
  context: number;
  left: number;
};

export type ErrorDetail = {
  path: string;
  type: string;
};

export type ErrorResult = {
  message: string;
  detail: ErrorDetail;
};
export type ErrorResponse = {
  result: ErrorResult[];
};
