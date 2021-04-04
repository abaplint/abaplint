import {expect} from "chai";
import {ABAPFile} from "../../../src/abap/abap_file";
import {StatementFlow} from "../../../src/abap/flow/statement_flow";
import {MemoryFile} from "../../../src/files/memory_file";
import * as Statements from "../../../src/abap/2_statements/statements";
import {ABAPObject} from "../../../src/objects/_abap_object";
import {Registry} from "../../../src/registry";

async function build(abap: string) {
  const reg = new Registry();
  reg.addFile(new MemoryFile("zstatement_flow.prog.abap", abap));
  await reg.parseAsync();
  const obj = reg.getFirstObject()! as ABAPObject;
  const file = obj.getABAPFiles()[0] as ABAPFile | undefined;
  const stru = file?.getStructure();
  expect(stru).to.not.equal(undefined);
  return new StatementFlow().build(stru!);
}

describe("statement_flow", () => {
  it("WRITE", async () => {
    const abap = `WRITE 'hello'.`;
    const res = await build(abap);
    expect(res).to.not.equal(undefined);
    expect(res.length).to.equal(1);
    expect(res[0].statements.length).to.equal(1);
    expect(res[0].statements[0].get()).to.be.instanceof(Statements.Write);
  });

  it("two WRITEs", async () => {
    const abap = `WRITE 'hello'.
    WRITE 'world'.`;
    const res = await build(abap);
    expect(res).to.not.equal(undefined);
    expect(res.length).to.equal(1);
    expect(res[0].statements.length).to.equal(2);
    expect(res[0].statements[0].get()).to.be.instanceof(Statements.Write);
    expect(res[0].statements[1].get()).to.be.instanceof(Statements.Write);
  });
});