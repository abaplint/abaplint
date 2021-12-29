import {MemoryFile} from "../../src";
import {expect} from "chai";
import {CDSLexer} from "../../src/cds/cds_lexer";

describe("CDS Lexer", () => {

  it("basic", () => {
    const cds = `define view zhvamfoocust as select from zhvam_cust {
  key foo
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const result = CDSLexer.run(file);
    expect(result.length).to.equal(11);
    expect(result[7].getStr()).to.equal("{");
    expect(result[7].getRow()).to.equal(1);
  });

  it("basic 2", () => {
    const cds = `define view zhvamfoocust as select from zhvam_cust
{
  key foo
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const result = CDSLexer.run(file);
    expect(result.length).to.equal(11);
    expect(result[7].getStr()).to.equal("{");
    expect(result[7].getRow()).to.equal(2);
  });

});