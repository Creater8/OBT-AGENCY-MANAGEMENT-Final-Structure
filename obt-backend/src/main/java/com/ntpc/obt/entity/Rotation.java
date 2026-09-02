package com.ntpc.obt.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "rotations")
public class Rotation {

    /*
     * ======================================================
     * PRIMARY KEY
     * ======================================================
     */

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    /*
     * ======================================================
     * AGENCY
     * ======================================================
     *
     * Each Agency can have only one Rotation entry.
     *
     * agency_id is:
     *
     * - NOT NULL
     * - UNIQUE
     *
     * Therefore:
     *
     * Agency 1 -> one Rotation
     * Agency 2 -> one Rotation
     * Agency 3 -> one Rotation
     */

    @OneToOne
    @JoinColumn(
            name = "agency_id",
            nullable = false,
            unique = true
    )
    private Agency agency;


    /*
     * ======================================================
     * ROTATION ORDER
     * ======================================================
     *
     * Defines the fixed position of an Agency.
     *
     * Example:
     *
     * Agency A -> 1
     * Agency B -> 2
     * Agency C -> 3
     * Agency D -> 4
     * Agency E -> 5
     *
     * Rotation order is independent of Agency ID.
     *
     * Example:
     *
     * Agency ID 7  -> Rotation Order 1
     * Agency ID 12 -> Rotation Order 2
     * Agency ID 4  -> Rotation Order 3
     *
     * The Agency ID does NOT determine the rotation order.
     */

    @Column(
            name = "rotation_order",
            nullable = false,
            unique = true
    )
    private Integer rotationOrder;


    /*
     * ======================================================
     * DEFAULT CONSTRUCTOR
     * ======================================================
     */

    public Rotation() {
    }


    /*
     * ======================================================
     * PARAMETERIZED CONSTRUCTOR
     * ======================================================
     */

    public Rotation(
            Agency agency,
            Integer rotationOrder
    ) {
        this.agency = agency;
        this.rotationOrder = rotationOrder;
    }


    /*
     * ======================================================
     * GET ID
     * ======================================================
     */

    public Long getId() {
        return id;
    }


    /*
     * ======================================================
     * GET AGENCY
     * ======================================================
     */

    public Agency getAgency() {
        return agency;
    }


    /*
     * ======================================================
     * GET ROTATION ORDER
     * ======================================================
     */

    public Integer getRotationOrder() {
        return rotationOrder;
    }


    /*
     * ======================================================
     * SET ID
     * ======================================================
     */

    public void setId(Long id) {
        this.id = id;
    }


    /*
     * ======================================================
     * SET AGENCY
     * ======================================================
     */

    public void setAgency(Agency agency) {
        this.agency = agency;
    }


    /*
     * ======================================================
     * SET ROTATION ORDER
     * ======================================================
     */

    public void setRotationOrder(
            Integer rotationOrder
    ) {
        this.rotationOrder = rotationOrder;
    }
}