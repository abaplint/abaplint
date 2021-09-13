import {expect} from "chai";
import {Config, Issue, MemoryFile, Registry, Version} from "../../src";
import {ObsoleteStatement} from "../../src/rules/obsolete_statement";
import {testRule, testRuleFix} from "./_utils";

const tests = [
  {abap: "REFRESH lt_table.", cnt: 1, fix: true},
  {abap: "REFRESH foo FROM TABLE bar.", cnt: 1, fix: false},
  {abap: "COMPUTE foo = 2 + 2.", cnt: 1, fix: true},
  {abap: "COMPUTE EXACT foo = 2 + 2.", cnt: 1, fix: true},
  {abap: "ADD 42 TO foo.", cnt: 1, fix: true},
  {abap: "SUBTRACT 2 FROM foo.", cnt: 1, fix: true},
  {abap: "MULTIPLY lv_foo BY 2.", cnt: 1, fix: true},
  {abap: "DIVIDE lv_foo BY 2.", cnt: 1, fix: true},
  {abap: "MOVE 2 TO lv_foo.", cnt: 1, fix: true},
  {abap: "MOVE for ?TO bar.", cnt: 1, fix: true},
  {abap: "MOVE EXACT is_status-installed_release TO lv_number.", cnt: 0, fix: false},
  {abap: "MOVE: LS_TFACS-JAHR TO LS_CAL-JAHR, LS_TFACS-MON01 TO LS_CAL-MON01.", cnt: 1, fix: false},
  {abap: "IF foo IS REQUESTED.", cnt: 1, fix: true},
  {abap: "IF bar IS NOT REQUESTED.", cnt: 1, fix: true},
  {abap: "CLASS class DEFINITION LOAD.", cnt: 1, fix: true},
  {abap: "INTERFACE intf LOAD.", cnt: 1, fix: true},
  {abap: "CLEAR lt_table.", cnt: 0},
  {abap: "lv_foo = 2 + 2.", cnt: 0},
  {abap: "lv_foo = lv_foo - 1.", cnt: 0},
  {abap: "lv_foo = lv_foo * 2.", cnt: 0},
  {abap: "lv_foo = lv_foo / 2.", cnt: 0},
  {abap: "lv_foo = 2.", cnt: 0},
  {abap: "IF foo IS SUPPLIED.", cnt: 0},

  {abap: "DATA tab LIKE foobar OCCURS 2.", cnt: 1, fix: false},
  {abap: "RANGES moo FOR foo-bar OCCURS 50.", cnt: 2, fix: false},
  {abap: "DESCRIBE TABLE tab OCCURS n1.", cnt: 1, fix: false},
  {abap: `DATA: BEGIN OF li_order OCCURS 0,
  foo TYPE i,
END OF li_order.`, cnt: 1, fix: false},

  {abap: "DATA tab TYPE STANDARD TABLE of foobar.", cnt: 0},
  {abap: "SET EXTENDED CHECK ON.", cnt: 1},
  {abap: "TYPE-POOLS bar.", cnt: 1, fix: true},
  {abap: "DATA tab TYPE STANDARD TABLE of string WITH HEADER LINE.", cnt: 1},
  {abap: "DATA tab TYPE STANDARD TABLE of string with header line.", cnt: 1},
  {abap: "FIELD-SYMBOLS <bar> STRUCTURE usr02 DEFAULT usr02.", cnt: 1},
  {abap: "PARAMETER foo TYPE c.", cnt: 1, fix: true},
  {abap: "PARAMETERS foo TYPE c.", cnt: 0, fix: false},
  {abap: "RANGES werks FOR sdfsdsd-werks.", cnt: 1, fix: true},
  {abap: "DATA foo TYPE RANGE OF bar.", cnt: 0},
  {abap: "COMMUNICATION ACCEPT ID c.", cnt: 1},
  {abap: "PACK s TO d.", cnt: 1},

  // select without into
  {abap: "SELECT SINGLE * FROM t000.", cnt: 1},
  {abap: "SELECT SINGLE * FROM t000 INTO bar.", cnt: 0},
  {abap: `SELECT COUNT(*) FROM tcdrp WHERE object = mv_object.`, cnt: 0},
  {abap: `SELECT COUNT( * ) FROM dm40l WHERE dmoid = mv_data_model AND as4local = mv_activation_state.`, cnt: 0},

  {abap: "FREE MEMORY.", cnt: 1},
  {abap: "FREE MEMORY ID bar.", cnt: 0},

  {abap: "EXIT.", cnt: 0},
  {abap: "EXIT FROM SQL.", cnt: 1, fix: false},
  {abap: "EXIT FROM STEP-LOOP.", cnt: 0},

  {abap: "SORT foo BY <fs>.", cnt: 1, fix: false},
  {abap: "SORT foo BY (bar).", cnt: 0, fix: false},

  {abap: `call transformation (lv_name)
    objects (lt_obj)
    source xml lv_xml
    result xml rv_res.`, cnt: 1},
  {abap: `call transformation (lv_name)
    parameters (lt_par)
    source xml lv_xml
    result xml rv_res.`, cnt: 0},
];

