import {NoMandtInDatabaseOperations} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "SELECT * FROM zfoo INTO TABLE @DATA(rows).", cnt: 0},
  {abap: "SELECT * FROM zfoo WHERE id = @id INTO TABLE @DATA(rows).", cnt: 0},
  {abap: "SELECT mandt FROM zfoo INTO TABLE @DATA(clients).", cnt: 0},
  {abap: "SELECT * FROM zfoo WHERE mandt = @sy-mandt INTO TABLE @DATA(rows).", cnt: 1},
  {abap: "SELECT * FROM zfoo AS foo WHERE foo~mandt = @sy-mandt INTO TABLE @DATA(rows).", cnt: 1},
  {abap: "SELECT * FROM zfoo WHERE id = @mandt INTO TABLE @DATA(rows).", cnt: 0},
  {abap: "SELECT * FROM zfoo CLIENT SPECIFIED INTO TABLE @DATA(rows).", cnt: 1},
  {abap: "SELECT * FROM zfoo USING CLIENT @client INTO TABLE @DATA(rows).", cnt: 1},
  {abap: "SELECT * FROM zfoo USING ALL CLIENTS INTO TABLE @DATA(rows).", cnt: 1},
  {abap: "UPDATE zfoo SET name = @name WHERE mandt = @sy-mandt.", cnt: 1},
  {abap: "DELETE FROM zfoo CLIENT SPECIFIED WHERE id = @id.", cnt: 1},
  {abap: "INSERT zfoo CLIENT SPECIFIED FROM @row.", cnt: 1},
  {abap: "MODIFY zfoo CLIENT SPECIFIED FROM @row.", cnt: 1},
  {abap: "IF mandt = sy-mandt. ENDIF.", cnt: 0},
];

testRule(tests, NoMandtInDatabaseOperations);
