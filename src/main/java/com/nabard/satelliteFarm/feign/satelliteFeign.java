package com.nabard.satelliteFarm.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import com.nabard.satelliteFarm.model.NdviChangeResult;
import com.nabard.satelliteFarm.model.arraySatellite;

@FeignClient(name = "satellite-service", url = "https://vigilant-space-parakeet-pjgpx76g49v536vjw-8000.app.github.dev")
public interface satelliteFeign {
    @PostMapping(value = "/compare_ndvi/", consumes = "multipart/form-data")
    NdviChangeResult compareNdvi(@RequestPart("before") org.springframework.web.multipart.MultipartFile before,
            @RequestPart("after") org.springframework.web.multipart.MultipartFile after);
}
