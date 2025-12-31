package com.bact_trace.core.repository;

import com.bact_trace.core.model.PatientCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CaseRepository extends JpaRepository<PatientCase, Long> {
    
    // Find outbreaks by country
    List<PatientCase> findByCountryCode(String countryCode);

    // Get the most recent cases for the Dashboard
    List<PatientCase> findTop10ByOrderByCreatedAtDesc();

    // Find cases in a specific village for quick stats
    List<PatientCase> findByVillageName(String villageName);
}