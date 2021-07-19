import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {DDLLexer} from "../../src/ddl/ddl_lexer";
import {DDLParser, DDLKind} from "../../src/ddl/ddl_parser";

describe("DDL Parser, TABL", () => {

  it("basic lexing 1", () => {
    const ddl = `define structure sdfsd {
      field1 : type1;
    }`;
    const file = new MemoryFile("sdfsd.tabl.astablds", ddl);
    const result = DDLLexer.run(file);
    expect(result.length).to.equal(9);
  });

  it("basic parsing 2", () => {
    const ddl = `define structure sdfsd {
      field1 : type1;
    }`;
    const file = new MemoryFile("sdfsd.tabl.astablds", ddl);
    const result = new DDLParser().parse(file);
    expect(result?.name).to.equal("sdfsd");
    expect(result?.kind).to.equal(DDLKind.Structure);
    expect(result?.fields.length).to.equal(1);
    expect(result?.fields[0].name).to.equal("field1");
    expect(result?.fields[0].type).to.equal("type1");
  });

  it("basic parsing 3", () => {
    const ddl = `@EndUserText.label : 'sdfsd'
@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE
  define structure zsdfsd {
    sdfsd : abap.string(0);
  }`;
    const file = new MemoryFile("zsdfsd.tabl.astablds", ddl);
    const result = new DDLParser().parse(file);
    expect(result?.name).to.equal("zsdfsd");
    expect(result?.kind).to.equal(DDLKind.Structure);
    expect(result?.fields.length).to.equal(1);
  });

  it("basic parsing 4", () => {
    const ddl = `@EndUserText.label : 'Customizing'
@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE
@AbapCatalog.tableCategory : #TRANSPARENT
@AbapCatalog.deliveryClass : #C
@AbapCatalog.dataMaintenance : #RESTRICTED
define table zhvam_cust {
  key client : abap.clnt not null;
  foo        : abap.int2;
}`;
    const file = new MemoryFile("zhvam_cust.tabl.astablds", ddl);
    const result = new DDLParser().parse(file);
    expect(result?.name).to.equal("zhvam_cust");
    expect(result?.kind).to.equal(DDLKind.Table);
    expect(result?.fields.length).to.equal(2);
  });

  it("with include", async () => {
    const tabl = `@EndUserText.label : 'sdfsd'
@AbapCatalog.enhancement.category : #NOT_CLASSIFIED
define structure name {
  field1 : type1;
  include foobar;
}`;
    const file = new MemoryFile("zhvam_cust.tabl.astablds", tabl);
    const result = new DDLParser().parse(file);
    expect(result?.name).to.equal("name");
    expect(result?.fields.length).to.equal(2);
  });

});