import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Domain} from "../../src/objects";
import {CharacterType, UnknownType, StringType} from "../../src/abap/types/basic";

describe("Domain, parse main xml", () => {

  it("CharacterType", async () => {
    const xml = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DOMA" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD01V>
    <DOMNAME>zfoobar</DOMNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000050</LENG>
    <OUTPUTLEN>000050</OUTPUTLEN>
    <LOWERCASE>X</LOWERCASE>
    <DDTEXT>Branch name</DDTEXT>
   </DD01V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const reg = new Registry().addFile(new MemoryFile("zfoobar.doma.xml", xml));
    await reg.parseAsync();
    const dtel = reg.getObjects()[0] as Domain;
    const type = dtel.parseType(reg);
    expect(type).to.be.instanceof(CharacterType);
  });

  it("parser error", async () => {
    const xml = `sdfsdf`;
    const reg = new Registry().addFile(new MemoryFile("zfoobar.dtel.xml", xml));
    await reg.parseAsync();
    const dtel = reg.getObjects()[0] as Domain;
    const type = dtel.parseType(reg);
    expect(type).to.be.instanceof(UnknownType);
  });

  it("parser error, valid xml", async () => {
    const xml = `<foo></bar>`;
    const reg = new Registry().addFile(new MemoryFile("zfoobar.dtel.xml", xml));
    await reg.parseAsync();
    const dtel = reg.getObjects()[0] as Domain;
    const type = dtel.parseType(reg);
    expect(type).to.be.instanceof(UnknownType);
  });

  it("Without length", async () => {
    const xml = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DOMA" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD01V>
    <DOMNAME>zfoobar</DOMNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <DATATYPE>STRG</DATATYPE>
    <LOWERCASE>X</LOWERCASE>
    <DDTEXT>Branch name</DDTEXT>
   </DD01V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const reg = new Registry().addFile(new MemoryFile("zfoobar.doma.xml", xml));
    await reg.parseAsync();
    const dtel = reg.getObjects()[0] as Domain;
    const type = dtel.parseType(reg);
    expect(type).to.be.instanceof(StringType);
  });

});