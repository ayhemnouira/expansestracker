import API from "./axiosConfig";

export interface Document {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileSizeFormatted: string;
  documentType: "RECEIPT" | "INVOICE" | "BANK_STATEMENT" | "CONTRACT" | "PROOF_OF_PAYMENT" | "OTHER";
  description?: string;
  transactionId?: number;
  transactionName?: string;
  uploadedAt: string;
  downloadUrl: string;
}

export interface UploadDocumentRequest {
  file: File;
  documentType: string;
  description?: string;
  transactionId?: number;
}

// Get all documents for current user
export const getUserDocuments = async (type?: string): Promise<Document[]> => {
  const params = type ? { type } : {};
  const response = await API.get<Document[]>("/api/documents", { params });
  return response.data;
};

// Get single document
export const getDocumentById = async (id: number): Promise<Document> => {
  const response = await API.get<Document>(`/api/documents/${id}`);
  return response.data;
};

// Upload document
export const uploadDocument = async (request: UploadDocumentRequest): Promise<Document> => {
  const formData = new FormData();
  formData.append("file", request.file);
  formData.append("documentType", request.documentType);
  
  if (request.description) {
    formData.append("description", request.description);
  }
  
  if (request.transactionId) {
    formData.append("transactionId", request.transactionId.toString());
  }

  const response = await API.post<Document>("/api/documents", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  return response.data;
};

// Download document
export const downloadDocument = async (id: number, fileName: string): Promise<void> => {
  const response = await API.get(`/api/documents/${id}/download`, {
    responseType: "blob",
  });

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Delete document
export const deleteDocument = async (id: number): Promise<void> => {
  await API.delete(`/api/documents/${id}`);
};

// Get documents for a specific transaction
export const getTransactionDocuments = async (transactionId: number): Promise<Document[]> => {
  const response = await API.get<Document[]>(`/api/documents/transaction/${transactionId}`);
  return response.data;
};