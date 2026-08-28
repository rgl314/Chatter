package com.ragul.Chatter.file;

import com.ragul.Chatter.message.Message;
import com.ragul.Chatter.message.MessageRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;

@RestController
@RequiredArgsConstructor
public class FileDownloadController {

    private final MessageRepository messageRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<Resource> download(@PathVariable String filename, Principal principal) throws IOException {
        String requesterId = principal.getName();
        String fileUrl = "/files/" + filename;

        Message message = messageRepository.findByContent(fileUrl)
                .orElseThrow(() -> new EntityNotFoundException("File not found"));

        boolean isParticipant = requesterId.equals(message.getSenderId())
                || requesterId.equals(message.getRecipientId());

        if (!isParticipant) {
            throw new AccessDeniedException("You don't have access to this file");
        }

        Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new EntityNotFoundException("File not found on disk");
        }

        String contentType = Files.probeContentType(filePath);

        return ResponseEntity.ok()
                .contentType(contentType != null ? MediaType.parseMediaType(contentType) : MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

}
