package com.nehrem.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class NehremApplication {
    public static void main(String[] args) {
        // Ensure the JVM always operates in UTC regardless of the host OS timezone.
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(NehremApplication.class, args);
    }
}
