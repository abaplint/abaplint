import {structureType} from "../_utils";
import {ClassImplementation} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: "CLASS zfoo IMPLEMENTATION. ENDCLASS."},
  {abap: "CLASS zfoo IMPLEMENTATION. METHOD foo. ENDMETHOD. ENDCLASS."},
  {abap: "CLASS zfoo IMPLEMENTATION. METHOD foo. moo = boo. ENDMETHOD. ENDCLASS."},
  {abap: "CLASS zfoo IMPLEMENTATION. METHOD foo. TYPE-POOLS: abcd. ENDMETHOD. ENDCLASS."},
  {abap: `
CLASS zcl_abap_spatial_amdp IMPLEMENTATION.
  METHOD insert_geo_location
    BY DATABASE PROCEDURE FOR HDB
    LANGUAGE SQLSCRIPT
    USING zchargingpoints.

    INSERT INTO zchargingpoints VALUES (
                                  i_mandt,
                                  NEW ST_POINT(i_longitude, i_latitude).ST_SRID(4326)
                                );

  ENDMETHOD.
ENDCLASS.`},
  {abap: `
CLASS lcl_global_func IMPLEMENTATION.
  METHOD get_dummy BY DATABASE FUNCTION FOR HDB LANGUAGE SQLSCRIPT OPTIONS READ-ONLY.
    RETURN
      SELECT dummy FROM "SYS".dummy WHERE dummy = :var;
  ENDMETHOD.
ENDCLASS.`},
];

structureType(cases, new ClassImplementation());