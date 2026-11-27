import {expect} from "chai";
import {IdenticalConditions} from "../../src/rules/identical_conditions";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {testRule} from "./_utils";

async function run(abap: string){
  const reg = new Registry().addFile(new MemoryFile("zidentical_cond.prog.abap", abap));
  await reg.parseAsync();

  const issues = new IdenticalConditions().initialize(reg).run(reg.getFirstObject()!);
  return issues;
}

describe("Rule: identical_conditions", () => {

  it("no error", async () => {
    const abap = `WRITE hello.`;
    const issues = await run(abap);
    expect(issues.length).to.equal(0);
  });

  it("error, identical ELSEIF", async () => {
    const abap = `IF foo = bar.
    ELSEIF foo = bar.
    ENDIF.`;
    const issues = await run(abap);
    expect(issues.length).to.equal(1);
  });

  it("error, identical WHEN", async () => {
    const abap = `CASE bar.
      WHEN '1'.
      WHEN '1'.
    ENDCASE.`;
    const issues = await run(abap);
    expect(issues.length).to.equal(1);
  });

  it("error, identical WHEN OR", async () => {
    const abap = `CASE bar.
      WHEN '1'.
      WHEN 'A' OR '1'.
    ENDCASE.`;
    const issues = await run(abap);
    expect(issues.length).to.equal(1);
  });

  it("error, top level condition identical, IF", async () => {
    const abap = `IF foo = bar OR foo = bar.
    ENDIF.`;
    const issues = await run(abap);
    expect(issues.length).to.equal(1);
  });

  it("error, top level condition identical, IF", async () => {
    const abap = `IF foo = bar OR 1 = a OR foo = bar.
    ENDIF.`;
    const issues = await run(abap);
    expect(issues.length).to.equal(1);
  });

  it("no error, mixed operators, IF", async () => {
    const abap = `IF foo = bar AND loo = sdf OR 1 = a OR foo = bar.
    ENDIF.`;
    const issues = await run(abap);
    expect(issues.length).to.equal(0);
  });

  it("error, top level condition identical, WHILE", async () => {
    const abap = `WHILE foo = bar AND foo = bar.
    ENDWHILE.`;
    const issues = await run(abap);
    expect(issues.length).to.equal(1);
  });

  it("not identical, WHEN", async () => {
    const abap = `CASE bar.
      WHEN 'd' OR 'D'.
    ENDCASE.`;
    const issues = await run(abap);
    expect(issues.length).to.equal(0);
  });

  it("not identical, IF", async () => {
    const abap = `
    IF <ls_e>-line CP '#M#o#d#u#l#e*' OR <ls_e>-line CP '#m#o#d#u#l#e*'.
    ENDIF.`;
    const issues = await run(abap);
    expect(issues.length).to.equal(0);
  });

});

const selfComparison = [
  // reported
  {abap: "IF ls_new-id = ls_new-id.\nENDIF.", cnt: 1},
  {abap: "IF foo <> foo.\nENDIF.", cnt: 1},
  {abap: "IF foo >= foo OR foo LT foo.\nENDIF.", cnt: 2},
  {abap: "IF foo EQ FOO.\nENDIF.", cnt: 1},
  {abap: "IF NOT foo NE foo.\nENDIF.", cnt: 1},
  {abap: "IF NOT NOT foo NE foo.\nENDIF.", cnt: 1},
  {abap: "IF bar = 1 AND foo = foo.\nENDIF.", cnt: 1},
  {abap: "WHILE foo <= foo.\nENDWHILE.", cnt: 1},
  {abap: "CHECK foo = foo.", cnt: 1},
  {abap: "foo = xsdbool( foo = foo ).", cnt: 1},
  {abap: "IF <fs>-a = <fs>-a.\nENDIF.", cnt: 1},
  {abap: "IF ref->attr = ref->attr OR ref->* = ref->*.\nENDIF.", cnt: 2},
  {abap: "IF zcl_foo=>attr = zcl_foo=>attr.\nENDIF.", cnt: 1},
  {abap: "IF foo+1(2) = foo+1(2).\nENDIF.", cnt: 1},
  {abap: "IF tab[ 1 ]-a = tab[ 1 ]-a.\nENDIF.", cnt: 1},
  {abap: "IF sy-subrc = sy-subrc.\nENDIF.", cnt: 1},
  // not reported
  {abap: "IF foo = bar.\nENDIF.", cnt: 0},
  {abap: "IF ls_new-id = ls_old-id.\nENDIF.", cnt: 0},
  {abap: "IF ls_new-id = ls_new-name.\nENDIF.", cnt: 0},
  {abap: "IF foo+1(2) = foo+2(2).\nENDIF.", cnt: 0},
  {abap: "IF foo+1(2) = foo+1(3).\nENDIF.", cnt: 0},
  {abap: "IF tab[ 1 ]-a = tab[ 2 ]-a.\nENDIF.", cnt: 0},
  {abap: "IF tab[ name = 'a' ]-a = tab[ name = 'A' ]-a.\nENDIF.", cnt: 0},
  {abap: "IF get( ) = get( ).\nENDIF.", cnt: 0},
  {abap: "IF ref->get( ) = ref->get( ).\nENDIF.", cnt: 0},
  {abap: "IF lines( tab ) = lines( tab ).\nENDIF.", cnt: 0},
  {abap: "IF tab[ get( ) ]-a = tab[ get( ) ]-a.\nENDIF.", cnt: 0},
  {abap: "IF 1 = 1.\nENDIF.", cnt: 0},
  {abap: "IF foo CP foo.\nENDIF.", cnt: 0},
  {abap: "IF foo BETWEEN foo AND foo.\nENDIF.", cnt: 0},
  {abap: "ASSERT foo = foo.", cnt: 0},
  {abap: "SELECT * FROM zfoo INTO TABLE @DATA(tab) WHERE bar = bar.", cnt: 0},
  {abap: "LOOP AT tab INTO DATA(row) WHERE a = a.\nENDLOOP.", cnt: 0},
];

testRule(selfComparison, IdenticalConditions, undefined, "identical_conditions, selfComparison");
testRule(selfComparison.map(t => ({abap: t.abap, cnt: 0})), IdenticalConditions, {selfComparison: false},
         "identical_conditions, selfComparison off");

describe("Rule: identical_conditions, selfComparison message", () => {
  it("message and position", async () => {
    const issues = await run(`IF bar = 1 AND ls_new-id <> ls_new-id.
ENDIF.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("Comparison is always false, ls_new-id is compared with itself");
    expect(issues[0].getStart().getCol()).to.equal(16);
    expect(issues[0].getEnd().getCol()).to.equal(38);
  });
});
