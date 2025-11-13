package com.example.backend.service;

import com.example.backend.dto.document.DocumentResponse;
import com.example.backend.dto.document.DocumentUploadRequest;
import com.example.backend.entity.User;
import com.example.backend.enums.DocumentType;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DocumentService {
    DocumentResponse uploadDocument(MultipartFile file, DocumentUploadRequest request, User user);
    List<DocumentResponse> getUserDocuments(User user, DocumentType type);
    DocumentResponse getDocumentById(Long documentId, User user);
    Resource downloadDocument(Long documentId, User user);
    void deleteDocument(Long documentId, User user);
    List<DocumentResponse> getTransactionDocuments(Long transactionId, User user);
}