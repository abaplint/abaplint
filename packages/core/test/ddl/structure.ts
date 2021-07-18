import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {DDLLexer} from "../../src/ddl/ddl_lexer";
import {DDLParser, DDLKind} from "../../src/ddl/ddl_parser";

describe("DDL Parser, structure", () => {

  it("basic lexing", () => {
    const ddl = `define structure sdfsd {
      field1 : type1;
    }`;
    const file = new MemoryFile("sdfsd.tabl.astablds", ddl);
    const result = DDLLexer.run(file);
    expect(result.length).to.equal(9);
  });

  it("basic parsing", () => {
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

});