package com.ntpc.obt.service;

import com.ntpc.obt.entity.Agency;
import com.ntpc.obt.repository.AgencyRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AgencyService {

    private final AgencyRepository agencyRepository;

    public AgencyService(
            AgencyRepository agencyRepository
    ) {
        this.agencyRepository = agencyRepository;
    }

    /*
     * ==========================================================
     * CREATE AGENCY
     * ==========================================================
     */
    public Agency createAgency(Agency agency) {

        if (agency == null) {
            throw new IllegalArgumentException(
                    "Agency cannot be null."
            );
        }

        return agencyRepository.save(agency);
    }

    /*
     * ==========================================================
     * GET ALL AGENCIES
     * ==========================================================
     */
    @Transactional(readOnly = true)
    public List<Agency> getAllAgencies() {

        return agencyRepository.findAll();
    }

    /*
     * ==========================================================
     * GET AGENCY BY ID
     * ==========================================================
     */
    @Transactional(readOnly = true)
    public Agency getAgencyById(Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Agency ID cannot be null."
            );
        }

        return agencyRepository
                .findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Agency not found with id: " + id
                        )
                );
    }

    /*
     * ==========================================================
     * UPDATE AGENCY
     * ==========================================================
     */
    public Agency updateAgency(
            Long id,
            Agency agency
    ) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Agency ID cannot be null."
            );
        }

        if (agency == null) {
            throw new IllegalArgumentException(
                    "Agency cannot be null."
            );
        }

        Agency existingAgency =
                agencyRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Agency not found with id: "
                                                + id
                                )
                        );

        /*
         * ------------------------------------------------------
         * UPDATE AGENCY FIELDS
         * ------------------------------------------------------
         */

        existingAgency.setAgencyName(
                agency.getAgencyName()
        );

        existingAgency.setContactPerson(
                agency.getContactPerson()
        );

        existingAgency.setEmail(
                agency.getEmail()
        );

        existingAgency.setPhone(
                agency.getPhone()
        );

        existingAgency.setStatus(
                agency.getStatus()
        );

        return agencyRepository.save(
                existingAgency
        );
    }

    /*
     * ==========================================================
     * DELETE AGENCY
     * ==========================================================
     */
    public void deleteAgency(Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Agency ID cannot be null."
            );
        }

        if (!agencyRepository.existsById(id)) {

            throw new RuntimeException(
                    "Agency not found with id: " + id
            );
        }

        agencyRepository.deleteById(id);
    }
}