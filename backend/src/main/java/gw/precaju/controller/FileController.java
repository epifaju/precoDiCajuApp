package gw.precaju.controller;

import gw.precaju.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/files")
@CrossOrigin(origins = "*")
public class FileController {

    private static final Logger logger = LoggerFactory.getLogger(FileController.class);

    private final FileStorageService fileStorageService;

    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String fileName = fileStorageService.storeFile(file);
            String fileUrl = fileStorageService.getFileUrl(fileName);
            
            Map<String, String> response = new HashMap<>();
            response.put("fileName", fileName);
            response.put("fileUrl", fileUrl);
            response.put("fileSize", String.valueOf(file.getSize()));
            response.put("contentType", file.getContentType());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error uploading file", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        try {
            // Validate filename
            if (!fileStorageService.fileExists(fileName)) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = fileStorageService.getFilePath(fileName);
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            // Determine content type
            String contentType = determineContentType(fileName);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            logger.error("Error downloading file: {}", fileName, e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Unexpected error downloading file: {}", fileName, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{fileName:.+}")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFile(@PathVariable String fileName) {
        try {
            if (!fileStorageService.fileExists(fileName)) {
                return ResponseEntity.notFound().build();
            }

            fileStorageService.deleteFile(fileName);
            return ResponseEntity.noContent().build();

        } catch (Exception e) {
            logger.error("Error deleting file: {}", fileName, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getFileUploadInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("maxFileSize", fileStorageService.getMaxFileSize());
        info.put("maxFileSizeMB", fileStorageService.getMaxFileSize() / 1024 / 1024);
        info.put("allowedTypes", new String[]{"image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"});
        info.put("allowedExtensions", new String[]{".jpg", ".jpeg", ".png", ".gif", ".webp"});
        
        return ResponseEntity.ok(info);
    }

    private String determineContentType(String fileName) {
        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        
        return switch (extension) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            default -> "application/octet-stream";
        };
    }
}
