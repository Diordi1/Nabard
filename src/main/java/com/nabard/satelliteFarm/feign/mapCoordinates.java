package com.nabard.satelliteFarm.feign;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "map-client", url = "https://nabard-visitor-backend.onrender.com")
public interface mapCoordinates {
    @GetMapping("/api/get-all-coordinates")
    public List<com.nabard.satelliteFarm.model.FarmerCoordinateResponse> getAllCoordinates();
}
