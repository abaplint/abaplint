import {expect} from "chai";
import {SequentialReadSorted} from "../../src/rules/sequential_read_sorted";
import {testRule} from "./_utils";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";

const decl = `TYPES: BEGIN OF ty_node,
         path     TYPE string,
         name     TYPE string,
         type     TYPE string,
         children TYPE i,
       END OF ty_node.
TYPES ty_nodes TYPE SORTED TABLE OF ty_node WITH UNIQUE KEY path name.
DATA mt_tree TYPE ty_nodes.
DATA ls_node TYPE ty_node.
DATA lv TYPE string.
`;

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE hello.", cnt: 0},

  // reported: the first key component is not compared with =
  {abap: decl + `DELETE mt_tree WHERE path CP lv.`, cnt: 1},
  {abap: decl + `DELETE mt_tree WHERE type = lv.`, cnt: 1},
  {abap: decl + `LOOP AT mt_tree INTO ls_node WHERE name = lv.
ENDLOOP.`, cnt: 1},
  {abap: decl + `LOOP AT mt_tree INTO ls_node WHERE path <> lv.
ENDLOOP.`, cnt: 1},
  {abap: decl + `LOOP AT mt_tree INTO ls_node WHERE path = lv OR name = lv.
ENDLOOP.`, cnt: 1},
  {abap: decl + `LOOP AT mt_tree INTO ls_node WHERE NOT path = lv.
ENDLOOP.`, cnt: 1},
  {abap: decl + `LOOP AT mt_tree INTO ls_node WHERE path IS NOT INITIAL.
ENDLOOP.`, cnt: 1},
  {abap: decl + `LOOP AT mt_tree INTO ls_node USING KEY primary_key WHERE name = lv.
ENDLOOP.`, cnt: 1},
  {abap: decl + `LOOP AT mt_tree TRANSPORTING NO FIELDS WHERE children = 0.
ENDLOOP.`, cnt: 1},
  {abap: decl + `MODIFY mt_tree FROM ls_node TRANSPORTING children WHERE type = lv.`, cnt: 1},
  {abap: decl + `READ TABLE mt_tree INTO ls_node WITH KEY type = lv.`, cnt: 1},
  {abap: decl + `READ TABLE mt_tree INTO ls_node WITH KEY name = lv.`, cnt: 1},
  {abap: decl + `READ TABLE mt_tree TRANSPORTING NO FIELDS WITH KEY name = lv type = lv.`, cnt: 1},
  {abap: decl + `ls_node = mt_tree[ name = lv ].`, cnt: 1},
  {abap: decl + `IF line_exists( mt_tree[ type = lv ] ).
ENDIF.`, cnt: 1},
  {abap: decl + `DATA(lv_children) = VALUE #( mt_tree[ name = lv ]-children OPTIONAL ).`, cnt: 1},
  {abap: decl + `DATA lt_int TYPE SORTED TABLE OF i WITH NON-UNIQUE KEY table_line.
LOOP AT lt_int INTO DATA(lv_int) WHERE table_line > 2.
ENDLOOP.`, cnt: 1},
  {abap: decl + `DATA mt_ref TYPE REF TO ty_nodes.
LOOP AT mt_ref->* INTO ls_node WHERE name = lv.
ENDLOOP.`, cnt: 1},
  {abap: decl + `TYPES: BEGIN OF ty_s,
         nodes TYPE ty_nodes,
       END OF ty_s.
DATA ls TYPE ty_s.
DELETE ls-nodes WHERE name = lv.`, cnt: 1},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES ty_t_names TYPE SORTED TABLE OF string WITH UNIQUE KEY table_line.
    DATA mt_names TYPE ty_t_names.
    CLASS-DATA gt_names TYPE ty_t_names.
    METHODS run.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD run.
    LOOP AT me->mt_names INTO DATA(lv_name) WHERE table_line CP 'A*'.
    ENDLOOP.
    DELETE mt_names WHERE table_line CP 'B*'.
    READ TABLE lcl=>gt_names WITH KEY table_line+0(1) = 'C' TRANSPORTING NO FIELDS.
  ENDMETHOD.
ENDCLASS.`, cnt: 3},
  // the pseudo comment on another statement does not count
  {abap: decl + `DELETE mt_tree WHERE type = lv. "#EC CI_SORTSEQ
DELETE mt_tree WHERE name = lv.`, cnt: 1},

  // not reported: a leading part of the key compared with =
  {abap: decl + `DELETE mt_tree WHERE path = lv.`, cnt: 0},
  {abap: decl + `DELETE mt_tree WHERE path EQ lv AND name CP lv.`, cnt: 0},
  {abap: decl + `LOOP AT mt_tree INTO ls_node WHERE type = lv AND path = lv.
ENDLOOP.`, cnt: 0},
  {abap: decl + `LOOP AT mt_tree INTO ls_node WHERE ( path = lv AND name = lv ) AND ( type = lv OR type = lv ).
ENDLOOP.`, cnt: 0},
  {abap: decl + `LOOP AT mt_tree INTO ls_node WHERE path IS INITIAL.
