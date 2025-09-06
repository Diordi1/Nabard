package com.nabard.satelliteFarm.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.nabard.satelliteFarm.model.santinelauth;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import java.util.Map;

@FeignClient(name = "auth", url = "https://identity.dataspace.copernicus.eu")
public interface satelliteAuth {
    @PostMapping(value = "/auth/realms/CDSE/protocol/openid-connect/token", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    santinelauth getAuthToken(@RequestBody Map<String, ?> formParams);
}
