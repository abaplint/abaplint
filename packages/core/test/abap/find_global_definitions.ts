import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src";
import {FindGlobalDefinitions} from "../../src/abap/5_syntax/global_definitions/find_global_definitions";
import {Interface} from "../../src/objects";


describe("FindGlobalDefinitions", () => {

  it("Count untyped constants from interface", async () => {
    const abap = `
INTERFACE if_gobal PUBLIC.
  CONSTANTS field TYPE if_other=>id VALUE '1234'.
ENDINTERFACE.`;

    const files = [new MemoryFile("if_gobal.intf.abap", abap)];

    const reg = await new Registry().addFiles(files).parseAsync();
    const obj = reg.getFirstObject();

    const found = new FindGlobalDefinitions(reg).countUntyped(obj as Interface);
    expect(found).to.equal(1);
  });

  it("parse and count", async () => {
    const abap = `
CLASS cl_hello DEFINITION PUBLIC CREATE PUBLIC.
  PUBLIC SECTION.
    DATA mv_initial_ts TYPE string VALUE \`""\`. "#EC NOTEXT
    DATA mv_initial_date TYPE string VALUE \`""\`. "#EC NOTEXT
    DATA mv_initial_time TYPE string VALUE \`""\`. "#EC NOTEXT

    TYPES:
      BEGIN OF name_mapping,
        abap TYPE abap_compname,
        json TYPE string,
      END OF name_mapping.
ENDCLASS.

CLASS cl_hello IMPLEMENTATION.
ENDCLASS.`;

    const files = [new MemoryFile("cl_hello.clas.abap", abap)];

    const reg = await new Registry().addFiles(files).parseAsync();
    new FindGlobalDefinitions(reg).run();
  });

});