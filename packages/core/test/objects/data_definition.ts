import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {DataDefinition} from "../../src/objects";
import {StructureType} from "../../src/abap/types/basic";

describe("Object: DDLS - Data Definition", () => {

  it("Get view name", async () => {
    const xml = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DDLS" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DDLS>
    <DDLNAME>ZAG_UNIT_TEST</DDLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <DDTEXT>Hello World</DDTEXT>
    <SOURCE_TYPE>V</SOURCE_TYPE>
   </DDLS>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const source = `
@AbapCatalog.sqlViewName: 'ZAG_UNIT_TEST_V'
@AbapCatalog.compiler.compareFilter: true
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Hello World'
define view ZAG_UNIT_TEST
  as select from tadir
{
  pgmid,
  object,
  obj_name
}`;
    const reg = new Registry().addFiles([
      new MemoryFile("zag_unit_test.ddls.xml", xml),
      new MemoryFile("zag_unit_test.ddls.asddls", source),
    ]);
    await reg.parseAsync();
    const ddls = reg.getFirstObject()! as DataDefinition;
    expect(ddls).to.not.equal(undefined);
    expect(ddls.getSQLViewName()).to.equal("ZAG_UNIT_TEST_V");

    const type = ddls.parseType(reg);
    expect(type).to.be.instanceof(StructureType);
    if (type instanceof StructureType) {
      expect(type.getComponents().length).to.equal(3);
    }
  });

  it("Get fields", async () => {
    const source = `
@AbapCatalog.sqlViewName: 'ZAG_UNIT_TEST_V'
@AbapCatalog.compiler.compareFilter: true
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Hello World'
define view ZAG_UNIT_TEST
  as select from tadir
{
  tadir.pgmid,
  tadir.object,
  tadir.obj_name
}`;
    const reg = new Registry().addFiles([
      new MemoryFile("zag_unit_test.ddls.asddls", source),
    ]);
    await reg.parseAsync();
    const ddls = reg.getFirstObject()! as DataDefinition;
    expect(ddls).to.not.equal(undefined);

    const type = ddls.parseType(reg);
    expect(type).to.be.instanceof(StructureType);
    if (type instanceof StructureType) {
      expect(type.getComponents().length).to.equal(3);
    }
  });

  it("Get fields, associations are not fields", async () => {
    const source = `
@AbapCatalog.sqlViewName: 'ZAG_UNIT_TEST_V'
@AbapCatalog.compiler.compareFilter: true
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Hello World'
define view ZAG_UNIT_TEST
  as select from tadir
  association [0..*] to zsdfdsfds as _assoc on _User.BusinessRoleUUID = $projection.BusinessRoleUUID
{
  tadir.pgmid,
  tadir.object,
  tadir.obj_name,
  _assoc
}`;
    const reg = new Registry().addFiles([
      new MemoryFile("zag_unit_test.ddls.asddls", source),
    ]);
    await reg.parseAsync();
    const ddls = reg.getFirstObject()! as DataDefinition;
    expect(ddls).to.not.equal(undefined);

    const type = ddls.parseType(reg);
    expect(type).to.be.instanceof(StructureType);
    if (type instanceof StructureType) {
      expect(type.getComponents().length).to.equal(3);
    }
  });

  it("Get get field names", async () => {
    const source = `
define view C_FooBar as select from I_Bar {
    @Search.defaultSearchElement : true
    @ObjectModel.text.element: ['DateFunctionName']
    key DateFunction,
    @Search.defaultSearchElement : true
    _Datefunction._DateFunctionText[1: Language = $session.system_language].DateFunctionName,
    @Search.defaultSearchElement : true
    _Datefunction._DateFunctionText[1: Language = $session.system_language].DateFunctionDescription,
    DateFunctionStartDate,
    DateFunctionEndDate
}`;
    const reg = new Registry().addFiles([
      new MemoryFile("zag_unit_test.ddls.asddls", source),
    ]);
    await reg.parseAsync();
    const ddls = reg.getFirstObject()! as DataDefinition;
    expect(ddls).to.not.equal(undefined);

    const parsed = ddls.getParsedData();
    expect(parsed?.fields.length).to.equal(5);
    expect(parsed?.fields[0].annotations.length).to.equal(2);
    expect(parsed?.fields[0].key).to.equal(true);
    expect(parsed?.fields[1].key).to.equal(false);

    const type = ddls.parseType(reg);
    expect(type).to.be.instanceof(StructureType);
    if (type instanceof StructureType) {
      const components = type.getComponents();
      expect(components.length).to.equal(5);
      expect(components[0].name).to.equal("DateFunction");
      expect(components[1].name).to.equal("DateFunctionName");
    }
  });
});