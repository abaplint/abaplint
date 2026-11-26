import {expect} from "chai";
import {UnsecureFAE} from "../../src/rules/unsecure_fae";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";

async function run(abap: string){
  const reg = new Registry().addFile(new MemoryFile("zunsecure_fae.prog.abap", abap));
  await reg.parseAsync();

  const issues = new UnsecureFAE().initialize(reg).run(reg.getFirstObject()!);
  return issues;
}

describe("Rule: unsecure_fae", () => {

  it("no error1", async () => {
    const abap = `parser error`;
    const issues = await run(abap);
    expect(issues.length).to.equal(0);
  });

  it("no error2", async () => {
    const abap = `WRITE hello.`;
    const issues = await run(abap);
    expect(issues.length).to.equal(0);
  });

  it("basic", async () => {
    const abap = `
  DATA lt_list TYPE STANDARD TABLE OF voided WITH EMPTY KEY.
  SELECT * FROM voided INTO TABLE @DATA(bar)
    FOR ALL ENTRIES IN @lt_list
    WHERE field = @lt_list-field.`;
    const issues = await run(abap);
    expect(issues.length).to.equal(1);
  });


  const inMethod = (body: string) => `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    DATA mt_attr TYPE STANDARD TABLE OF t000-mandt WITH DEFAULT KEY.
    METHODS run IMPORTING it_imp LIKE mt_attr.
    METHODS other.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD run.
    DATA it LIKE mt_attr.
    DATA it2 LIKE mt_attr.
    DATA lt_t000 TYPE STANDARD TABLE OF t000 WITH DEFAULT KEY.
${body}
  ENDMETHOD.
  METHOD other.
  ENDMETHOD.
ENDCLASS.`;
  const select = (itab = "it") => `SELECT * FROM t000 FOR ALL ENTRIES IN @${itab} WHERE mandt = @${itab}-table_line INTO TABLE @lt_t000.`;

  const checked: {name: string, body: string}[] = [
    {name: "IF IS NOT INITIAL", body: `IF it IS NOT INITIAL.\n${select()}\nENDIF.`},
    {name: "IF NOT IS INITIAL", body: `IF NOT it IS INITIAL.\n${select()}\nENDIF.`},
    {name: "IF lines( ) > 0", body: `IF lines( it ) > 0.\n${select()}\nENDIF.`},
    {name: "AND combined", body: `IF it2 IS INITIAL AND it IS NOT INITIAL.\n${select()}\nENDIF.`},
    {name: "AND combined, sub condition", body: `IF it2 IS INITIAL AND ( 1 = 1 AND it IS NOT INITIAL ).\n${select()}\nENDIF.`},
    {name: "ELSEIF", body: `IF it2 IS INITIAL.\nELSEIF it IS NOT INITIAL.\n${select()}\nENDIF.`},
    {name: "nested block", body: `IF it IS NOT INITIAL.\nIF it2 IS INITIAL.\n${select()}\nENDIF.\nENDIF.`},
    {name: "early RETURN", body: `IF it IS INITIAL.\nRETURN.\nENDIF.\n${select()}`},
    {name: "early RETURN, OR combined", body: `IF it2 IS INITIAL OR it IS INITIAL.\nRETURN.\nENDIF.\n${select()}`},
    {name: "early RETURN, SELECT in a block", body: `IF it IS INITIAL.\nRETURN.\nENDIF.\nIF it2 IS INITIAL.\n${select()}\nENDIF.`},
    {name: "CHECK", body: `CHECK it IS NOT INITIAL.\n${select()}`},
    {name: "parameter, call in between", body: `IF it_imp IS NOT INITIAL.\nother( ).\n${select("it_imp")}\nENDIF.`},
    {name: "attribute", body: `IF mt_attr IS NOT INITIAL.\n${select("mt_attr")}\nENDIF.`},
    {name: "write after the SELECT", body: `IF it IS NOT INITIAL.\n${select()}\nCLEAR it.\nENDIF.`},
  ];
  for (const t of checked) {
    it("checked, " + t.name, async () => {
      const issues = await run(inMethod(t.body));
      expect(issues.length).to.equal(0);
    });
  }

  const unchecked: {name: string, body: string}[] = [
    {name: "no check", body: select()},
    {name: "other table checked", body: `IF it2 IS NOT INITIAL.\n${select()}\nENDIF.`},
    {name: "OR combined", body: `IF it2 IS INITIAL OR it IS NOT INITIAL.\n${select()}\nENDIF.`},
    {name: "NOT sub condition", body: `IF NOT ( it IS NOT INITIAL ).\n${select()}\nENDIF.`},
    {name: "ELSE branch", body: `IF it IS NOT INITIAL.\nELSE.\n${select()}\nENDIF.`},
    {name: "IS INITIAL", body: `IF it IS INITIAL.\n${select()}\nENDIF.`},
    {name: "written in between", body: `IF it IS NOT INITIAL.\nCLEAR it.\n${select()}\nENDIF.`},
    {name: "assigned in between", body: `IF it IS NOT INITIAL.\nit = it2.\n${select()}\nENDIF.`},
    {name: "written later in a loop", body: `IF it IS NOT INITIAL.\nDO 2 TIMES.\n${select()}\nCLEAR it.\nENDDO.\nENDIF.`},
    {name: "early RETURN, written after", body: `IF it IS INITIAL.\nRETURN.\nENDIF.\nCLEAR it.\n${select()}`},
    {name: "early RETURN after the SELECT", body: `${select()}\nIF it IS INITIAL.\nRETURN.\nENDIF.`},
    {name: "early RETURN, AND combined", body: `IF it2 IS INITIAL AND it IS INITIAL.\nRETURN.\nENDIF.\n${select()}`},
    {name: "early IF without RETURN", body: `IF it IS INITIAL.\nCLEAR it2.\nENDIF.\n${select()}`},
    {name: "CHECK inside a loop", body: `DO 2 TIMES.\nCHECK it IS NOT INITIAL.\n${select()}\nENDDO.`},
    {name: "attribute, call in between", body: `IF mt_attr IS NOT INITIAL.\nother( ).\n${select("mt_attr")}\nENDIF.`},
  ];
  for (const t of unchecked) {
    it("unchecked, " + t.name, async () => {
      const issues = await run(inMethod(t.body));
      expect(issues.length).to.equal(1);
    });
  }

  it("checked, program", async () => {
    const abap = `
  DATA lt_list TYPE STANDARD TABLE OF voided WITH EMPTY KEY.
  IF lt_list IS NOT INITIAL.
    SELECT * FROM voided INTO TABLE @DATA(bar)
      FOR ALL ENTRIES IN @lt_list
      WHERE field = @lt_list-field.
  ENDIF.`;
    const issues = await run(abap);
    expect(issues.length).to.equal(0);
  });

});
