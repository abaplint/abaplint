import {expect} from "chai";
import {CheckDDIC} from "../../src/rules/check_ddic";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {fullErrorNamespace} from "./_utils";

describe("Rule: no_unknown_ddic", () => {

  it("AFF DTEL example, domain", async () => {
    const json = `{
  "formatVersion": "1",
  "header": {
    "description": "Example data element",
    "originalLanguage": "en"
  },
  "dataTypeInformation": {
    "category": "domain",
    "typeName": "Z_AFF_EXAMPLE_DOMA"
  },
  "fieldLabels": {
    "short": "Example",
    "shortLength": 10,
    "medium": "Example field",
    "mediumLength": 13,
    "long": "Example data element field",
    "longLength": 26,
    "heading": "Example data element",
    "headingLength": 20
  },
  "additionalProperties": {
    "searchHelp": {
      "name": "ZAS_AFF_EXAMPLE_SH",
      "parameter": "LAND1"
    },
    "bidirectionalOptions": {
      "basicDirection": "rightToLeft"
    },
    "parameterId": "LND",
    "defaultComponentName": "LAND1"
  }
}`;
    const reg = new Registry().addFile(new MemoryFile("z_aff_example_domain.dtel.json", json));
    await reg.parseAsync();

    const issues = new CheckDDIC().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("Z_AFF_EXAMPLE_DOMA, lookupDomain");
  });

  it("AFF DTEL example, predefined type", async () => {
    const json = `{
  "formatVersion": "1",
  "header": {
    "description": "Example data element",
    "originalLanguage": "en"
  },
  "dataTypeInformation": {
    "category": "predefinedType",
    "predefinedType": {
      "dataType": "CHAR",
      "length": 3
    }
  },
  "fieldLabels": {
    "short": "Example",
    "shortLength": 10,
    "medium": "Example field",
    "mediumLength": 13,
    "long": "Example data element field",
    "longLength": 26,
    "heading": "Example data element",
    "headingLength": 20
  },
  "additionalProperties": {
    "searchHelp": {
      "name": "ZAS_AFF_EXAMPLE_SH",
      "parameter": "LAND1"
    },
    "bidirectionalOptions": {
      "basicDirection": "rightToLeft"
    },
    "parameterId": "LND",
    "defaultComponentName": "LAND1"
  }
}`;
    const reg = new Registry().addFile(new MemoryFile("z_aff_example_predefined_type.dtel.json", json));
    await reg.parseAsync();

    const issues = new CheckDDIC().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equal(0);
  });

  it("ok, resolved, dtel", async () => {
    const xml = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZDDIC</ROLLNAME>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000002</LENG>
    <OUTPUTLEN>000002</OUTPUTLEN>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const reg = new Registry().addFile(new MemoryFile("zddic.dtel.xml", xml));
    await reg.parseAsync();

    const issues = new CheckDDIC().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equal(0);
  });

  it("error", async () => {
    const xml = "sdf";
    const reg = new Registry().addFile(new MemoryFile("zddic.dtel.xml", xml));
    await reg.parseAsync();

    const issues = new CheckDDIC().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equal(1);
  });

  it("error, DOMNAME unexpectedly empty", async () => {
    const xml = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZDDIC</ROLLNAME>
    <DOMNAME></DOMNAME>
    <REFKIND>D</REFKIND>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const reg = new Registry().addFile(new MemoryFile("zddic.dtel.xml", xml));
    await reg.parseAsync();

    const issues = new CheckDDIC().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("DOMNAME unexpectely empty");
  });

  it("TABL with REF TO DATA", async () => {
    const xml = `
  <?xml version="1.0" encoding="utf-8"?>
  <abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
   <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
    <asx:values>
     <DD02V>
      <TABNAME>ZREF</TABNAME>
      <DDLANGUAGE>E</DDLANGUAGE>
      <TABCLASS>INTTAB</TABCLASS>
      <DDTEXT>ref to data</DDTEXT>
      <EXCLASS>1</EXCLASS>
     </DD02V>
     <DD03P_TABLE>
      <DD03P>
       <FIELDNAME>REF</FIELDNAME>
       <ROLLNAME>DATA</ROLLNAME>
       <ADMINFIELD>0</ADMINFIELD>
       <DATATYPE>REF</DATATYPE>
       <MASK>  REF RD</MASK>
       <COMPTYPE>R</COMPTYPE>
       <REFTYPE>D</REFTYPE>
      </DD03P>
     </DD03P_TABLE>
    </asx:values>
   </asx:abap>
  </abapGit>`;
    const reg = new Registry().addFile(new MemoryFile("zref.tabl.xml", xml));
    await reg.parseAsync();

    const issues = new CheckDDIC().initialize(reg).run(reg.getFirstObject()!);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("DTEL with REF TO intf", async () => {
    const xml = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZINTF_REF</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <DOMNAME>ZIF_ABAPGIT_AUTH</DOMNAME>
    <HEADLEN>55</HEADLEN>
    <SCRLEN1>10</SCRLEN1>
    <SCRLEN2>20</SCRLEN2>
    <SCRLEN3>40</SCRLEN3>
    <DDTEXT>sdfsd</DDTEXT>
    <REPTEXT>sdfsd</REPTEXT>
    <SCRTEXT_S>sdfsd</SCRTEXT_S>
    <SCRTEXT_M>sdfsd</SCRTEXT_M>
    <SCRTEXT_L>sdfsd</SCRTEXT_L>
    <DTELMASTER>E</DTELMASTER>
    <DATATYPE>REF</DATATYPE>
    <REFKIND>R</REFKIND>
    <REFTYPE>I</REFTYPE>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const intf = `INTERFACE zif_abapgit_auth PUBLIC.
ENDINTERFACE.`;
    const reg = new Registry().addFile(new MemoryFile("zint_ref.dtel.xml", xml));
    reg.addFile(new MemoryFile("zif_abapgit_auth.intf.abap", intf));
    await reg.parseAsync();

    const issues = new CheckDDIC().initialize(reg).run(reg.getFirstObject()!);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("AUTH, error expected", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_AUTH" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <AUTHX>
    <FIELDNAME>YFOO</FIELDNAME>
    <ROLLNAME>YFOO</ROLLNAME>
   </AUTHX>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const reg = new Registry().addFile(new MemoryFile("yfoo.auth.xml", xml));
    await reg.parseAsync();

    const issues = new CheckDDIC().initialize(reg).run(reg.getFirstObject()!);
    expect(issues[0]?.getMessage()).to.not.equal(undefined);
  });

  it("TABL, error expected", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZFOOBAR2</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>INTTAB</TABCLASS>
    <DDTEXT>test</DDTEXT>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>SDF</FIELDNAME>
     <ROLLNAME>ZACTIVE</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <VALEXI>X</VALEXI>
     <SHLPORIGIN>F</SHLPORIGIN>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const reg = new Registry().addFile(new MemoryFile("zfoobar2.tabl.xml", xml));
    await reg.parseAsync();

    const issues = new CheckDDIC().initialize(reg).run(reg.getFirstObject()!);
    expect(issues[0]?.getMessage()).to.not.equal(undefined);
  });

  it("TABL, error expected, full error namespace", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZFOOBAR2</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>INTTAB</TABCLASS>
    <DDTEXT>test</DDTEXT>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>SDF</FIELDNAME>
     <ROLLNAME>ACTIVE</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <VALEXI>X</VALEXI>
     <SHLPORIGIN>F</SHLPORIGIN>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const reg = new Registry().addFile(new MemoryFile("zfoobar2.tabl.xml", xml));
    reg.setConfig(fullErrorNamespace());
    await reg.parseAsync();

    const issues = new CheckDDIC().initialize(reg).run(reg.getFirstObject()!);
    expect(issues[0]?.getMessage()).to.not.equal(undefined);
  });

});
