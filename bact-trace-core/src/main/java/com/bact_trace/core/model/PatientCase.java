package com.bact_trace.core.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "patient_cases")
public class PatientCase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Doctor Info
    @Column(nullable = false)
    private String doctorId; 
    
    // Patient Info
    private String patientName;
    private int age;
    private String gender;
    private String villageName; 
    @Column(length = 5)
    private String countryCode; 

    // --- NEW: LOCATION MAPPING ---
    // Double is better than String for math/maps
    private Double latitude;   
    private Double longitude;
    // -----------------------------

    // Robust AI Inputs
    private String temperature;      
    private String symptomsDays;     
    private String hasPhlegm;        
    private String breathingDifficulty; 

    @Lob
    @Column(length = 10000000) 
    private byte[] coughAudio; 
    
    @Lob
    @Column(length = 10000000) 
    private byte[] throatImage;

    // AI Diagnosis Results
    private String coughDiagnosis; 
    private double coughConfidence; 
    private String visualDiagnosis; 
    
    @Column(length = 2000)
    private String finalRecommendation; 

    // Metadata
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}