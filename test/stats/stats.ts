import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files";
import {Stats} from "../../src/utils/stats";

describe("stats", () => {
  it("statement versions", () => {
    const abap = "WRITE boo.\nIF foo = bar.\n";
    const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
    const stats = new Stats(reg).run();

    expect(stats.statements.length).to.be.greaterThan(5);
    expect(stats.statements[0]).to.not.equal(stats.statements[stats.statements.length]);
  });

});