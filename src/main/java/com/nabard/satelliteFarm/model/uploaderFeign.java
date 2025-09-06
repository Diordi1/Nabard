package com.nabard.satelliteFarm.model;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;

@FeignClient(name = "uploader", url = "https://uploader-uf4n.onrender.com")
public interface uploaderFeign {
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public List<String> uploadFile(@RequestPart("file") org.springframework.web.multipart.MultipartFile file[]);
}
