package com.nabard.satelliteFarm.model;

import java.util.List;
import java.util.Map;

public class NdviChangeResult {
    private double total_area_ha;
    private Map<String, VegClass> classes;
    private List<String> urls;

    public List<String> getUrls() {
        return urls;
    }

    public void setUrls(List<String> urls) {
        this.urls = urls;
    }

    public static class VegClass {
        private double before_ha;
        private double after_ha;
        private double change_ha;
        private double before_perc;
        private double after_perc;

        public double getBefore_ha() {
            return before_ha;
        }

        public void setBefore_ha(double before_ha) {
            this.before_ha = before_ha;
        }

        public double getAfter_ha() {
            return after_ha;
        }

        public void setAfter_ha(double after_ha) {
            this.after_ha = after_ha;
        }

        public double getChange_ha() {
            return change_ha;
        }

        public void setChange_ha(double change_ha) {
            this.change_ha = change_ha;
        }

        public double getBefore_perc() {
            return before_perc;
        }

        public void setBefore_perc(double before_perc) {
            this.before_perc = before_perc;
        }

        public double getAfter_perc() {
            return after_perc;
        }

        public void setAfter_perc(double after_perc) {
            this.after_perc = after_perc;
        }
    }

    public double getTotal_area_ha() {
        return total_area_ha;
    }

    public void setTotal_area_ha(double total_area_ha) {
        this.total_area_ha = total_area_ha;
    }

    public Map<String, VegClass> getClasses() {
        return classes;
    }

    public void setClasses(Map<String, VegClass> classes) {
        this.classes = classes;
    }
}
