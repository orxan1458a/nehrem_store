package com.nehrem.backend.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DummyJsonProductsResponse {
    private List<DummyJsonProduct> products;
    private Integer                total;
    private Integer                skip;
    private Integer                limit;
}
