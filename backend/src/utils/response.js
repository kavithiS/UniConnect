export const successResponse = (data, message = 'Success', statusCode = 200) => ({
  success: true,
  statusCode,
  message,
  data,
});

export const errorResponse = (message = 'Error', statusCode = 500, error = null) => ({
  success: false,
  statusCode,
  message,
  ...(error && { error }),
});

export default { successResponse, errorResponse };
