import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Class, ClassCategory} from "../../src/objects";
import {Visibility} from "../../src/abap/types/visibility";

// todo, most(all?) of these tests to be moved to abap/types/class_definition
// or other file under abap/types

describe("Objects, class, isException", () => {

  it("false, parser error", () => {
    const reg = new Registry().addFile(new MemoryFile("cl_foo.clas.abap", "WRITE foo.")).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getClassDefinition()).to.equal(undefined);
  });

  it("false", () => {
    const abap = "CLASS zcl_abapgit_moo DEFINITION PUBLIC\n" +
      "FINAL CREATE PUBLIC.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_abapgit_moo IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_abapgit_moo.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getClassDefinition()).to.not.equal(undefined);
    expect(clas.getClassDefinition()!.isException()).to.equal(false);
  });

  it("true", () => {
    const abap = "CLASS zcx_abapgit_cancel DEFINITION PUBLIC\n" +
      "INHERITING FROM cx_static_check FINAL CREATE PUBLIC.\n" +
      "ENDCLASS.\n" +
      "CLASS zcx_abapgit_cancel IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcx_foo.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getClassDefinition()).to.not.equal(undefined);
    expect(clas.getClassDefinition()!.isException()).to.equal(true);
  });

  it("not parsed", () => {
    const reg = new Registry().addFile(new MemoryFile("zcx_foo.clas.abap", "foo bar"));
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getClassDefinition()).to.equal(undefined);
  });

});

describe("Objects, class, getName", () => {

  it("test", () => {
    const abap = "class zcl_name definition public create public.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_name IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_name.clas.abap", abap)).parse();
    const obj = reg.getObjects()[0];
    expect(obj.getName()).to.equal("ZCL_NAME");
  });

});

describe("Objects, class, isGlobal / isLocal", () => {

  it("test", () => {
    const abap = "class zcl_name definition public create public.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_name IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_name.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getClassDefinition()).to.not.equal(undefined);
    expect(clas.getClassDefinition()!.isGlobal()).to.equal(true);
    expect(clas.getClassDefinition()!.isLocal()).to.equal(false);
  });

});

