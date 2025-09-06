package com.nabard.satelliteFarm.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.nabard.satelliteFarm.feign.mapCoordinates;
import com.nabard.satelliteFarm.feign.satelliteAuth;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import com.nabard.satelliteFarm.feign.satelliteFeign;
import com.nabard.satelliteFarm.feign.satelliteImage;
import com.nabard.satelliteFarm.model.FarmerCoordinateResponse;
import com.nabard.satelliteFarm.model.NdviChangeResult;
import com.nabard.satelliteFarm.model.SatelliteProcessRequest;
import com.nabard.satelliteFarm.model.arraySatellite;
import com.nabard.satelliteFarm.model.coordinates;
import com.nabard.satelliteFarm.model.uploaderFeign;
import com.nabard.satelliteFarm.model.FarmerCoordinateResponse.Coordinate;
import com.nabard.satelliteFarm.util.MultipartFileUtil;

@RestController
public class satelliteController {
    @Autowired
    private satelliteFeign satelliteFeign1;
    @Autowired
    private satelliteAuth satelliteAuth1;
    @Autowired
    private satelliteImage satelliteImage1;
    @Autowired
    private uploaderFeign uploaderFeign1;

    @GetMapping(value = "/process-image", produces = "application/json")
    public ResponseEntity<?> processImage(@RequestParam String farmerId) {
        // Get access token
        Map<String, String> formParams = new java.util.HashMap<>();
        formParams.put("grant_type", "client_credentials");
        formParams.put("client_id", "sh-5213b8a5-6dec-4f95-b49b-9a1e1c2717aa");
        formParams.put("client_secret", "a5ugOhUk5NjERbbotIkGaPInKFs2lFiQ");
        String accessToken = satelliteAuth1.getAuthToken(formParams).getAccess_token();
        System.out.println("Access Token Recieved-----------");
        // Call satelliteImage API
        ResponseEntity<FarmerCoordinateResponse> l1 = getMapCoordinates(farmerId);
        System.out.println("Farmer Data Recieved-----------");

        FarmerCoordinateResponse l2 = l1.getBody();
        if (l2 == null)
            return new ResponseEntity<>(new NdviChangeResult(), HttpStatus.OK);
        List<Coordinate> coordinatesList = l2.getCoordinates();

        byte[] result1 = satelliteImage1.processImage("Bearer " + accessToken,
                createDefaultSatelliteProcessRequest(5 + "", coordinatesList));
        System.out.println("Image 1 Processed-----------");
        byte[] result2 = satelliteImage1.processImage("Bearer " + accessToken,
                createDefaultSatelliteProcessRequest(6 + "", coordinatesList));
        System.out.println("Image 2 Processed-----------");

        org.springframework.web.multipart.MultipartFile before = MultipartFileUtil.toMultipartFile(result1, "before");
        org.springframework.web.multipart.MultipartFile after = MultipartFileUtil.toMultipartFile(result2, "after");
        MultipartFile list[] = { before, after };
        List<String> uploadedFileUrls = uploaderFeign1.uploadFile(list);
        System.out.println("Files Uploaded-----------");
        NdviChangeResult sr1 = satelliteFeign1.compareNdvi(before, after);
        System.out.println("NDVI Comparison Completed-----------");
        sr1.setUrls(uploadedFileUrls);
        sr1.setTotal_area_ha(l2.getArea());

        return ResponseEntity.ok().body(sr1);
    }

    @GetMapping(value = "/process-image1", produces = "image/png")
    public ResponseEntity<?> processImage1() {
        // Get access token
        Map<String, String> formParams = new java.util.HashMap<>();
        formParams.put("grant_type", "client_credentials");
        formParams.put("client_id", "sh-5213b8a5-6dec-4f95-b49b-9a1e1c2717aa");
        formParams.put("client_secret", "a5ugOhUk5NjERbbotIkGaPInKFs2lFiQ");
        // Call satelliteImage API
        ResponseEntity<FarmerCoordinateResponse> l1 = getMapCoordinates("temp12345");
        String accessToken = satelliteAuth1.getAuthToken(formParams).getAccess_token();
        FarmerCoordinateResponse l2 = l1.getBody();
        if (l2 == null)
            return new ResponseEntity<>("No coordinates found for the given farmerId", HttpStatus.NOT_FOUND);
        List<Coordinate> coordinatesList = l2.getCoordinates();

        byte[] result1 = satelliteImage1.processImage("Bearer " + accessToken,
                createDefaultSatelliteProcessRequest(6 + "", coordinatesList));
        return ResponseEntity.ok().header("Content-Type", "image/png").body(result1);
    }

