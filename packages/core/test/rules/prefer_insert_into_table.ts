import {testRule, testRuleFix} from "./_utils";
import {PreferInsertIntoTable} from "../../src/rules";

const tests = [
  {abap: `parser error`, cnt: 0},
  // basic APPEND to table - should flag
  {abap: `APPEND row TO itab.`, cnt: 1, fix: true},
  // already using INSERT INTO TABLE - no issue
  {abap: `INSERT row INTO TABLE itab.`, cnt: 0},
  // APPEND LINES OF - should flag
  {abap: `APPEND LINES OF itab2 TO itab.`, cnt: 1, fix: true},
  // APPEND INITIAL LINE - should flag
  {abap: `APPEND INITIAL LINE TO itab.`, cnt: 1, fix: true},
  // APPEND INITIAL LINE with ASSIGNING - should flag
  {abap: `APPEND INITIAL LINE TO itab ASSIGNING <fs>.`, cnt: 1, fix: true},
  // APPEND INITIAL LINE with REFERENCE INTO - should flag
  {abap: `APPEND INITIAL LINE TO itab REFERENCE INTO ref.`, cnt: 1, fix: true},
  // APPEND with ASSIGNING - should flag
  {abap: `APPEND row TO itab ASSIGNING <fs>.`, cnt: 1, fix: true},
  // APPEND with CASTING - should flag
  {abap: `APPEND row TO itab ASSIGNING <fs> CASTING.`, cnt: 1, fix: true},
  // APPEND LINES OF with range FROM/TO - should flag
  {abap: `APPEND LINES OF itab2 FROM 1 TO 3 TO itab.`, cnt: 1, fix: true},
  // APPEND SORTED BY - should NOT flag
  {abap: `APPEND row TO itab SORTED BY field.`, cnt: 0},
];

testRule(tests, PreferInsertIntoTable);

const fixes = [
  {input: `APPEND row TO itab.`, output: `INSERT row INTO TABLE itab.`},
  {input: `APPEND LINES OF itab2 TO itab.`, output: `INSERT LINES OF itab2 INTO TABLE itab.`},
  {input: `APPEND INITIAL LINE TO itab.`, output: `INSERT INITIAL LINE INTO TABLE itab.`},
  {input: `APPEND INITIAL LINE TO itab ASSIGNING <fs>.`, output: `INSERT INITIAL LINE INTO TABLE itab ASSIGNING <fs>.`},
  {input: `APPEND INITIAL LINE TO itab REFERENCE INTO ref.`, output: `INSERT INITIAL LINE INTO TABLE itab REFERENCE INTO ref.`},
  {input: `APPEND row TO itab ASSIGNING <fs>.`, output: `INSERT row INTO TABLE itab ASSIGNING <fs>.`},
  {input: `APPEND row TO itab ASSIGNING <fs> CASTING.`, output: `INSERT row INTO TABLE itab ASSIGNING <fs> CASTING.`},
  {input: `APPEND LINES OF itab2 FROM 1 TO 3 TO itab.`, output: `INSERT LINES OF itab2 FROM 1 TO 3 INTO TABLE itab.`},
];

testRuleFix(fixes, PreferInsertIntoTable);
