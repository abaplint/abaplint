import {expect} from "chai";
import {applyEditList, EditHelper, applyEditSingle} from "../src/edit_helper";
import {MemoryFile} from "../src/files";
import {Registry} from "../src/registry";
import {Position} from "../src/position";
import {ABAPObject} from "../src/objects/_abap_object";

function testDeleteStatement(abapCode: string, statementIndex: number) {
  const filename = "filename.prog.abap";
  const file = new MemoryFile(filename, abapCode);
  const reg = new Registry().addFile(file).parse();

  const abap = (reg.getFirstObject() as ABAPObject).getMainABAPFile();
  expect(abap).to.not.equal(undefined);

  const edit = EditHelper.deleteStatement(abap!, abap!.getStatements()[statementIndex]);

  applyEditSingle(reg, edit);

  const raw = reg.getFileByName(filename)?.getRaw();
  return raw;
}

describe("Edit Helper", () => {

  it("something", async () => {
    const filename = "filename.prog.abap";
    const file = new MemoryFile(filename, `line1
line2
line3
line4
line5
line6
line7`);
    const reg = new Registry().addFile(file);

    // delete line1 and line2
    const edit1 = EditHelper.deleteRange(file, new Position(1, 1), new Position(3, 1));
    // delete line4
    const edit2 = EditHelper.deleteRange(file, new Position(4, 1), new Position(5, 1));

    const changed = applyEditList(reg, [edit1, edit2]);
    expect(changed.length).to.equal(1);

    const raw = reg.getFileByName(filename)?.getRaw();
    expect(raw).to.not.contain("line1");
    expect(raw).to.not.contain("line2");
    expect(raw).to.not.contain("line4");
  });

  it("multiple edits, same line", async () => {
    const filename = "filename.prog.abap";
    const file = new MemoryFile(filename, `line1line2line3`);
    const reg = new Registry().addFile(file);

    const edit1 = EditHelper.insertAt(file, new Position(1, 6), "\n    ");
    const edit2 = EditHelper.insertAt(file, new Position(1, 11), "\n    ");

    const changed = applyEditList(reg, [edit1, edit2]);
    expect(changed.length).to.equal(1);

    const raw = reg.getFileByName(filename)?.getRaw();
    expect(raw).to.equal(`line1
    line2
    line3`);
  });

  it("deleteStatement, normal", async () => {
    const result = testDeleteStatement(`DATA foo TYPE c.`, 0);
    expect(result).to.equal(``);
  });

  it("deleteStatement, only one statement in chain", async () => {
    const result = testDeleteStatement(`DATA: foo TYPE c.`, 0);
    expect(result).to.equal(``);
  });

  it("deleteStatement, first statement in chain", async () => {
    const result = testDeleteStatement(`DATA: foo TYPE c, bar TYPE c.`, 0);
    expect(result).to.equal(`DATA:  bar TYPE c.`);
  });

  it("deleteStatement, last statement in chain", async () => {
    const result = testDeleteStatement(`DATA: foo TYPE c, bar TYPE c.`, 1);
    expect(result).to.equal(`DATA: foo TYPE c. `);
  });

  it("deleteStatement, first statement in chain, multi line", async () => {
    const result = testDeleteStatement(`
DATA: foo TYPE c,
      bar TYPE c.`, 0);
    expect(result).to.equal(`
DATA: ` + `
      bar TYPE c.`);
  });

  it("deleteStatement, last statement in chain, multi line", async () => {
    const result = testDeleteStatement(`
DATA: foo TYPE c,
      bar TYPE c.`, 1);
    expect(result).to.equal(`
DATA: foo TYPE c.
      `);
  });

});