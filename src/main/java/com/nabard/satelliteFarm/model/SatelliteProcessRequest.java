package com.nabard.satelliteFarm.model;

import java.util.List;
import java.util.Map;

public class SatelliteProcessRequest {
    private Input input;
    private Output output;
    private String evalscript;

    public static class Input {
        private Bounds bounds;
        private List<Data> data;

        // getters and setters
        public Bounds getBounds() {
            return bounds;
        }

        public void setBounds(Bounds bounds) {
            this.bounds = bounds;
        }

        public List<Data> getData() {
            return data;
        }

        public void setData(List<Data> data) {
            this.data = data;
        }
    }

    public static class Bounds {
        private Geometry geometry;
        private Properties properties;

        // getters and setters
        public Geometry getGeometry() {
            return geometry;
        }

        public void setGeometry(Geometry geometry) {
            this.geometry = geometry;
        }

        public Properties getProperties() {
            return properties;
        }

        public void setProperties(Properties properties) {
            this.properties = properties;
        }
    }

    public static class Geometry {
        private String type;
        private List<List<List<Double>>> coordinates;

        // getters and setters
        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public List<List<List<Double>>> getCoordinates() {
            return coordinates;
        }

        public void setCoordinates(List<List<List<Double>>> coordinates) {
            this.coordinates = coordinates;
        }
    }

    public static class Properties {
        private String crs;

        // getters and setters
        public String getCrs() {
            return crs;
        }

        public void setCrs(String crs) {
            this.crs = crs;
        }
    }

    public static class Data {
        private String type;
        private DataFilter dataFilter;

        // getters and setters
        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public DataFilter getDataFilter() {
            return dataFilter;
        }

        public void setDataFilter(DataFilter dataFilter) {
            this.dataFilter = dataFilter;
        }
    }

    public static class DataFilter {
        private TimeRange timeRange;
        private String mosaickingOrder;

        // getters and setters
        public TimeRange getTimeRange() {
            return timeRange;
        }

        public void setTimeRange(TimeRange timeRange) {
            this.timeRange = timeRange;
        }

        public String getMosaickingOrder() {
            return mosaickingOrder;
        }

        public void setMosaickingOrder(String mosaickingOrder) {
            this.mosaickingOrder = mosaickingOrder;
        }
    }

    public static class TimeRange {
        private String from;
        private String to;

        // getters and setters
        public String getFrom() {
            return from;
        }

        public void setFrom(String from) {
            this.from = from;
        }

        public String getTo() {
            return to;
        }

        public void setTo(String to) {
            this.to = to;
        }
    }

    public static class Output {
        private int width;
        private int height;
        private List<Response> responses;

        // getters and setters
        public int getWidth() {
            return width;
        }

        public void setWidth(int width) {
            this.width = width;
        }

        public int getHeight() {
            return height;
        }

        public void setHeight(int height) {
            this.height = height;
        }

        public List<Response> getResponses() {
            return responses;
        }

        public void setResponses(List<Response> responses) {
            this.responses = responses;
        }
    }

    public static class Response {
        private String identifier;
        private Format format;

        // getters and setters
        public String getIdentifier() {
            return identifier;
        }

        public void setIdentifier(String identifier) {
            this.identifier = identifier;
        }

        public Format getFormat() {
            return format;
        }

        public void setFormat(Format format) {
            this.format = format;
        }
    }

    public static class Format {
        private String type;

        // getters and setters
        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }
    }

    // getters and setters for main class
    public Input getInput() {
        return input;
    }

    public void setInput(Input input) {
        this.input = input;
    }

    public Output getOutput() {
        return output;
    }

    public void setOutput(Output output) {
        this.output = output;
    }

    public String getEvalscript() {
        return evalscript;
    }

    public void setEvalscript(String evalscript) {
        this.evalscript = evalscript;
    }

}
