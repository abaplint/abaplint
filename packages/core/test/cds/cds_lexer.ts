import {expect} from "chai";
import {CDSLexer} from "../../src/cds/cds_lexer";
import {MemoryFile} from "../../src/files/memory_file";
import {Comment, Identifier} from "../../src/abap/1_lexer/tokens";

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
    expect(result.length).to.equal(17);
    expect(result[13].getStr()).to.equal("{");
    expect(result[13].getRow()).to.equal(4);
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
    expect(result.length).to.equal(17);
    expect(result[13].getStr()).to.equal("{");
    expect(result[13].getRow()).to.equal(4);

    expect(result[5]).to.be.instanceof(Comment);
    expect(result[5].getCol()).to.equal(24);
  });

  it("eq without spaces", () => {
    const cds = `when I_asdfsd.Name='' then 2`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const result = CDSLexer.run(file);
    expect(result.length).to.equal(8);
    expect(result[4].getStr()).to.equal("=");
  });

  it("lt without spaces", () => {
    const cds = `when I_asdfsd.Name<'' then 2`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const result = CDSLexer.run(file);
    expect(result.length).to.equal(8);
    expect(result[4].getStr()).to.equal("<");
  });

  it("gt without spaces", () => {
    const cds = `when I_asdfsd.Name>'' then 2`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const result = CDSLexer.run(file);
    expect(result.length).to.equal(8);
    expect(result[4].getStr()).to.equal(">");
  });

  it("dash dash comment without whitespace", () => {
    const cds = `foo--comment`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const result = CDSLexer.run(file);
    expect(result.length).to.equal(2);
    expect(result[0]).to.be.instanceof(Identifier);
    expect(result[1]).to.be.instanceof(Comment);
  });

  it("simple string", () => {
    const cds = `'hello'`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const result = CDSLexer.run(file);
    expect(result.length).to.equal(1);
    expect(result[0]).to.be.instanceof(Identifier);
  });

  it.only("string with double quote", () => {
    const cds = `'he''llo'`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const result = CDSLexer.run(file);
    expect(result.length).to.equal(1);
    expect(result[0]).to.be.instanceof(Identifier);
    expect(result[0].getStr()).to.equal(cds);
  });

});