ENDLOOP.`, cnt: 0},
  {abap: decl + `READ TABLE mt_tree INTO ls_node WITH KEY path = lv.`, cnt: 0},
  {abap: decl + `READ TABLE mt_tree INTO ls_node WITH KEY name = lv path = lv.`, cnt: 0},
  {abap: decl + `ls_node = mt_tree[ path = lv type = lv ].`, cnt: 0},

  // not reported: the pseudo comment
  {abap: decl + `DELETE mt_tree WHERE path CP lv. "#EC CI_SORTSEQ`, cnt: 0},
  {abap: decl + `LOOP AT mt_tree INTO ls_node "#EC CI_SORTSEQ
    WHERE name = lv.
ENDLOOP.`, cnt: 0},
  {abap: decl + `LOOP AT mt_tree INTO ls_node
    WHERE name = lv. "#EC CI_SORTSEQ
ENDLOOP.`, cnt: 0},
  {abap: decl + `READ TABLE mt_tree INTO ls_node WITH KEY type = lv. "#ec ci_sortseq`, cnt: 0},
  {abap: decl + `IF line_exists( mt_tree[ type = lv ] ). "#EC CI_SORTSEQ
ENDIF.`, cnt: 0},

  // not reported: key access, index access, named keys
  {abap: decl + `READ TABLE mt_tree INTO ls_node WITH TABLE KEY path = lv name = lv.`, cnt: 0},
  {abap: decl + `READ TABLE mt_tree INTO ls_node INDEX 1.`, cnt: 0},
  {abap: decl + `DELETE mt_tree INDEX 1.`, cnt: 0},
  {abap: decl + `DELETE TABLE mt_tree WITH TABLE KEY path = lv name = lv.`, cnt: 0},
  {abap: decl + `ls_node = mt_tree[ 1 ].`, cnt: 0},
  {abap: decl + `ls_node = mt_tree[ KEY primary_key path = lv name = lv ].`, cnt: 0},
  {abap: decl + `LOOP AT mt_tree INTO ls_node.
ENDLOOP.`, cnt: 0},
  {abap: decl + `LOOP AT mt_tree INTO ls_node FROM 2 WHERE name = lv.
ENDLOOP.`, cnt: 0},
  {abap: decl + `DELETE mt_tree FROM 2 TO 3 WHERE name = lv.`, cnt: 0},
  {abap: decl + `DATA lt_sec TYPE SORTED TABLE OF ty_node WITH UNIQUE KEY path name
  WITH NON-UNIQUE SORTED KEY by_type COMPONENTS type.
LOOP AT lt_sec INTO ls_node USING KEY by_type WHERE type = lv.
ENDLOOP.
DELETE lt_sec USING KEY by_type WHERE type = lv.
READ TABLE lt_sec INTO ls_node WITH KEY by_type COMPONENTS type = lv.
ls_node = lt_sec[ KEY by_type type = lv ].`, cnt: 0},
  {abap: decl + `READ TABLE mt_tree INTO ls_node WITH KEY name = lv BINARY SEARCH.`, cnt: 0},

  // not reported: dynamic
  {abap: decl + `DATA lv_where TYPE string.
LOOP AT mt_tree INTO ls_node WHERE (lv_where).
ENDLOOP.
DELETE mt_tree WHERE (lv_where).`, cnt: 0},
  {abap: decl + `READ TABLE mt_tree INTO ls_node WITH KEY (lv) = lv.`, cnt: 0},
  {abap: decl + `LOOP AT mt_tree INTO ls_node USING KEY (lv) WHERE name = lv.
ENDLOOP.`, cnt: 0},

  // not reported: standard, hashed, generic, default key and unknown table types
  {abap: decl + `DATA lt_std TYPE STANDARD TABLE OF ty_node WITH DEFAULT KEY.
LOOP AT lt_std INTO ls_node WHERE name = lv.
ENDLOOP.
READ TABLE lt_std INTO ls_node WITH KEY name = lv.
ls_node = lt_std[ name = lv ].`, cnt: 0},
  {abap: decl + `DATA lt_hash TYPE HASHED TABLE OF ty_node WITH UNIQUE KEY path name.
LOOP AT lt_hash INTO ls_node WHERE name = lv.
ENDLOOP.
DELETE lt_hash WHERE type = lv.
READ TABLE lt_hash INTO ls_node WITH KEY name = lv.`, cnt: 0},
  {abap: decl + `DATA lt_def TYPE SORTED TABLE OF ty_node WITH NON-UNIQUE DEFAULT KEY.
LOOP AT lt_def INTO ls_node WHERE children = 1.
ENDLOOP.`, cnt: 0},
  {abap: decl + `FIELD-SYMBOLS <lt_any> TYPE ANY TABLE.
FIELD-SYMBOLS <lt_sorted> TYPE SORTED TABLE.
LOOP AT <lt_any> INTO ls_node WHERE ('NAME = LV').
ENDLOOP.
READ TABLE <lt_sorted> INTO ls_node WITH KEY ('NAME') = lv.`, cnt: 0},
  {abap: `DATA lt_void TYPE zunknown_sorted_tab.
DATA ls_void LIKE LINE OF lt_void.
LOOP AT lt_void INTO ls_void WHERE name = 'A'.
ENDLOOP.`, cnt: 0},
  {abap: `DATA lt TYPE TABLE OF string.
LOOP AT lt INTO DATA(lv) WHERE table_line = 'A'.
ENDLOOP.`, cnt: 0},
];

testRule(tests, SequentialReadSorted);

describe("Rule: sequential_read_sorted, message and position", () => {
  it("names the table and the first key component", () => {
    const abap = decl + `DELETE mt_tree WHERE path CP lv.`;
    const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
    const issues = new SequentialReadSorted().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("mt_tree");
    expect(issues[0].getMessage()).to.contain("PATH");
    expect(issues[0].getStart().getRow()).to.equal(11);
  });

  it("table expression, names the table", () => {
    const abap = decl + `ls_node = mt_tree[ name = lv ].`;
    const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
    const issues = new SequentialReadSorted().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("sorted table mt_tree,");
  });
});