testRule(tests, ObsoleteStatement);

async function findIssues(abap: string, version?: Version): Promise<readonly Issue[]> {
  const config = Config.getDefault(version);
  const reg = new Registry(config).addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new ObsoleteStatement();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("test obsolete_statements rule - versions", () => {
  it("no issues", async () => {
    const issue1 = await findIssues("FIND REGEX 'foo' IN 'bar'", Version.v754);
    expect(issue1.length).to.equal(0);
    const issue2 = await findIssues("FIND PRCE 'foo' IN 'bar'", Version.v754);
    expect(issue2.length).to.equal(0);

    const issue3 = await findIssues("REPLACE ALL OCCURRENCES OF REGEX 'foo' IN bar WITH 'test'.", Version.v754);
    expect(issue3.length).to.equal(0);
    const issue4 = await findIssues("REPLACE ALL OCCURRENCES OF PRCE 'foo' IN bar WITH 'test'.", Version.v754);
    expect(issue4.length).to.equal(0);
  });

  it("issues", async () => {
    const issue1 = await findIssues("FIND REGEX 'foo' IN 'bar'", Version.v755);
    expect(issue1.length).to.equal(1);
    const issue2 = await findIssues("FIND PRCE 'foo' IN 'bar'", Version.v755);
    expect(issue2.length).to.equal(0);

    const issue3 = await findIssues("REPLACE ALL OCCURRENCES OF REGEX 'foo' IN bar WITH 'test'.", Version.v755);
    expect(issue3.length).to.equal(1);
    const issue4 = await findIssues("REPLACE ALL OCCURRENCES OF PRCE 'foo' IN bar WITH 'test'.", Version.v755);
    expect(issue4.length).to.equal(0);
  });
});

const fixes = [
  {input: "REFRESH foo.", output: "CLEAR foo."},
  {input: "COMPUTE foo = 2 + 3.", output: "foo = 2 + 3."},
  {input: "COMPUTE EXACT foo = 2 + 3.", output: "foo = EXACT #( 2 + 3 )."},
  {input: "ADD 42 TO foo.", output: "foo = foo + 42."},
  {input: "SUBTRACT 42 FROM foo.", output: "foo = foo - 42."},
  {input: "MULTIPLY foo BY 42.", output: "foo = foo * 42."},
  {input: "DIVIDE foo BY 42.", output: "foo = foo / 42."},
  {input: "MOVE foo TO bar.", output: "bar = foo."},
  {input: "MOVE foo ?TO bar.", output: "bar ?= foo."},
  {input: "MOVE struc-foo TO struc1-struc2-bar.", output: "struc1-struc2-bar = struc-foo."},
  {input: "IF foo IS REQUESTED.", output: "IF foo IS SUPPLIED."},
  {input: "IF bar IS NOT REQUESTED.", output: "IF bar IS NOT SUPPLIED."},
  {input: "PARAMETER foo TYPE c.", output: "PARAMETERS foo TYPE c."},
  {input: "CLASS foo DEFINITION LOAD.", output: "CLASS foo DEFINITION."},
  {input: "INTERFACE foo LOAD.", output: "INTERFACE foo."},
  {input: "RANGES werks FOR sdfsdsd-werks.", output: "TYPES werks LIKE RANGE OF sdfsdsd-werks."},
  {input: "TYPE-POOLS bar.", output: ""},
];

testRuleFix(fixes, ObsoleteStatement);
