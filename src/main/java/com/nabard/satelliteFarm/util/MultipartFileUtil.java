package com.nabard.satelliteFarm.util;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.ByteArrayResource;
import java.io.IOException;

public class MultipartFileUtil {
    public static MultipartFile toMultipartFile(byte[] content, String name) {
        return new MultipartFileAdapter(name, content);
    }

    // Adapter for MultipartFile using ByteArrayResource
    public static class MultipartFileAdapter implements MultipartFile {
        private final String name;
        private final byte[] content;

        public MultipartFileAdapter(String name, byte[] content) {
            this.name = name;
            this.content = content;
        }

        @Override
        public String getName() {
            return name;
        }

        @Override
        public String getOriginalFilename() {
            return name + ".png";
        }

        @Override
        public String getContentType() {
            return "image/png";
        }

        @Override
        public boolean isEmpty() {
            return content == null || content.length == 0;
        }

        @Override
        public long getSize() {
            return content.length;
        }

        @Override
        public byte[] getBytes() throws IOException {
            return content;
        }

        @Override
        public java.io.InputStream getInputStream() throws IOException {
            return new java.io.ByteArrayInputStream(content);
        }

        @Override
        public void transferTo(java.io.File dest) throws IOException, IllegalStateException {
            try (java.io.FileOutputStream fos = new java.io.FileOutputStream(dest)) {
                fos.write(content);
            }
        }
    }
}
