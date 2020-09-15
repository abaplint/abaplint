import {expect} from "chai";
import {IdenticalConditions} from "../../src/rules/identical_conditions";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files";

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

});
