package com.nabard.satelliteFarm.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class coordinates {
    double minLatitude;
    double maxLatitude;
    double minLongitude;
    double maxLongitude;
}
