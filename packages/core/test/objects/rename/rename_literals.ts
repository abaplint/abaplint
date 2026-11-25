import {MemoryFile} from "../../../src/files/memory_file";
import {expect} from "chai";
import {Renamer} from "../../../src/objects/rename/renamer";
import {Registry} from "../../../src/registry";

describe("Rename literals", () => {

  const foo = `CLASS zcl_foo DEFINITION PUBLIC FINAL CREATE PUBLIC.
ENDCLASS.
CLASS zcl_foo IMPLEMENTATION.
ENDCLASS.`;

  function prog(body: string): MemoryFile {
    return new MemoryFile("zprog.prog.abap", "REPORT zprog.\n" + body);
  }

  function run(body: string, newName: string, literals = true): string {
    const reg = new Registry().addFiles([new MemoryFile("zcl_foo.clas.abap", foo), prog(body)]).parse();
    const renamer = new Renamer(reg);
    renamer.rename("CLAS", "zcl_foo", newName);
    if (literals === true) {
      renamer.renameLiterals([{oldName: "zcl_foo", newName}]);
    }
    return reg.getFileByName("zprog.prog.abap")!.getRaw();
  }

  it("character literal, upper case", () => {
    const result = run(`DATA ref TYPE REF TO object.
CREATE OBJECT ref TYPE ('ZCL_FOO').`, "zcl_bar");
    expect(result).to.include("TYPE ('ZCL_BAR')");
  });

  it("string literal and template, lower and mixed case become lower case", () => {
    const result = run(`DATA(a) = \`zcl_foo\`.
DATA(b) = |Zcl_Foo { a }|.`, "zcl_bar");
    expect(result).to.include("DATA(a) = `zcl_bar`.");
    expect(result).to.include("DATA(b) = |zcl_bar { a }|.");
  });

  it("two literals in one row", () => {
    const result = run(`DATA(a) = \`ZCL_FOO\` && \`, zcl_foo\`.`, "zcl_longer_name");
    expect(result).to.include("DATA(a) = `ZCL_LONGER_NAME` && `, zcl_longer_name`.");
  });

  it("into a namespace", () => {
    const result = run(`DATA(a) = 'ZCL_FOO'.`, "/ns/cl_foo");
    expect(result).to.include("DATA(a) = '/NS/CL_FOO'.");
  });

  it("part of a longer name, a path, a comment and code stay", () => {
    const body = `DATA(a) = \`zcl_foo_event\`.
DATA(b) = \`src/zcl_foo.clas.abap\`.
" zcl_foo in a comment
DATA(c) = 'XZCL_FOO'.`;
    const result = run(body, "zcl_bar");
    expect(result).to.include(body);
  });

  it("not without the option", () => {
    const result = run(`DATA(a) = 'ZCL_FOO'.`, "zcl_bar", false);
    expect(result).to.include("DATA(a) = 'ZCL_FOO'.");
  });

  it("an old namespaced name", () => {
    const reg = new Registry().addFiles([prog(`DATA(a) = '/NS/CL_FOO'.\nDATA(b) = \`x/ns/cl_foo\`.`)]).parse();
    const result = new Renamer(reg).renameLiterals([{oldName: "/ns/cl_foo", newName: "zcl_foo"}]);
    const raw = reg.getFileByName("zprog.prog.abap")!.getRaw();
    expect(raw).to.include("DATA(a) = 'ZCL_FOO'.");
    expect(raw).to.include("DATA(b) = `x/ns/cl_foo`.");
    expect(result.updatedFiles.has("zprog.prog.abap")).to.equal(true);
  });

  it("nothing to rename", () => {
    const reg = new Registry().addFiles([prog(`DATA(a) = 'ZCL_FOO'.`)]).parse();
    const result = new Renamer(reg).renameLiterals([]);
    expect(result.updatedFiles.size).to.equal(0);
  });
});
