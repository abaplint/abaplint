import {structureType} from "../_utils";
import {With} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: `WITH +cnt AS (
    SELECT
    DISTINCT
      my_column
    FROM my_table
    )
    SELECT ('count( * )')
      FROM ('+cnt')
      INTO @DATA(lv_total_number_of_records).
  ENDWITH.`},
];

structureType(cases, new With());