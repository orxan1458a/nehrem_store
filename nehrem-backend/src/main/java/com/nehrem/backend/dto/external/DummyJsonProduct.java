package com.nehrem.backend.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DummyJsonProduct {
    private Long               id;
    private String             title;
    private String             description;
    private String             category;
    private Double             price;
    private Double             discountPercentage;
    private Integer            stock;
    private String             thumbnail;
    private List<DummyJsonReview> reviews;
}
