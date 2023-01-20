import {expect} from "chai";
import {IFile} from "../../src/files/_ifile";
import {MemoryFile} from "../../src/files/memory_file";
import {Position, Registry, SyntaxLogic} from "../../src";
import {Class} from "../../src/objects";

describe("qualified name", () => {
  it("strange", async () => {
    const files: IFile[] = [];

    const amoo_dtel = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>AMOO</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <DOMNAME>FLAG</DOMNAME>
    <HEADLEN>10</HEADLEN>
    <SCRLEN1>10</SCRLEN1>
    <SCRLEN2>10</SCRLEN2>
    <SCRLEN3>20</SCRLEN3>
    <DDTEXT>MOO</DDTEXT>
    <REPTEXT>MOO</REPTEXT>
    <SCRTEXT_S>MOO</SCRTEXT_S>
    <SCRTEXT_M>MOO</SCRTEXT_M>
    <SCRTEXT_L>MOO</SCRTEXT_L>
    <DTELMASTER>D</DTELMASTER>
    <REFKIND>D</REFKIND>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    files.push(new MemoryFile("amoo.dtel.xml", amoo_dtel));

    const flag_doma = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DOMA" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD01V>
    <DOMNAME>FLAG</DOMNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000001</LENG>
    <OUTPUTLEN>000001</OUTPUTLEN>
    <DDTEXT>FOO</DDTEXT>
   </DD01V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    files.push(new MemoryFile("flag.doma.xml", flag_doma));

    const char1_dtel = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>CHAR1</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <DOMNAME>FLAG</DOMNAME>
    <DDTEXT>CHAR1</DDTEXT>
    <DTELMASTER>D</DTELMASTER>
    <REFKIND>D</REFKIND>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    files.push(new MemoryFile("char1.dtel.xml", char1_dtel));

    const clas = `CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    DATA mv_compress TYPE char1.
ENDCLASS.

CLASS zcl_foobar IMPLEMENTATION.

ENDCLASS.`;
    files.push(new MemoryFile("zcl_foobar.clas.abap", clas));

    const reg = new Registry().addFiles(files).parse();
    expect(reg.getObjectCount()).to.equal(4);

    const obj = reg.getObject("CLAS", "ZCL_FOOBAR") as Class;
    const scope = new SyntaxLogic(reg, obj).run().spaghetti.lookupPosition(new Position(2, 1), "zcl_foobar.clas.abap");
    expect(scope).to.not.equal(undefined);
    const def = scope!.findClassDefinition("ZCL_FOOBAR");
    expect(def).to.not.equal(undefined);
    for (const a of def!.getAttributes().getAll()) {
      expect(a.getName()).to.equal("mv_compress");
      expect(a.getType().getQualifiedName()).to.equal("CHAR1");
      expect(a.getType().getDDICName()).to.equal("CHAR1");
    }
  });

});