describe("Objects, class, getSuperClass", () => {

  it("test, positive", () => {
    const abap = "class ZCL_WITH_SUPER definition public inheriting from ZCL_SUPER final create public.\n" +
      "ENDCLASS.\n" +
      "CLASS ZCL_WITH_SUPER IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_with_super.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getClassDefinition()).to.not.equal(undefined);
    expect(clas.getClassDefinition()!.getSuperClass()).to.equal("ZCL_SUPER");
  });


  it("test, negative", () => {
    const abap = "class ZCL_WITH_SUPER definition public final create public.\n" +
      "ENDCLASS.\n" +
      "CLASS ZCL_WITH_SUPER IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_with_super.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getClassDefinition()).to.not.equal(undefined);
    expect(clas.getClassDefinition()!.getSuperClass()).to.equal(undefined);
  });

  it("test, parser error", () => {
    const abap = "parser error";
    const reg = new Registry().addFile(new MemoryFile("zcl_with_super.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getClassDefinition()).to.equal(undefined);
  });

});

describe("Objects, class, getMethodDefinitions", () => {
  it("test, positive", () => {
    const abap = "CLASS zcl_with_super DEFINITION PUBLIC CREATE PUBLIC.\n" +
    "  PUBLIC SECTION.\n" +
    "  PROTECTED SECTION.\n" +
    "  PRIVATE SECTION.\n" +
    "    METHODS method1.\n" +
    "ENDCLASS.\n" +
    "CLASS ZCL_WITH_SUPER IMPLEMENTATION.\n" +
    "  METHOD method1.\n" +
    "  ENDMETHOD.\n" +
    "ENDCLASS.";

    const reg = new Registry().addFile(new MemoryFile("zcl_with_super.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getClassDefinition()).to.not.equal(undefined);
    expect(clas.getClassDefinition()!.getMethodDefinitions()).to.not.equal(undefined);
    const methods = clas.getClassDefinition()!.getMethodDefinitions();
    expect(methods.getPrivate().length).to.equal(1);
    expect(methods.getPrivate()[0].getName()).to.equal("method1");
    expect(methods.getPrivate()[0].getVisibility()).to.equal(Visibility.Private);
  });

  it("test, parser error", () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_with_super.clas.abap", "parser error")).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getClassDefinition()).to.equal(undefined);
  });

  it("positive, instance method, single parameter", function () {
    const abap = "CLASS zcl_foobar DEFINITION PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS method1 IMPORTING foo TYPE i.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD method1.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_foobar.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getClassDefinition()).to.not.equal(undefined);
    expect(clas.getClassDefinition()!.getMethodDefinitions()).to.not.equal(undefined);
    const methods = clas.getClassDefinition()!.getMethodDefinitions()!.getAll();
    expect(methods.length).to.equal(1);
    const parameters = methods[0].getParameters();
    expect(parameters.getImporting().length).to.equal(1);
  });

});

describe("Objects, class, getAttributes", () => {

  it("test, positive, instance", () => {
    const abap = "CLASS zcl_foobar DEFINITION PUBLIC CREATE PUBLIC.\n" +
    "  PUBLIC SECTION.\n" +
    "  PROTECTED SECTION.\n" +
    "  PRIVATE SECTION.\n" +
    "    DATA moo TYPE i.\n" +
    "ENDCLASS.\n" +
    "CLASS zcl_foobar IMPLEMENTATION.\n" +
    "ENDCLASS.";

    const reg = new Registry().addFile(new MemoryFile("zcl_foobar.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getClassDefinition()).to.not.equal(undefined);
    expect(clas.getClassDefinition()!.getAttributes()).to.not.equal(undefined);
    const attr = clas.getClassDefinition()!.getAttributes();
    expect(attr.getInstance().length).to.equal(1);
    expect(attr.getInstance()[0].getName()).to.equal("moo");
    expect(attr.getInstance()[0].getVisibility()).to.equal(Visibility.Private);
    expect(attr.getStatic().length).to.equal(0);
  });

  it("test, positive, enum", () => {
    const abap = "CLASS zcl_foobar DEFINITION PUBLIC CREATE PUBLIC.\n" +
    "  PUBLIC SECTION.\n" +
    "    TYPES:\n" +
    "      BEGIN OF ENUM enum_name,\n" +
    "        value1,\n" +
    "      END OF ENUM enum_name.    \n" +
    "  PROTECTED SECTION.\n" +
    "  PRIVATE SECTION.\n" +
    "ENDCLASS.\n" +
    "CLASS zcl_foobar IMPLEMENTATION.\n" +
    "ENDCLASS.";

    const reg = new Registry().addFile(new MemoryFile("zcl_foobar.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getClassDefinition()).to.not.equal(undefined);
    expect(clas.getClassDefinition()!.getAttributes()).to.not.equal(undefined);
    const attr = clas.getClassDefinition()!.getAttributes()!;
    expect(attr.getConstants().length).to.equal(1);
    expect(attr.getConstants()[0].getName()).to.equal("value1");
    expect(attr.getConstants()[0].getVisibility()).to.equal(Visibility.Public);
  });

  it("test, positive, static", () => {
    const abap = "CLASS zcl_foobar DEFINITION PUBLIC CREATE PUBLIC.\n" +
    "  PUBLIC SECTION.\n" +
    "  PROTECTED SECTION.\n" +
    "  PRIVATE SECTION.\n" +
    "    CLASS-DATA moo TYPE i.\n" +
    "ENDCLASS.\n" +
    "CLASS zcl_foobar IMPLEMENTATION.\n" +
    "ENDCLASS.";

    const reg = new Registry().addFile(new MemoryFile("zcl_foobar.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getClassDefinition()).to.not.equal(undefined);
    expect(clas.getClassDefinition()!.getAttributes()).to.not.equal(undefined);
    const attr = clas.getClassDefinition()!.getAttributes();
    expect(attr.getStatic().length).to.equal(1);
    expect(attr.getStatic().length).to.equal(1);
    expect(attr.getStatic()[0].getName()).to.equal("moo");
    expect(attr.getStatic()[0].getVisibility()).to.equal(Visibility.Private);
    expect(attr.getInstance().length).to.equal(0);
  });

// todo, one test for each section, plus data/static/constant

  it("test, parser error", () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_foobar.clas.abap", "parser error")).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getClassDefinition()).to.equal(undefined);
  });

});

describe("Objects, class, getCategory", () => {

  it("false", () => {
    const reg = new Registry();
/*
    const abap = "CLASS zcl_abapgit_moo DEFINITION PUBLIC\n" +
      "FINAL CREATE PUBLIC.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_abapgit_moo IMPLEMENTATION.\n" +
      "ENDCLASS.";
    reg.addFile(new MemoryFile("zcl_abapgit_moo.clas.abap", abap));
*/
    const xml = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
      "<abapGit version=\"v1.0.0\" serializer=\"LCL_OBJECT_CLAS\" serializer_version=\"v1.0.0\">\n" +
      " <asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">\n" +
      "  <asx:values>\n" +
      "   <VSEOCLASS>\n" +
      "    <CLSNAME>ZCL_ABAPGIT_MOO</CLSNAME>\n" +
      "    <VERSION>1</VERSION>\n" +
      "    <LANGU>E</LANGU>\n" +
      "    <DESCRIPT>test test</DESCRIPT>\n" +
      "    <CATEGORY>05</CATEGORY>\n" +
      "    <STATE>1</STATE>\n" +
      "    <CLSCCINCL>X</CLSCCINCL>\n" +
      "    <FIXPT>X</FIXPT>\n" +
      "    <UNICODE>X</UNICODE>\n" +
      "    <WITH_UNIT_TESTS>X</WITH_UNIT_TESTS>\n" +
      "   </VSEOCLASS>\n" +
      "  </asx:values>\n" +
      " </asx:abap>\n" +
      "</abapGit>";
    reg.addFile(new MemoryFile("zcl_abapgit_moo.clas.xml", xml));

    reg.parse();

    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getCategory()).to.equal(ClassCategory.Test);
  });

});

describe("Objects, class, getDescription", () => {

  it("test 1", () => {
    const reg = new Registry();

    const xml = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
      "<abapGit version=\"v1.0.0\" serializer=\"LCL_OBJECT_CLAS\" serializer_version=\"v1.0.0\">\n" +
      " <asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">\n" +
      "  <asx:values>\n" +
      "   <VSEOCLASS>\n" +
      "    <CLSNAME>ZCL_ABAPGIT_MOO</CLSNAME>\n" +
      "    <VERSION>1</VERSION>\n" +
      "    <LANGU>E</LANGU>\n" +
      "    <DESCRIPT>test test</DESCRIPT>\n" +
      "    <CATEGORY>05</CATEGORY>\n" +
      "    <STATE>1</STATE>\n" +
      "    <CLSCCINCL>X</CLSCCINCL>\n" +
      "    <FIXPT>X</FIXPT>\n" +
      "    <UNICODE>X</UNICODE>\n" +
      "    <WITH_UNIT_TESTS>X</WITH_UNIT_TESTS>\n" +
      "   </VSEOCLASS>\n" +
      "  </asx:values>\n" +
      " </asx:abap>\n" +
      "</abapGit>";
    reg.addFile(new MemoryFile("zcl_abapgit_moo.clas.xml", xml));

    reg.parse();

    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getDescription()).to.equal("test test");
  });

  it("test 2", () => {
    const reg = new Registry();

    const xml = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
      "<abapGit version=\"v1.0.0\" serializer=\"LCL_OBJECT_CLAS\" serializer_version=\"v1.0.0\">\n" +
      " <asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">\n" +
      "  <asx:values>\n" +
      "   <VSEOCLASS>\n" +
      "    <CLSNAME>ZCL_ABAPGIT_MOO</CLSNAME>\n" +
      "    <VERSION>1</VERSION>\n" +
      "    <LANGU>E</LANGU>\n" +
      "    <CATEGORY>05</CATEGORY>\n" +
      "    <STATE>1</STATE>\n" +
      "    <CLSCCINCL>X</CLSCCINCL>\n" +
      "    <FIXPT>X</FIXPT>\n" +
      "    <UNICODE>X</UNICODE>\n" +
      "    <WITH_UNIT_TESTS>X</WITH_UNIT_TESTS>\n" +
      "   </VSEOCLASS>\n" +
      "  </asx:values>\n" +
      " </asx:abap>\n" +
      "</abapGit>";
    reg.addFile(new MemoryFile("zcl_abapgit_moo.clas.xml", xml));

    reg.parse();

    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getDescription()).to.equal("");
  });

});