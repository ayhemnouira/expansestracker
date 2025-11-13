package com.example.backend.controller;

import com.example.backend.dto.document.DocumentResponse;
import com.example.backend.dto.document.DocumentUploadRequest;
import com.example.backend.entity.User;
import com.example.backend.enums.DocumentType;
import com.example.backend.service.DocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Slf4j
public class DocumentController {

    private final DocumentService documentService;

    /**
     * Upload a new document
     * POST /api/documents
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") DocumentType documentType,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Long transactionId,
            @AuthenticationPrincipal User user) {

        log.info("Upload request received from user: {}", user.getId());

        DocumentUploadRequest request = new DocumentUploadRequest();
        request.setDocumentType(documentType);
        request.setDescription(description);
        request.setTransactionId(transactionId);

        DocumentResponse response = documentService.uploadDocument(file, request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all documents for current user (with optional filtering by type)
     * GET /api/documents?type=RECEIPT
     */
    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getUserDocuments(
            @RequestParam(required = false) DocumentType type,
            @AuthenticationPrincipal User user) {

        log.info("Fetching documents for user: {}", user.getId());

        List<DocumentResponse> documents = documentService.getUserDocuments(user, type);
        return ResponseEntity.ok(documents);
    }

    /**
     * Get a specific document by ID
     * GET /api/documents/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> getDocumentById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        log.info("Fetching document: {} for user: {}", id, user.getId());

        DocumentResponse document = documentService.getDocumentById(id, user);
        return ResponseEntity.ok(document);
    }

    /**
     * Download a document
     * GET /api/documents/{id}/download
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        log.info("Download request for document: {} from user: {}", id, user.getId());

        Resource resource = documentService.downloadDocument(id, user);

        // Set content type based on file extension
        String contentType = "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    /**
     * Delete a document
     * DELETE /api/documents/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        log.info("Delete request for document: {} from user: {}", id, user.getId());

        documentService.deleteDocument(id, user);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all documents linked to a specific transaction
     * GET /api/documents/transaction/{transactionId}
     */
    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<List<DocumentResponse>> getTransactionDocuments(
            @PathVariable Long transactionId,
            @AuthenticationPrincipal User user) {

        log.info("Fetching documents for transaction: {}", transactionId);

        List<DocumentResponse> documents = documentService.getTransactionDocuments(transactionId, user);
        return ResponseEntity.ok(documents);
    }
}