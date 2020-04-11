import {expect} from "chai";
import {Exporting} from "../../src/rules/exporting";
import {testRule} from "./_utils";
import {Registry, MemoryFile, IRegistry} from "../../src";
import {IEdit} from "../../src/edit";

const tests = [
  {abap: "zcl_class=>methodname( EXPORTING iv_foo = '23' ).", cnt: 1},
  {abap: "zcl_class=>methodname( exporting iv_foo = '23' ).", cnt: 1},

  {abap: "zcl_class=>methodname( iv_foo = '23' ).", cnt: 0},
  {abap: "WRITE cl_abap_objectdescr=>exporting.", cnt: 0},
  {abap: "WRITE moo( cl_abap_objectdescr=>exporting ).", cnt: 0},
  {abap: "zcl_class=>methodname( importing ev_foo = bar ).", cnt: 0},
  {abap: "zcl_class=>methodname( exporting iv_foo = '23' importing ev_foo = bar ).", cnt: 0},
  {abap: "CALL METHOD lo_source->('FOOBAR') EXPORTING source = it_source.", cnt: 0},
  {abap: "CALL METHOD SUPER->CONSTRUCTOR EXPORTING TEXTID = TEXTID.", cnt: 0},
];

testRule(tests, Exporting);

function applyEdit(reg: IRegistry, edit: IEdit) {

  for (const filename in edit) {
    const rows = reg.getFileByName(filename)?.getRawRows();
    if (rows === undefined) {
      throw new Error("applyEdit, file not found");
    }

    for (const e of edit[filename]) {
// todo, only supports single within single rows
      const line = rows[e.range.start.getRow() - 1];
      rows[e.range.start.getRow() - 1] =
        line.substr(0, e.range.start.getCol() - 1) +
        e.newText +
        line.substr(e.range.end.getCol() - 1);
    }

    const result = new MemoryFile(filename, rows.join("\n"));

    reg.updateFile(result);
  }

  reg.parse();
}

describe("Exporting Rule", () => {
  it("Test fix", () => {
    const file = new MemoryFile("zfoo.prog.abap", "zcl_class=>methodname( EXPORTING iv_foo = '23' ).");
    const reg = new Registry().addFile(file).parse();
    let issues = new Exporting().run(reg.getObjects()[0], reg);
    expect(issues.length).to.equal(1);
    const fix = issues[0].getFix();
    expect(fix).to.not.equal(undefined);
    applyEdit(reg, fix!);
    issues = new Exporting().run(reg.getObjects()[0], reg);
    expect(issues.length).to.equal(0);
  });
});
