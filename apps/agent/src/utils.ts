import axios from "axios";

export function formatError(error: any): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const method = error.config?.method?.toUpperCase();
    const url = error.config?.url;
    const message = error.message;
    const responseData = error.response?.data
      ? JSON.stringify(error.response.data)
      : "";

    // Cleaner error message
    let output = `AxiosError: ${message}`;
    if (status) output += ` (Status: ${status})`;
    if (method && url) output += ` [${method} ${url}]`;
    if (responseData) output += `\nResponse: ${responseData}`;

    return output;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
