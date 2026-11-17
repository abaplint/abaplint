import {expect} from "chai";
import {SortRequired, SortRequiredConf} from "../../src/rules/sort_required";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Issue} from "../../src/issue";
import {Severity} from "../../src/severity";

const types = `TYPES: BEGIN OF ty_row,
         a TYPE c LENGTH 10,
         b TYPE c LENGTH 10,
         c TYPE i,
       END OF ty_row.
TYPES ty_rows TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY.
DATA gs_row TYPE ty_row.
`;

function inForm(body: string): string {
  return types + `FORM run.
  DATA lt TYPE ty_rows.
  DATA ls TYPE ty_row.
${body}
ENDFORM.`;
}

function findIssues(abap: string, conf?: SortRequiredConf): readonly Issue[] {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
  const rule = new SortRequired();
  if (conf) {
    rule.setConfig(conf);
  }
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

const reported: {title: string, abap: string}[] = [
  {title: "SORT by another field", abap: inForm(`  APPEND ls TO lt.
  SORT lt BY b.
  READ TABLE lt WITH KEY a = 'X' BINARY SEARCH TRANSPORTING NO FIELDS.`)},
  {title: "SORT by the first key field only", abap: inForm(`  APPEND ls TO lt.
  SORT lt BY a.
  READ TABLE lt INTO ls WITH KEY a = 'X' b = 'Y' BINARY SEARCH.`)},
  {title: "SORT by the key fields in another order", abap: inForm(`  APPEND ls TO lt.
  SORT lt BY b a.
  READ TABLE lt INTO ls WITH KEY a = 'X' b = 'Y' BINARY SEARCH.`)},
  {title: "SORT descending by the key field", abap: inForm(`  APPEND ls TO lt.
  SORT lt BY a DESCENDING.
  READ TABLE lt INTO ls WITH KEY a = 'X' BINARY SEARCH.`)},
  {title: "SORT DESCENDING BY the key field", abap: inForm(`  APPEND ls TO lt.
  SORT lt DESCENDING BY a.
  READ TABLE lt INTO ls WITH KEY a = 'X' BINARY SEARCH.`)},
  {title: "the last SORT counts", abap: inForm(`  APPEND ls TO lt.
  SORT lt BY a.
  READ TABLE lt INTO ls WITH KEY a = 'X' BINARY SEARCH.
  SORT lt BY b.
  READ TABLE lt INTO ls WITH KEY a = 'X' BINARY SEARCH.`)},
  {title: "SORT without BY, user key", abap: types + `FORM run.
  DATA lt TYPE STANDARD TABLE OF ty_row WITH NON-UNIQUE KEY b.
  DATA ls TYPE ty_row.
  APPEND ls TO lt.
  SORT lt.
  READ TABLE lt INTO ls WITH KEY a = 'X' BINARY SEARCH.
ENDFORM.`},
  {title: "DELETE ADJACENT DUPLICATES, sorted by a part of the compared fields", abap: inForm(`  APPEND ls TO lt.
  SORT lt BY b.
  DELETE ADJACENT DUPLICATES FROM lt COMPARING a b.`)},
  {title: "DELETE ADJACENT DUPLICATES, compared field not first in the SORT", abap: inForm(`  APPEND ls TO lt.
  SORT lt BY a b.
  DELETE ADJACENT DUPLICATES FROM lt COMPARING b.`)},
  {title: "no SORT, SELECT, SORT of another table", abap: inForm(`  DATA lt_other TYPE ty_rows.
  SELECT * FROM t000 INTO CORRESPONDING FIELDS OF TABLE lt.
  APPEND ls TO lt.
  SORT lt_other BY a.
  DELETE ADJACENT DUPLICATES FROM lt COMPARING a.`)},
  {title: "no SORT, APPEND in a SELECT loop", abap: inForm(`  SELECT * FROM t000 INTO CORRESPONDING FIELDS OF ls.
    APPEND ls TO lt.
  ENDSELECT.
  CLEAR ls.
  READ TABLE lt INTO ls WITH KEY a = 'X' BINARY SEARCH.`)},
  {title: "no SORT, SELECT without ORDER BY", abap: types + `FORM run.
  DATA lt TYPE STANDARD TABLE OF tadir WITH DEFAULT KEY.
  SELECT * FROM tadir INTO TABLE lt WHERE devclass = 'ZFOO'.
  READ TABLE lt WITH KEY object = 'CLAS' obj_name = 'ZCL_FOO' BINARY SEARCH TRANSPORTING NO FIELDS.
ENDFORM.`},
  {title: "no SORT, SELECT into an inline declaration", abap: `FORM run.
  SELECT * FROM tadir INTO TABLE @DATA(lt) WHERE devclass = 'ZFOO'.
  READ TABLE lt WITH KEY object = 'CLAS' BINARY SEARCH TRANSPORTING NO FIELDS.
ENDFORM.`},
  {title: "a local variable in a method", abap: types + `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD run.
    DATA lt TYPE ty_rows.
    DATA ls TYPE ty_row.
    APPEND ls TO lt.
    SORT lt BY a.
    DELETE ADJACENT DUPLICATES FROM lt COMPARING b a.
  ENDMETHOD.
ENDCLASS.`},
];

const notReported: {title: string, abap: string}[] = [
  {title: "parser error", abap: "parser error"},
  {title: "SORT by the key fields", abap: inForm(`  APPEND ls TO lt.
  SORT lt BY a b.
  READ TABLE lt INTO ls WITH KEY a = 'X' b = 'Y' BINARY SEARCH.
  READ TABLE lt INTO ls WITH KEY a = 'X' BINARY SEARCH.`)},
  {title: "SORT ASCENDING, and by more fields", abap: inForm(`  APPEND ls TO lt.
  SORT lt ASCENDING BY a b DESCENDING.
  READ TABLE lt INTO ls WITH KEY a = 'X' BINARY SEARCH.`)},
  {title: "DELETE ADJACENT DUPLICATES, compared fields in another order", abap: inForm(`  APPEND ls TO lt.
  SORT lt BY b a DESCENDING.
  DELETE ADJACENT DUPLICATES FROM lt COMPARING a b.
  DELETE ADJACENT DUPLICATES FROM lt COMPARING b.`)},
  {title: "SORT without BY, user key", abap: types + `FORM run.
  DATA lt TYPE STANDARD TABLE OF ty_row WITH NON-UNIQUE KEY a b.
  DATA ls TYPE ty_row.
  APPEND ls TO lt.
  SORT lt.
  READ TABLE lt INTO ls WITH KEY a = 'X' BINARY SEARCH.
  DELETE ADJACENT DUPLICATES FROM lt COMPARING b a.
ENDFORM.`},
  {title: "SORT without BY, elementary row", abap: `FORM run.
  DATA lt TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  APPEND 'a' TO lt.
  SORT lt.
  READ TABLE lt WITH KEY table_line = 'b' BINARY SEARCH TRANSPORTING NO FIELDS.
ENDFORM.`},
  {title: "SORT without BY, default key of a structured row is not resolved", abap: inForm(`  APPEND ls TO lt.
  SORT lt.
  READ TABLE lt INTO ls WITH KEY b = 'X' BINARY SEARCH.`)},
  {title: "SORT STABLE and SORT with dynamic fields", abap: inForm(`  APPEND ls TO lt.
  SORT lt STABLE BY b.
  READ TABLE lt INTO ls WITH KEY a = 'X' BINARY SEARCH.
  SORT lt BY ('B').
  READ TABLE lt INTO ls WITH KEY a = 'X' BINARY SEARCH.`)},
  {title: "no BINARY SEARCH, no COMPARING, COMPARING ALL FIELDS", abap: inForm(`  APPEND ls TO lt.
  READ TABLE lt INTO ls WITH KEY a = 'X'.
  DELETE ADJACENT DUPLICATES FROM lt.
  DELETE ADJACENT DUPLICATES FROM lt COMPARING ALL FIELDS.`)},
  {title: "dynamic key and WITH TABLE KEY", abap: types + `FORM run.
  DATA lt TYPE STANDARD TABLE OF ty_row WITH NON-UNIQUE KEY a.
  DATA ls TYPE ty_row.
  APPEND ls TO lt.
  READ TABLE lt INTO ls WITH KEY ('A') = 'X' BINARY SEARCH.
  READ TABLE lt INTO ls WITH TABLE KEY a = 'X' BINARY SEARCH.
ENDFORM.`},
  {title: "no SORT, SELECT ... ORDER BY", abap: `FORM run.
  DATA lt TYPE STANDARD TABLE OF tadir WITH DEFAULT KEY.
  SELECT * FROM tadir INTO TABLE lt WHERE devclass = 'ZFOO' ORDER BY PRIMARY KEY.
  READ TABLE lt WITH KEY pgmid = 'R3TR' BINARY SEARCH TRANSPORTING NO FIELDS.
ENDFORM.`},
  {title: "no SORT, filled from a parameter, a call or APPEND LINES OF", abap: types + `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS get RETURNING VALUE(rt) TYPE ty_rows.
    METHODS run IMPORTING it TYPE ty_rows.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD get.
  ENDMETHOD.
  METHOD run.
    DATA lt1 TYPE ty_rows.
    DATA lt3 TYPE ty_rows.
    DATA ls TYPE ty_row.
    lt1 = it.
    APPEND ls TO lt1.
    READ TABLE lt1 INTO ls WITH KEY a = 'X' BINARY SEARCH.
    DATA(lt2) = get( ).
    READ TABLE lt2 INTO ls WITH KEY a = 'X' BINARY SEARCH.
    APPEND LINES OF it TO lt3.
    DELETE ADJACENT DUPLICATES FROM lt3 COMPARING a.
  ENDMETHOD.
ENDCLASS.`},
  {title: "no SORT, filled by APPEND, INSERT, COLLECT and SPLIT", abap: inForm(`  DATA lt_strings TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  APPEND ls TO lt.
  INSERT ls INTO TABLE lt.
  COLLECT ls INTO lt.
  READ TABLE lt INTO ls WITH KEY a = 'X' BINARY SEARCH.
  SPLIT |a,b| AT ',' INTO TABLE lt_strings.
  READ TABLE lt_strings WITH KEY table_line = 'b' BINARY SEARCH TRANSPORTING NO FIELDS.`)},
  {title: "no SORT, APPEND in a loop over a parameter, which can be sorted", abap: types + `FORM run USING ut TYPE ty_rows.
  DATA lt TYPE ty_rows.
  DATA ls TYPE ty_row.
  LOOP AT ut INTO ls WHERE c > 0.
    APPEND ls TO lt.
  ENDLOOP.
  READ TABLE lt INTO ls WITH KEY a = 'X' BINARY SEARCH.
ENDFORM.`},
  {title: "no SORT, APPEND in a SELECT loop with ORDER BY", abap: inForm(`  SELECT * FROM t000 INTO CORRESPONDING FIELDS OF ls ORDER BY PRIMARY KEY.
    APPEND ls TO lt.
  ENDSELECT.
  READ TABLE lt INTO ls WITH KEY a = 'X' BINARY SEARCH.`)},
  {title: "SELECT and a call that can bring sorted rows", abap: types + `FORM fill CHANGING ct TYPE ty_rows.
ENDFORM.
FORM run.
  DATA lt TYPE ty_rows.
  DATA ls TYPE ty_row.
  SELECT * FROM t000 INTO CORRESPONDING FIELDS OF TABLE lt.
  PERFORM fill CHANGING lt.
  READ TABLE lt INTO ls WITH KEY a = 'X' BINARY SEARCH.
ENDFORM.`},
  {title: "another SORT, then the table is overwritten", abap: types + `FORM run USING ut TYPE ty_rows.
  DATA lt TYPE ty_rows.
  DATA ls TYPE ty_row.
  APPEND ls TO lt.
  SORT lt BY b.
  lt = ut.
  READ TABLE lt INTO ls WITH KEY a = 'X' BINARY SEARCH.
ENDFORM.`},
  {title: "no SORT, kept sorted by INSERT ... INDEX", abap: inForm(`  READ TABLE lt WITH KEY a = 'X' BINARY SEARCH TRANSPORTING NO FIELDS.
  IF sy-subrc <> 0.
    INSERT ls INTO lt INDEX sy-tabix.
  ENDIF.`)},
  {title: "no SORT, sorted later in a loop around the statement", abap: inForm(`  SELECT * FROM t000 INTO CORRESPONDING FIELDS OF TABLE lt.
  DO 3 TIMES.
    READ TABLE lt INTO ls WITH KEY a = 'X' BINARY SEARCH.
    APPEND ls TO lt.
    SORT lt BY a.
  ENDDO.`)},
  {title: "no SORT, not filled at all", abap: inForm(`  READ TABLE lt INTO ls WITH KEY a = 'X' BINARY SEARCH.`)},
  {title: "parameters, attributes, statics and globals", abap: types + `DATA gt TYPE ty_rows.
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    DATA mt TYPE ty_rows.
    METHODS run CHANGING ct TYPE ty_rows.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD run.
    STATICS st TYPE ty_rows.
    DATA ls TYPE ty_row.
    APPEND ls TO ct.
    APPEND ls TO mt.
    APPEND ls TO st.
    APPEND ls TO gt.
    SORT ct BY b.
    SORT mt BY b.
    SORT st BY b.
    SORT gt BY b.
    READ TABLE ct INTO ls WITH KEY a = 'X' BINARY SEARCH.
    READ TABLE mt INTO ls WITH KEY a = 'X' BINARY SEARCH.
    READ TABLE st INTO ls WITH KEY a = 'X' BINARY SEARCH.
    READ TABLE gt INTO ls WITH KEY a = 'X' BINARY SEARCH.
  ENDMETHOD.
ENDCLASS.
FORM run USING ut TYPE ty_rows.
  READ TABLE ut INTO gs_row WITH KEY a = 'X' BINARY SEARCH.
ENDFORM.`},
  {title: "sorted and hashed tables", abap: types + `FORM run.
  DATA lt_sorted TYPE SORTED TABLE OF ty_row WITH NON-UNIQUE KEY a.
  DATA lt_hashed TYPE HASHED TABLE OF ty_row WITH UNIQUE KEY a.
  DATA ls TYPE ty_row.
  INSERT ls INTO TABLE lt_sorted.
  INSERT ls INTO TABLE lt_hashed.
  READ TABLE lt_sorted INTO ls WITH KEY a = 'X' BINARY SEARCH.
  DELETE ADJACENT DUPLICATES FROM lt_sorted COMPARING b.
  DELETE ADJACENT DUPLICATES FROM lt_hashed COMPARING b.
ENDFORM.`},
  {title: "outside of a procedure", abap: types + `DATA lt TYPE ty_rows.
APPEND gs_row TO lt.
SORT lt BY b.
READ TABLE lt INTO gs_row WITH KEY a = 'X' BINARY SEARCH.`},
];

describe("Rule: sort_required", () => {

  for (const test of reported) {
    it("reported: " + test.title, () => {
      expect(findIssues(test.abap).length).to.equal(1);
    });
  }

  for (const test of notReported) {
    it("not reported: " + test.title, () => {
      expect(findIssues(test.abap).length).to.equal(0);
    });
  }

  it("message, position and severity, mismatching SORT", () => {
    const issues = findIssues(inForm(`  APPEND ls TO lt.
  SORT lt BY b.
  DELETE ADJACENT DUPLICATES FROM lt COMPARING a b.`));
    expect(issues.length).to.equal(1);
    expect(issues[0].getStart().getRow()).to.equal(13);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
    expect(issues[0].getMessage()).to.equal(
      "DELETE ADJACENT DUPLICATES ... COMPARING on lt needs it sorted by a b, the SORT before is by b");
  });

  it("message, no SORT", () => {
    const issues = findIssues(inForm(`  SELECT * FROM t000 INTO CORRESPONDING FIELDS OF TABLE lt.
  READ TABLE lt INTO ls WITH KEY b = 'X' a = 'Y' BINARY SEARCH.`));
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal(
      "READ TABLE ... BINARY SEARCH on lt needs it sorted by b a, there is no SORT before");
  });

  it("options switch off each check", () => {
    const abap = inForm(`  APPEND ls TO lt.
  SORT lt BY c.
  READ TABLE lt INTO ls WITH KEY a = 'X' BINARY SEARCH.
  DELETE ADJACENT DUPLICATES FROM lt COMPARING a.`);
    expect(findIssues(abap).length).to.equal(2);

    const noBinary = new SortRequiredConf();
    noBinary.binarySearch = false;
    const binaryOff = findIssues(abap, noBinary);
    expect(binaryOff.length).to.equal(1);
    expect(binaryOff[0].getMessage()).to.contain("DELETE ADJACENT DUPLICATES");

    const noAdjacent = new SortRequiredConf();
    noAdjacent.adjacentDuplicates = false;
    const adjacentOff = findIssues(abap, noAdjacent);
    expect(adjacentOff.length).to.equal(1);
    expect(adjacentOff[0].getMessage()).to.contain("BINARY SEARCH");
  });

});
