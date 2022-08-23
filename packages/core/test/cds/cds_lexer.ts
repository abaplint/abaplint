import {MemoryFile} from "../../src";
import {expect} from "chai";
import {CDSLexer} from "../../src/cds/cds_lexer";

describe("CDS Lexer", () => {

  it("basic 1", () => {
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

  it("basic 3", () => {
    const cds = `@VDM.viewType: #BASIC

define view zhvamfoocust as select from zhvam_cust
{
  key foo
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const result = CDSLexer.run(file);
    expect(result.length).to.equal(16);
    expect(result[12].getStr()).to.equal("{");
    expect(result[12].getRow()).to.equal(4);
  });

  it("single line comment", () => {
    const cds = `@VDM.viewType: #BASIC // comment

define view zhvamfoocust as select from zhvam_cust
{
  key foo
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const result = CDSLexer.run(file);
    expect(result.length).to.equal(16);
    expect(result[12].getStr()).to.equal("{");
    expect(result[12].getRow()).to.equal(4);
  });

  it("multi line comment", () => {
    const cds = `@VDM.viewType: #BASIC /* comment
sdfsd
sdfsd */

define view zhvamfoocust as select from zhvam_cust
{
  key foo
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const result = CDSLexer.run(file);
    expect(result.length).to.equal(16);
    expect(result[12].getStr()).to.equal("{");
    expect(result[12].getRow()).to.equal(6);
  });

  it("single line comment, dashes", () => {
    const cds = `@VDM.viewType: #BASIC -- comment

define view zhvamfoocust as select from zhvam_cust
{
  key foo
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const result = CDSLexer.run(file);
    expect(result.length).to.equal(16);
    expect(result[12].getStr()).to.equal("{");
    expect(result[12].getRow()).to.equal(4);
  });

});