    // Utility method to create a SatelliteProcessRequest with default values
    public static com.nabard.satelliteFarm.model.SatelliteProcessRequest createDefaultSatelliteProcessRequest(
            String month, List<Coordinate> coordinatesList) {
        com.nabard.satelliteFarm.model.SatelliteProcessRequest request = new com.nabard.satelliteFarm.model.SatelliteProcessRequest();

        // Input
        com.nabard.satelliteFarm.model.SatelliteProcessRequest.Input input = new com.nabard.satelliteFarm.model.SatelliteProcessRequest.Input();
        com.nabard.satelliteFarm.model.SatelliteProcessRequest.Bounds bounds = new com.nabard.satelliteFarm.model.SatelliteProcessRequest.Bounds();
        com.nabard.satelliteFarm.model.SatelliteProcessRequest.Geometry geometry = new com.nabard.satelliteFarm.model.SatelliteProcessRequest.Geometry();
        geometry.setType("Polygon");
        java.util.List<java.util.List<java.util.List<Double>>> coordinates = new java.util.ArrayList<>();
        java.util.List<java.util.List<Double>> polygon = new java.util.ArrayList<>();
        for (Coordinate coord : coordinatesList) {
            java.util.List<Double> point = new java.util.ArrayList<>();
            point.add(coord.getLng());
            point.add(coord.getLat());
            polygon.add(point);
        }
        List<Double> firstPoint = new ArrayList<>();
        firstPoint.add(coordinatesList.get(0).getLng());
        firstPoint.add(coordinatesList.get(0).getLat());
        polygon.add(firstPoint); // Close the polygon by adding the first point at the end
        coordinates.add(polygon);
        geometry.setCoordinates(coordinates);
        bounds.setGeometry(geometry);
        com.nabard.satelliteFarm.model.SatelliteProcessRequest.Properties properties = new com.nabard.satelliteFarm.model.SatelliteProcessRequest.Properties();
        properties.setCrs("http://www.opengis.net/def/crs/EPSG/0/4326");
        bounds.setProperties(properties);
        input.setBounds(bounds);

        com.nabard.satelliteFarm.model.SatelliteProcessRequest.Data data = new com.nabard.satelliteFarm.model.SatelliteProcessRequest.Data();
        data.setType("sentinel-2-l2a");
        com.nabard.satelliteFarm.model.SatelliteProcessRequest.DataFilter dataFilter = new com.nabard.satelliteFarm.model.SatelliteProcessRequest.DataFilter();
        com.nabard.satelliteFarm.model.SatelliteProcessRequest.TimeRange timeRange = new com.nabard.satelliteFarm.model.SatelliteProcessRequest.TimeRange();
        timeRange.setFrom("2023-0" + month + "-01T00:00:00Z");
        timeRange.setTo("2023-0" + month + "-30T23:59:59Z");
        dataFilter.setTimeRange(timeRange);
        dataFilter.setMosaickingOrder("leastCC");
        data.setDataFilter(dataFilter);
        input.setData(java.util.Collections.singletonList(data));
        request.setInput(input);

        // Output
        com.nabard.satelliteFarm.model.SatelliteProcessRequest.Output output = new com.nabard.satelliteFarm.model.SatelliteProcessRequest.Output();
        output.setWidth(1024);
        output.setHeight(1024);
        com.nabard.satelliteFarm.model.SatelliteProcessRequest.Response response = new com.nabard.satelliteFarm.model.SatelliteProcessRequest.Response();
        response.setIdentifier("default");
        com.nabard.satelliteFarm.model.SatelliteProcessRequest.Format format = new com.nabard.satelliteFarm.model.SatelliteProcessRequest.Format();
        format.setType("image/png");
        response.setFormat(format);
        output.setResponses(java.util.Collections.singletonList(response));
        request.setOutput(output);

        // Evalscript
        request.setEvalscript(
                "//VERSION=3\nfunction setup() {\n  return {\n    input: [\"B04\", \"B08\", \"dataMask\"],\n    output: { bands: 3, sampleType: \"AUTO\" }\n  };\n}\n\nfunction evaluatePixel(s) {\n  if (s.dataMask === 0) return [0, 0, 0];\n  let ndvi = (s.B08 - s.B04) / (s.B08 + s.B04);\n\n  if (ndvi < 0.2) {\n    return [0.5, 0.5, 0.5]; // gray = Bare/Non-Veg\n  } else if (ndvi < 0.4) {\n    return [1, 1, 0];       // yellow = Sparse Veg\n  } else if (ndvi < 0.6) {\n    return [0, 1, 0];       // light green = Moderate Veg\n  } else {\n    return [0, 0.5, 0];     // dark green = Dense Veg\n  }\n}\n");

        return request;
    }

    @Autowired
    mapCoordinates map1;

    @GetMapping("/map")
    public ResponseEntity<FarmerCoordinateResponse> getMapCoordinates(@RequestParam String farmerId) {
        List<FarmerCoordinateResponse> coordinates = map1.getAllCoordinates();
        for (int i = 0; i < coordinates.size(); i++) {
            if (coordinates.get(i).getFarmerId().equals(farmerId)) {
                return new ResponseEntity<>(coordinates.get(i), HttpStatus.OK);
            }
        }
        return new ResponseEntity<>(new FarmerCoordinateResponse(), HttpStatus.NOT_FOUND);
    }

    @PostMapping("/satellite")
    public String createSatellite() {
        // Logic to create a new satellite

        return "Satellite created successfully";
    }

    @GetMapping("/santinel1")
    public ResponseEntity<?> getSantinel1Data() {
        // Prepare form parameters for OAuth2 token request
        Map<String, String> formParams = new java.util.HashMap<>();
        formParams.put("grant_type", "client_credentials");
        formParams.put("client_id", "sh-5213b8a5-6dec-4f95-b49b-9a1e1c2717aa");
        formParams.put("client_secret", "a5ugOhUk5NjERbbotIkGaPInKFs2lFiQ");
        String accesstoken = satelliteAuth1.getAuthToken(formParams).getAccess_token();

        return new ResponseEntity<>(satelliteAuth1.getAuthToken(formParams), HttpStatus.OK);
    }
}
