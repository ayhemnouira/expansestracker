package com.example.backend.dto.document;

import com.example.backend.enums.DocumentType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DocumentResponse {
    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String fileSizeFormatted; // e.g., "2.5 MB"
    private DocumentType documentType;
    private String description;
    private Long transactionId;
    private String transactionName;
    private LocalDateTime uploadedAt;
    private String downloadUrl;
}