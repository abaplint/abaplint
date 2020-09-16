import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files";
import {CyclomaticComplexityStats} from "../../src/utils/cyclomatic_complexity_stats";

describe("cyclomatic complexity stats", () => {

  it("parser error", async () => {
    const abap = `sdfsdfs`;
    const reg = new Registry().addFile(new MemoryFile("zcyclomatic.clas.abap", abap));
    await reg.parseAsync();
    const stats = CyclomaticComplexityStats.run(reg.getFirstObject()!);

    expect(stats.length).to.equal(0);
  });

  it("Method with IF", async () => {
    const abap = `
    CLASS foo DEFINITION.
      PUBLIC SECTION.
        METHODS foobar.
    ENDCLASS.
    CLASS foo IMPLEMENTATION.
      METHOD foobar.
        IF 1 = 3.
        ENDIF.
      ENDMETHOD.
    ENDCLASS.`;
    const reg = new Registry().addFile(new MemoryFile("zcyclomatic.clas.abap", abap));
    await reg.parseAsync();
    const stats = CyclomaticComplexityStats.run(reg.getFirstObject()!);

    expect(stats.length).to.equal(1);
    expect(stats[0].name).to.equal("foobar");
    expect(stats[0].count).to.equal(1);
  });

});