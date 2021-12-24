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
    expect(result.length).to.equal(15);

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

});