import {structureType} from "../_utils";
import {Any} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: ""},
  {abap: "WRITE foo. WRITE bar."},
  {abap: "WRITE foo. DATA i TYPE i."},
  {abap: "IF 1 = 2. WRITE foo. WRITE bar. ENDIF."},
  {abap: `WITH +monsters_with_heads AS
  ( SELECT monster_number FROM z4t_monster_head
    WHERE  no_of_heads = @id_no_of_heads )
SELECT *
FROM z4t_deliveries
WHERE due_date       IN @it_date_range
AND   monster_number IN ( SELECT monster_number FROM +monsters_with_heads )
INTO TABLE @DATA(lt_deliveries_new).`},
];

structureType(cases, new Any());