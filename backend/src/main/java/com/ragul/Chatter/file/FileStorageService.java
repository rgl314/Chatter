package com.ragul.Chatter.file;

import com.ragul.Chatter.message.Message;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public String store(MultipartFile file) {
        try {
            validate(file);

            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
            String storedName = UUID.randomUUID() + (extension != null ? "." + extension : "");

            Path target = uploadPath.resolve(storedName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            return "/files/" + storedName; // served back to client as a URL path
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    private void validate(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > 20 * 1024 * 1024) { // 20MB cap
            throw new IllegalArgumentException("File too large");
        }

        String contentType = file.getContentType();
        if (contentType == null || !isAllowed(contentType)) {
            throw new IllegalArgumentException("Unsupported file type: " + contentType);
        }
    }

    private boolean isAllowed(String contentType) {
        return contentType.startsWith("image/")
                || contentType.startsWith("audio/")
                || contentType.startsWith("video/");
    }

    public static Message.MessageType resolveMessageType(String contentType) {
        if (contentType.startsWith("image/")) return Message.MessageType.IMAGE;
        if (contentType.startsWith("audio/")) return Message.MessageType.AUDIO;
        if (contentType.startsWith("video/")) return Message.MessageType.VIDEO;
        throw new IllegalArgumentException("Unsupported type: " + contentType);
    }

}
