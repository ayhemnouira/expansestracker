package com.example.backend.dto.document;

import com.example.backend.enums.DocumentType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DocumentUploadRequest {

    @NotNull(message = "Document type is required")
    private DocumentType documentType;

    private String description;

    private Long transactionId; // Optional: link to transaction
}