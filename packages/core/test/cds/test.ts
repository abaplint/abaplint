import {MemoryFile} from "../../src";
import {expect} from "chai";
import {CDSLexer} from "../../src/cds/cds_lexer";
import {CDSParser} from "../../src/cds/cds_parser";
import {ExpressionNode} from "../../src/abap/nodes";

describe("CDS Parser", () => {

  it("basic", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
define view zhvamfoocust as select from zhvam_cust {
  key foo as sdfdsf
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const result = CDSLexer.run(file);
    expect(result.length).to.equal(18);

    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("ending with colon", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
define view zhvamfoocust as select from zhvam_cust {
  key foo as sdfdsf
};`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("two fields", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
    define view zhvamfoocust as select from zhvam_cust {
        key foo as sdfdsf,
        client
    };`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("more annotations", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZAG_UNIT_TEST_V'
@AbapCatalog.compiler.compareFilter: true
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Hello'
define view ZAG_UNIT_TEST
  as select from tadir
{
  pgmid,
  object,
  obj_name
} `;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("element annotation", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
    define view zhvamfoocust as select from zhvam_cust {
        key foo as sdfdsf,
        @Semantics.language
        client
    };`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("numbers", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
    define view zhvamf3oocust as select from zhv3am_cust {
        key fo3o as sdf3dsf,
        cli3ent
    };`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("single quoted text containing spaces", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
@EndUserText.label: 'foo bar hello world'
define view zhvamfoocust as select from zhvam_cust {
  key foo as sdfdsf,
  sdfds
};`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("underscore in annotation value", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
@AccessControl.authorizationCheck: #NOT_ALLOWED
define view zhvamfoocust as select from zhvam_cust {
  key foo as sdfdsf,
  sdfds
};`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

});