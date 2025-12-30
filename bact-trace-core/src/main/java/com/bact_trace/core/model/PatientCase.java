package com.bact_trace.core.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data // Generates Getters/Setters
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "patient_cases")
public class PatientCase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Doctor Info
    @Column(nullable = false)
    private String doctorId; // The worker ID
    private String villageName; // Local region
    @Column(length = 5)
    private String countryCode; // e.g., "IN", "KE", "BR" (Global Standard)

    // Patient Info
    private String patientName;
    private int age;
    private String gender;

    // AI Diagnosis Results
    private String coughDiagnosis; // e.g., "Viral", "Bacterial"
    private double coughConfidence; // e.g., 0.95
    
    private String visualDiagnosis; // e.g., "Inflammation", "Healthy"
    
    @Column(length = 1000)
    private String finalRecommendation; // "Refer to Hospital" or "Home Care"

    // Metadata
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
