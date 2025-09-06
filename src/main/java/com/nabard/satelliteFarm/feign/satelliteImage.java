package com.nabard.satelliteFarm.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "satellite-image", url = "https://sh.dataspace.copernicus.eu")
public interface satelliteImage {
    @PostMapping(value = "/api/v1/process", produces = "image/png")
    byte[] processImage(
            @RequestHeader("Authorization") String bearerToken,
            @RequestBody com.nabard.satelliteFarm.model.SatelliteProcessRequest requestBody);
}
