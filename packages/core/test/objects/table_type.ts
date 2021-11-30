import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import * as Objects from "../../src/objects";
import * as Types from "../../src/abap/types/basic";
import {GenericObjectReferenceType} from "../../src/abap/types/basic";

describe("Table Type, parse XML", () => {

  it("Call parseType", async () => {
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

    const reg = new Registry().addFile(new MemoryFile("zags_objects_tt.ttyp.xml", xml1));
    await reg.parseAsync();
    const tabl = reg.getFirstObject()! as Objects.TableType;

    const type = tabl.parseType(reg);
    expect(type).to.be.instanceof(Types.TableType);
    const row = (type as Types.TableType).getRowType();
    expect(row).to.be.instanceof(Types.UnknownType);
  });

  it("Call parseType, no ROWTYPE", async () => {
    const xml1 = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TTYP" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD40V>
    <TYPENAME>ZTEST</TYPENAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>001000</LENG>
    <ACCESSMODE>T</ACCESSMODE>
    <KEYDEF>D</KEYDEF>
    <KEYKIND>N</KEYKIND>
    <DDTEXT>Hello world</DDTEXT>
    <TYPELEN>001000</TYPELEN>
   </DD40V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFile(new MemoryFile("ztest.ttyp.xml", xml1));
    await reg.parseAsync();
    const tabl = reg.getFirstObject()! as Objects.TableType;

    const type = tabl.parseType(reg);
    expect(type).to.be.instanceof(Types.TableType);
    const row = (type as Types.TableType).getRowType();
    expect(row).to.be.instanceof(Types.CharacterType);
  });

  it("Call parseType, no ROWTYPE, no length", async () => {
    const xml1 = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TTYP" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD40V>
    <TYPENAME>ZTEST</TYPENAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <DATATYPE>STRG</DATATYPE>
    <ACCESSMODE>T</ACCESSMODE>
    <KEYDEF>D</KEYDEF>
    <KEYKIND>N</KEYKIND>
    <DDTEXT>hello world</DDTEXT>
    <TYPELEN>000008</TYPELEN>
   </DD40V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFile(new MemoryFile("ztest.ttyp.xml", xml1));
    await reg.parseAsync();
    const tabl = reg.getFirstObject()! as Objects.TableType;

    const type = tabl.parseType(reg);
    expect(type).to.be.instanceof(Types.TableType);
    const row = (type as Types.TableType).getRowType();
    expect(row).to.be.instanceof(Types.StringType);
  });

  it("Call parseType, reference to object", async () => {
    const xml1 = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TTYP" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD40V>
    <TYPENAME>ZTEST</TYPENAME>
    <ROWTYPE>ZCL_FOOBAR</ROWTYPE>
    <ROWKIND>R</ROWKIND>
    <DATATYPE>REF</DATATYPE>
    <ACCESSMODE>T</ACCESSMODE>
    <KEYDEF>D</KEYDEF>
    <KEYKIND>N</KEYKIND>
    <REFTYPE>C</REFTYPE>
   </DD40V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const abap = `CLASS zcl_foobar DEFINITION.
    ENDCLASS.
    CLASS zcl_foobar IMPLEMENTATION.
    ENDCLASS.`;

    const reg = new Registry().addFiles([
      new MemoryFile("ztest.ttyp.xml", xml1),
      new MemoryFile("zcl_foobar.clas.abap", abap),
    ]);
    await reg.parseAsync();
    const tabl = reg.getFirstObject()! as Objects.TableType;

    const type = tabl.parseType(reg);
    expect(type).to.be.instanceof(Types.TableType);
    const row = (type as Types.TableType).getRowType();
    expect(row).to.be.instanceof(Types.ObjectReferenceType);
  });

  it("string_table, row type should not have qualified name", async () => {
    const xml1 = `
    <?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0" serializer="LCL_OBJECT_TTYP" serializer_version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <DD40V>
        <TYPENAME>STRING_TABLE</TYPENAME>
        <DDLANGUAGE>E</DDLANGUAGE>
        <DATATYPE>STRG</DATATYPE>
        <ACCESSMODE>T</ACCESSMODE>
        <KEYDEF>D</KEYDEF>
        <KEYKIND>N</KEYKIND>
        <DDTEXT>String Table</DDTEXT>
        <TYPELEN>000008</TYPELEN>
       </DD40V>
      </asx:values>
     </asx:abap>
    </abapGit>`;

    const reg = new Registry().addFiles([
      new MemoryFile("string_table.ttyp.xml", xml1),
    ]);
    await reg.parseAsync();
    const tabl = reg.getFirstObject()! as Objects.TableType;

    const type = tabl.parseType(reg);
    expect(type).to.be.instanceof(Types.TableType);
    const row = (type as Types.TableType).getRowType();
    expect(row.getQualifiedName()).to.equal(undefined);
  });

  it("OBJECT ref type", async () => {
    const xml1 = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TTYP" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD40V>
    <TYPENAME>ZTTYPOBJECT</TYPENAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <ROWTYPE>OBJECT</ROWTYPE>
    <ROWKIND>R</ROWKIND>
    <DATATYPE>REF</DATATYPE>
    <ACCESSMODE>T</ACCESSMODE>
    <KEYDEF>D</KEYDEF>
    <KEYKIND>N</KEYKIND>
    <DDTEXT>object</DDTEXT>
    <REFTYPE>O</REFTYPE>
   </DD40V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFiles([
      new MemoryFile("zttypobject.ttyp.xml", xml1),
    ]);
    await reg.parseAsync();
    const tabl = reg.getFirstObject()! as Objects.TableType;

    const type = tabl.parseType(reg);
    expect(type).to.be.instanceof(Types.TableType);
    const row = (type as Types.TableType).getRowType();
    expect(row).to.be.instanceof(GenericObjectReferenceType);
  });

});