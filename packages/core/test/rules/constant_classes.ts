import {Registry} from "../../src/registry";
import {ConstantClasses, ConstantClassesConf} from "../../src/rules";
import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";

describe("rule, constant classes", () => {

  const doma = `<?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0" serializer="LCL_OBJECT_DOMA" serializer_version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <DD01V>
        <DOMNAME>GREEK_LETTERS</DOMNAME>
        <DDLANGUAGE>E</DDLANGUAGE>
        <DATATYPE>CHAR</DATATYPE>
        <LENG>000010</LENG>
        <OUTPUTLEN>000010</OUTPUTLEN>
        <VALEXI>X</VALEXI>
        <DDTEXT>Greek letters</DDTEXT>
        <DOMMASTER>E</DOMMASTER>
       </DD01V>
       <DD07V_TAB>
        <DD07V>
         <DOMNAME>GREEK_LETTERS</DOMNAME>
         <VALPOS>0001</VALPOS>
         <DDLANGUAGE>E</DDLANGUAGE>
         <DOMVALUE_L>ALPHA</DOMVALUE_L>
         <DDTEXT>Alpha</DDTEXT>
        </DD07V>
        <DD07V>
         <DOMNAME>GREEK_LETTERS</DOMNAME>
         <VALPOS>0002</VALPOS>
         <DDLANGUAGE>E</DDLANGUAGE>
         <DOMVALUE_L>BETA</DOMVALUE_L>
         <DDTEXT>Beta</DDTEXT>
        </DD07V>
        <DD07V>
         <DOMNAME>GREEK_LETTERS</DOMNAME>
         <VALPOS>0003</VALPOS>
         <DDLANGUAGE>E</DDLANGUAGE>
         <DOMVALUE_L>GAMMA</DOMVALUE_L>
         <DDTEXT>Gamma</DDTEXT>
        </DD07V>
        <DD07V>
         <DOMNAME>GREEK_LETTERS</DOMNAME>
         <VALPOS>0004</VALPOS>
         <DDLANGUAGE>E</DDLANGUAGE>
         <DOMVALUE_L>DELTA</DOMVALUE_L>
         <DDTEXT>Delta</DDTEXT>
        </DD07V>
       </DD07V_TAB>
      </asx:values>
     </asx:abap>
    </abapGit>
    `;

  it("no constants implemented", async () => {
    const abap = `
    CLASS zcl_greek_letters DEFINITION PUBLIC CREATE PRIVATE.
      PUBLIC SECTION.

    ENDCLASS.
    CLASS zcl_greek_letters IMPLEMENTATION.
    ENDCLASS.`;

    const reg = new Registry().addFile(new MemoryFile("greek_letters.doma.xml", doma));
    const config = new ConstantClassesConf();
    config.mapping = [
      {domain: "greek_letters", class: "zcl_greek_letters", useExactType: false},
    ];
    reg.addFile(new MemoryFile("zcl_greek_letters.clas.abap", abap));
    await reg.parseAsync();
    const rule = new ConstantClasses();
    rule.setConfig(config);
    const issues = rule.initialize(reg).run(reg.getFirstObject()!);

    expect(issues.length).to.equals(4);
  });

  it("not enough constants implemented", async () => {
    const abap = `
    CLASS zcl_greek_letters DEFINITION PUBLIC CREATE PRIVATE.
      PUBLIC SECTION.
        CONSTANTS alpha TYPE string VALUE \`ALPHA\`.
    ENDCLASS.
    CLASS zcl_greek_letters IMPLEMENTATION.
    ENDCLASS.`;

    const reg = new Registry().addFile(new MemoryFile("greek_letters.doma.xml", doma));
    const config = new ConstantClassesConf();
    config.mapping = [
      {domain: "greek_letters", class: "zcl_greek_letters", useExactType: false},
    ];
    reg.addFile(new MemoryFile("zcl_greek_letters.clas.abap", abap));
    await reg.parseAsync();
    const rule = new ConstantClasses();
    rule.setConfig(config);
    const issues = rule.initialize(reg).run(reg.getFirstObject()!);

    expect(issues.length).to.equals(3);
  });

  it("all constants implemented", async () => {
    const abap = `
    CLASS zcl_greek_letters DEFINITION PUBLIC CREATE PRIVATE.
      PUBLIC SECTION.
        CONSTANTS alpha TYPE string VALUE \`ALPHA\`.
        CONSTANTS beta  TYPE string VALUE \`BETA\`.
        CONSTANTS gamma TYPE string VALUE \`GAMMA\`.
        CONSTANTS delta TYPE string VALUE \`DELTA\`.
    ENDCLASS.
    CLASS zcl_greek_letters IMPLEMENTATION.
    ENDCLASS.`;

    const reg = new Registry().addFile(new MemoryFile("greek_letters.doma.xml", doma));
    const config = new ConstantClassesConf();
    config.mapping = [
      {domain: "greek_letters", class: "zcl_greek_letters", useExactType: false},
    ];
    reg.addFile(new MemoryFile("zcl_greek_letters.clas.abap", abap));
    await reg.parseAsync();
    const rule = new ConstantClasses();
    rule.setConfig(config);
    const issues = rule.initialize(reg).run(reg.getFirstObject()!);

    expect(issues.length).to.equals(0);
  });

  it("extra constant implemented", async () => {
    const abap = `
    CLASS zcl_greek_letters DEFINITION PUBLIC CREATE PRIVATE.
      PUBLIC SECTION.
        CONSTANTS alpha TYPE string VALUE \`ALPHA\`.
        CONSTANTS beta  TYPE string VALUE \`BETA\`.
        CONSTANTS gamma TYPE string VALUE \`GAMMA\`.
        CONSTANTS delta TYPE string VALUE \`DELTA\`.
        CONSTANTS feta  TYPE  string VALUE \`FETA\`.
    ENDCLASS.
    CLASS zcl_greek_letters IMPLEMENTATION.
    ENDCLASS.`;

    const reg = new Registry().addFile(new MemoryFile("greek_letters.doma.xml", doma));
    const config = new ConstantClassesConf();
    config.mapping = [
      {domain: "greek_letters", class: "zcl_greek_letters", useExactType: false},
    ];
    reg.addFile(new MemoryFile("zcl_greek_letters.clas.abap", abap));
    await reg.parseAsync();
    const rule = new ConstantClasses();
    rule.setConfig(config);
    const issues = rule.initialize(reg).run(reg.getFirstObject()!);

    expect(issues.length).to.equals(1);
  });

  it("constants in non-public section", async () => {
    const abap = `
    CLASS zcl_greek_letters DEFINITION PUBLIC CREATE PRIVATE.
      PUBLIC SECTION.
        CONSTANTS alpha TYPE string VALUE \`ALPHA\`.
        CONSTANTS beta TYPE string VALUE \`BETA\`.
      PROTECTED SECTION.
        CONSTANTS gamma TYPE string VALUE \`GAMMA\`.
      PRIVATE SECTION.
        CONSTANTS delta TYPE string VALUE \`DELTA\`.
    ENDCLASS.
    CLASS zcl_greek_letters IMPLEMENTATION.
    ENDCLASS.`;

    const reg = new Registry().addFile(new MemoryFile("greek_letters.doma.xml", doma));
    const config = new ConstantClassesConf();
    config.mapping = [
      {domain: "greek_letters", class: "zcl_greek_letters", useExactType: false},
    ];
    reg.addFile(new MemoryFile("zcl_greek_letters.clas.abap", abap));
    await reg.parseAsync();
    const rule = new ConstantClasses();
    rule.setConfig(config);
    const issues = rule.initialize(reg).run(reg.getFirstObject()!);

    expect(issues.length).to.equals(2);
  });

  it("all constants implemented (chaining)", async () => {
    const abap = `
    CLASS zcl_greek_letters DEFINITION PUBLIC CREATE PRIVATE.
      PUBLIC SECTION.
        CONSTANTS: alpha TYPE string VALUE \`ALPHA\`,
                   beta  TYPE string VALUE \`BETA\`,
                   gamma TYPE string VALUE \`GAMMA\`,
                   delta TYPE string VALUE \`DELTA\`.
    ENDCLASS.
    CLASS zcl_greek_letters IMPLEMENTATION.
    ENDCLASS.`;

    const reg = new Registry().addFile(new MemoryFile("greek_letters.doma.xml", doma));
    const config = new ConstantClassesConf();
    config.mapping = [
      {domain: "greek_letters", class: "zcl_greek_letters", useExactType: false},
    ];
    reg.addFile(new MemoryFile("zcl_greek_letters.clas.abap", abap));
    await reg.parseAsync();
    const rule = new ConstantClasses();
    rule.setConfig(config);
    const issues = rule.initialize(reg).run(reg.getFirstObject()!);

    expect(issues.length).to.equals(0);
  });

  it("all constants implemented (wrong type)", async () => {
    const abap = `
    CLASS zcl_greek_letters DEFINITION PUBLIC CREATE PRIVATE.
      PUBLIC SECTION.
        CONSTANTS: alpha TYPE greek_letters VALUE \`ALPHA\`,
                   beta  TYPE string VALUE \`BETA\`,
                   gamma TYPE string VALUE \`GAMMA\`,
                   delta TYPE greek_letters VALUE \`DELTA\`.
    ENDCLASS.
    CLASS zcl_greek_letters IMPLEMENTATION.
    ENDCLASS.`;

    const reg = new Registry().addFile(new MemoryFile("greek_letters.doma.xml", doma));
    const config = new ConstantClassesConf();
    config.mapping = [
      {domain: "greek_letters", class: "zcl_greek_letters", useExactType: true},
    ];
    reg.addFile(new MemoryFile("zcl_greek_letters.clas.abap", abap));
    await reg.parseAsync();
    const rule = new ConstantClasses();
    rule.setConfig(config);
    const issues = rule.initialize(reg).run(reg.getFirstObject()!);

    expect(issues.length).to.equals(2);
  });

  it("implementing class does not exist", async () => {
    const reg = new Registry().addFile(new MemoryFile("greek_letters.doma.xml", doma));
    const config = new ConstantClassesConf();
    config.mapping = [
      {domain: "greek_letters", class: "zcl_greek_letters", useExactType: true},
    ];
    await reg.parseAsync();
    const rule = new ConstantClasses();
    rule.setConfig(config);
    const issues = rule.initialize(reg).run(reg.getFirstObject()!);

    expect(issues.length).to.equals(1);
  });


});