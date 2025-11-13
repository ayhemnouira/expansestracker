package com.example.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
@Slf4j
public class FileStorageService {

    private final Path fileStorageLocation;

    // Constructor reads upload directory from application.properties
    public FileStorageService(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir)
                .toAbsolutePath()
                .normalize();

        try {
            // Create upload directory if it doesn't exist
            Files.createDirectories(this.fileStorageLocation);
            log.info("File storage location initialized: {}", this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create upload directory!", ex);
        }
    }

    /**
     * Store uploaded file to disk
     * @param file The uploaded file
     * @param userId The user ID (for organizing files)
     * @return The relative path where file is stored (e.g., "123/123_1699876543210.jpg")
     */
    public String storeFile(MultipartFile file, Long userId) {
        // 1. Validate file
        validateFile(file);

        // 2. Generate unique filename
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = getFileExtension(originalFileName);
        String uniqueFileName = userId + "_" + System.currentTimeMillis() + fileExtension;

        try {
            // 3. Create user-specific directory (e.g., uploads/123/)
            Path userDirectory = this.fileStorageLocation.resolve(userId.toString());
            Files.createDirectories(userDirectory);

            // 4. Save file to disk
            Path targetLocation = userDirectory.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            log.info("File stored successfully: {}", targetLocation);

            // 5. Return relative path (userId/filename)
            return userId + "/" + uniqueFileName;

        } catch (IOException ex) {
            log.error("Failed to store file: {}", uniqueFileName, ex);
            throw new RuntimeException("Could not store file " + uniqueFileName + ". Please try again!", ex);
        }
    }

    /**
     * Load file as Resource for downloading
     * @param filePath The relative path (e.g., "123/123_1699876543210.jpg")
     * @return Resource representing the file
     */
    public Resource loadFileAsResource(String filePath) {
        try {
            Path file = this.fileStorageLocation.resolve(filePath).normalize();
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("File not found: " + filePath);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found: " + filePath, ex);
        }
    }

    /**
     * Delete file from disk
     * @param filePath The relative path
     */
    public void deleteFile(String filePath) {
        try {
            Path file = this.fileStorageLocation.resolve(filePath).normalize();
            Files.deleteIfExists(file);
            log.info("File deleted: {}", filePath);
        } catch (IOException ex) {
            log.error("Failed to delete file: {}", filePath, ex);
            throw new RuntimeException("Could not delete file: " + filePath, ex);
        }
    }

    /**
     * Validate uploaded file (size, type, etc.)
     */
    private void validateFile(MultipartFile file) {
        // Check if file is empty
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }

        // Check file size (max 5MB)
        long maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 5MB");
        }

        // Check file type (only PDF and images)
        String contentType = file.getContentType();
        if (!isValidFileType(contentType)) {
            throw new IllegalArgumentException(
                    "Invalid file type. Only PDF, PNG, JPG, and JPEG are allowed"
            );
        }

        // Check for malicious filename (path traversal attack)
        String fileName = file.getOriginalFilename();
        if (fileName != null && fileName.contains("..")) {
            throw new IllegalArgumentException("Filename contains invalid path sequence: " + fileName);
        }
    }

    /**
     * Check if file type is allowed
     */
    private boolean isValidFileType(String contentType) {
        if (contentType == null) {
            return false;
        }

        return contentType.equals("application/pdf") ||
                contentType.equals("image/png") ||
                contentType.equals("image/jpeg") ||
                contentType.equals("image/jpg");
    }

    /**
     * Extract file extension from filename
     */
    private String getFileExtension(String fileName) {
        if (fileName != null && fileName.contains(".")) {
            return fileName.substring(fileName.lastIndexOf("."));
        }
        return "";
    }

    /**
     * Format file size for display (e.g., 2456789 bytes → "2.34 MB")
     */
    public String formatFileSize(Long bytes) {
        if (bytes == null || bytes == 0) {
            return "0 B";
        }

        String[] units = {"B", "KB", "MB", "GB"};
        int unitIndex = 0;
        double size = bytes;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return String.format("%.2f %s", size, units[unitIndex]);
    }
}