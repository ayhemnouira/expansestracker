package com.example.backend.service.impl;

import com.example.backend.dto.document.DocumentResponse;
import com.example.backend.dto.document.DocumentUploadRequest;
import com.example.backend.entity.Document;
import com.example.backend.entity.Transaction;
import com.example.backend.entity.User;
import com.example.backend.enums.DocumentType;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.exception.UnauthorizedException;
import com.example.backend.repo.DocumentRepository;
import com.example.backend.repo.TransactionRepository;
import com.example.backend.service.DocumentService;
import com.example.backend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final TransactionRepository transactionRepository;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public DocumentResponse uploadDocument(
            MultipartFile file,
            DocumentUploadRequest request,
            User user) {

        log.info("Uploading document for user: {}", user.getId());

        // 1. Store file on disk
        String filePath = fileStorageService.storeFile(file, user.getId());

        // 2. Create document entity
        Document document = Document.builder()
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .filePath(filePath)
                .documentType(request.getDocumentType())
                .description(request.getDescription())
                .user(user)
                .isDeleted(false)
                .build();

        // 3. Link to transaction if provided
        if (request.getTransactionId() != null) {
            Transaction transaction = transactionRepository
                    .findByIdAndUserId(request.getTransactionId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Transaction not found with id: " + request.getTransactionId()
                    ));

            // Security check: Ensure transaction belongs to user
            if (!transaction.getUser().getId().equals(user.getId())) {
                throw new UnauthorizedException("You don't have permission to link to this transaction");
            }

            document.setTransaction(transaction);
            log.info("Document linked to transaction: {}", transaction.getId());
        }

        // 4. Save to database
        Document savedDocument = documentRepository.save(document);
        log.info("Document saved successfully with id: {}", savedDocument.getId());

        return mapToResponse(savedDocument);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentResponse> getUserDocuments(User user, DocumentType type) {
        log.info("Fetching documents for user: {}, type: {}", user.getId(), type);

        List<Document> documents;

        if (type != null) {
            documents = documentRepository
                    .findByUserIdAndDocumentTypeAndIsDeletedFalseOrderByUploadedAtDesc(
                            user.getId(), type
                    );
        } else {
            documents = documentRepository
                    .findByUserIdAndIsDeletedFalseOrderByUploadedAtDesc(user.getId());
        }

        return documents.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentResponse getDocumentById(Long documentId, User user) {
        log.info("Fetching document: {} for user: {}", documentId, user.getId());

        Document document = documentRepository
                .findByIdAndUserIdAndIsDeletedFalse(documentId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Document not found with id: " + documentId
                ));

        return mapToResponse(document);
    }

    @Override
    @Transactional(readOnly = true)
    public Resource downloadDocument(Long documentId, User user) {
        log.info("Downloading document: {} for user: {}", documentId, user.getId());

        // Find document with security check
        Document document = documentRepository
                .findByIdAndUserIdAndIsDeletedFalse(documentId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Document not found with id: " + documentId
                ));

        // Load file from disk
        return fileStorageService.loadFileAsResource(document.getFilePath());
    }

    @Override
    @Transactional
    public void deleteDocument(Long documentId, User user) {
        log.info("Deleting document: {} for user: {}", documentId, user.getId());

        // Find document with security check
        Document document = documentRepository
                .findByIdAndUserIdAndIsDeletedFalse(documentId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Document not found with id: " + documentId
                ));

        // Soft delete (mark as deleted)
        document.setIsDeleted(true);
        documentRepository.save(document);

        // Optional: Hard delete from disk (commented out for safety)
        // fileStorageService.deleteFile(document.getFilePath());

        log.info("Document deleted successfully: {}", documentId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentResponse> getTransactionDocuments(Long transactionId, User user) {
        log.info("Fetching documents for transaction: {}", transactionId);

        // Verify transaction belongs to user
        Transaction transaction = transactionRepository
                .findByIdAndUserId(transactionId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Transaction not found with id: " + transactionId
                ));

        List<Document> documents = documentRepository
                .findByTransactionIdAndIsDeletedFalseOrderByUploadedAtDesc(transactionId);

        return documents.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Helper: Convert Document entity to DTO
     */
    private DocumentResponse mapToResponse(Document document) {
        return DocumentResponse.builder()
                .id(document.getId())
                .fileName(document.getFileName())
                .fileType(document.getFileType())
                .fileSize(document.getFileSize())
                .fileSizeFormatted(fileStorageService.formatFileSize(document.getFileSize()))
                .documentType(document.getDocumentType())
                .description(document.getDescription())
                .transactionId(document.getTransaction() != null ?
                        document.getTransaction().getId() : null)
                .transactionName(document.getTransaction() != null ?
                        document.getTransaction().getName() : null)
                .uploadedAt(document.getUploadedAt())
                .downloadUrl("/api/documents/" + document.getId() + "/download")
                .build();
    }
}