
package com.ntpc.obt.entity;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "coordinators")
public class Coordinator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Coordinator name is required")
    @Column(nullable = false)
    private String name;

    /*
     * Each coordinator belongs to one agency.
     */
    @OneToOne
    @JoinColumn(
        name = "agency_id",
        nullable = false,
        unique = true
    )
    private Agency agency;

    /*
     * Batch information is maintained with the Coordinator.
     */
    @NotBlank(message = "Batch name is required")
    @Column(
        name = "batch_name",
        nullable = false
    )
    private String batchName;

    /*
     * Batch start date.
     */
    @Column(
        name = "start_date",
        nullable = false
    )
    private LocalDate startDate;

    /*
     * Batch end date.
     */
    @Column(
        name = "end_date",
        nullable = false
    )
    private LocalDate endDate;

    /*
     * Coordinator designation.
     */
    @Column(nullable = false)
    private String designation;

    /*
     * Coordinator phone.
     */
    @NotBlank(message = "Phone is required")
    @Column(nullable = false)
    private String phone;

    /*
     * Coordinator email.
     */
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(nullable = false)
    private String email;

    /*
     * Coordinator status.
     */
    @NotBlank(message = "Status is required")
    @Column(nullable = false)
    private String status;


    /*
     * Default constructor.
     */
    public Coordinator() {
    }


    /*
     * ID
     */
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    /*
     * Coordinator Name
     */
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }


    /*
     * Agency
     */
    public Agency getAgency() {
        return agency;
    }

    public void setAgency(Agency agency) {
        this.agency = agency;
    }


    /*
     * Batch Name
     */
    public String getBatchName() {
        return batchName;
    }

    public void setBatchName(String batchName) {
        this.batchName = batchName;
    }


    /*
     * Start Date
     */
    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }


    /*
     * End Date
     */
    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }


    /*
     * Designation
     */
    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }


    /*
     * Phone
     */
    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }


    /*
     * Email
     */
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    /*
     * Status
     */
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

