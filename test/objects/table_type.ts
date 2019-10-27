import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import * as Objects from "../../src/objects";
import * as Types from "../../src/abap/types/basic";

describe("Table Type, parse XML", () => {
  const xml1 = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TTYP" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD40V>
    <TYPENAME>ZAGS_OBJECTS_TT</TYPENAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <ROWTYPE>ZAGS_OBJECTS</ROWTYPE>
    <ROWKIND>S</ROWKIND>
    <DATATYPE>STRU</DATATYPE>
    <ACCESSMODE>S</ACCESSMODE>
    <KEYDEF>K</KEYDEF>
    <KEYKIND>U</KEYKIND>
    <KEYFDCOUNT>0002</KEYFDCOUNT>
    <DDTEXT>ZAGS_OBJECTS Table Type</DDTEXT>
   </DD40V>
  </asx:values>
 </asx:abap>
</abapGit>`;

  it("Call parseType", () => {
    const reg = new Registry().addFile(new MemoryFile("zags_objects_tt.ttyp.xml", xml1)).parse();
    const tabl = reg.getObjects()[0] as Objects.TableType;

    const type = tabl.parseType(reg);
    expect(type).to.be.instanceof(Types.TableType);
    const row = (type as Types.TableType).getRowType();
    expect(row).to.be.instanceof(Types.UnknownType);
  });

});