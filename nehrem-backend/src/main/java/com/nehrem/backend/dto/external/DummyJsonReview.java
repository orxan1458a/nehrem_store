package com.nehrem.backend.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DummyJsonReview {
    private Integer rating;
    private String  comment;
    private String  reviewerName;
}
