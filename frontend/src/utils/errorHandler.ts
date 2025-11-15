export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return axiosError.response?.data?.message || "Operation failed";
  }
  
  return "An unexpected error occurred";
};

export const handleError = (error: unknown, defaultMessage: string): string => {
  const message = getErrorMessage(error);
  console.error(defaultMessage, error);
  return message;
};