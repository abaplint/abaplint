import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Class, ClassCategory} from "../../src/objects";
import * as Basic from "../../src/abap/types/basic";
import {CharacterType} from "../../src/abap/types/basic";
import {getABAPObjects} from "../get_abap";
import {Visibility} from "../../src/abap/4_object_information/visibility";
import {IRegistry} from "../../src/_iregistry";
import {IClassDefinition} from "../../src/abap/types/_class_definition";
import {SyntaxLogic} from "../../src/abap/5_syntax/syntax";

// todo, most(all?) of these tests to be moved to abap/types/class_definition
// or other file under abap/types

function run(reg: IRegistry): IClassDefinition | undefined {
  const clas = getABAPObjects(reg)[0] as Class;
  const s = new SyntaxLogic(reg, clas).run().spaghetti;
  const scope = s.getTop().getFirstChild();
  return scope?.findClassDefinition(clas.getName());
}

describe("Objects, class, isException", () => {

  it("false, parser error", () => {
    const reg = new Registry().addFile(new MemoryFile("cl_foo.clas.abap", "WRITE foo.")).parse();
    const def = run(reg);
    expect(def).to.equal(undefined);
  });

  it("false", () => {
    const abap = "CLASS zcl_abapgit_moo DEFINITION PUBLIC\n" +
      "FINAL CREATE PUBLIC.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_abapgit_moo IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_abapgit_moo.clas.abap", abap)).parse();
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    expect(def!.isException()).to.equal(false);
  });

  it("true", () => {
    const abap = "CLASS zcx_abapgit_cancel DEFINITION PUBLIC\n" +
      "INHERITING FROM cx_static_check FINAL CREATE PUBLIC.\n" +
      "ENDCLASS.\n" +
      "CLASS zcx_abapgit_cancel IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcx_abapgit_cancel.clas.abap", abap)).parse();
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    expect(def!.isException()).to.equal(true);
  });

  it("not parsed", () => {
    const reg = new Registry().addFile(new MemoryFile("zcx_foo.clas.abap", "foo bar"));
    const def = run(reg);
    expect(def).to.equal(undefined);
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
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    expect(def!.isGlobal()).to.equal(true);
    expect(def!.isLocal()).to.equal(false);
  });

});

describe("Objects, class, getSuperClass", () => {

  it("test, positive", () => {
    const abap = "class ZCL_WITH_SUPER definition public inheriting from ZCL_SUPER final create public.\n" +
      "ENDCLASS.\n" +
      "CLASS ZCL_WITH_SUPER IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_with_super.clas.abap", abap)).parse();
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    expect(def!.getSuperClass()).to.equal("ZCL_SUPER");
  });

  it("test, negative", () => {
    const abap = "class ZCL_WITH_SUPER definition public final create public.\n" +
      "ENDCLASS.\n" +
      "CLASS ZCL_WITH_SUPER IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_with_super.clas.abap", abap)).parse();
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    expect(def!.getSuperClass()).to.equal(undefined);
  });

  it("test, parser error", () => {
    const abap = "parser error";
    const reg = new Registry().addFile(new MemoryFile("zcl_with_super.clas.abap", abap)).parse();
    const def = run(reg);
    expect(def).to.equal(undefined);
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
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    expect(def!.getMethodDefinitions()).to.not.equal(undefined);
    const methods = def!.getMethodDefinitions();
    expect(methods.getPrivate().length).to.equal(1);
    expect(methods.getPrivate()[0].getName()).to.equal("method1");
    expect(methods.getPrivate()[0].getVisibility()).to.equal(Visibility.Private);
  });

  it("test, parser error", () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_with_super.clas.abap", "parser error")).parse();
    const def = run(reg);
    expect(def).to.equal(undefined);
  });

  it("positive, instance method, single parameter", () => {
    const abap = "CLASS zcl_foobar DEFINITION PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS method1 IMPORTING foo TYPE i.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD method1.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_foobar.clas.abap", abap)).parse();
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    expect(def!.getMethodDefinitions()).to.not.equal(undefined);
    const methods = def!.getMethodDefinitions()!.getAll();
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
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    const attr = def!.getAttributes();
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
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    const attr = def!.getAttributes();
    expect(attr).to.not.equal(undefined);
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
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    const attr = def!.getAttributes();
    expect(attr).to.not.equal(undefined);
    expect(attr.getStatic().length).to.equal(1);
    expect(attr.getStatic().length).to.equal(1);
    expect(attr.getStatic()[0].getName()).to.equal("moo");
    expect(attr.getStatic()[0].getVisibility()).to.equal(Visibility.Private);
    expect(attr.getInstance().length).to.equal(0);
  });

  it("test, no exceptions", () => {
    const abap = `CLASS zcl_foobar DEFINITION PUBLIC CREATE PUBLIC.
      PUBLIC SECTION.
      PROTECTED SECTION.
      PRIVATE SECTION.
        CLASS-DATA:
        gt_registered_authenticators TYPE HASHED TABLE OF REF TO zif_abapgit_2fa_authenticator
                                          WITH UNIQUE KEY table_line.
    ENDCLASS.
    CLASS zcl_foobar IMPLEMENTATION.
    ENDCLASS.`;

    new Registry().addFile(new MemoryFile("zcl_foobar.clas.abap", abap)).parse();
    // just check no exceptions
  });

  it("test, constant", () => {
    const abap = "CLASS zcl_foobar DEFINITION PUBLIC CREATE PUBLIC.\n" +
    "  PUBLIC SECTION.\n" +
    "    CONSTANTS c_false TYPE c VALUE space.\n" +
    "ENDCLASS.\n" +
    "CLASS zcl_foobar IMPLEMENTATION.\n" +
    "ENDCLASS.";

    const reg = new Registry().addFile(new MemoryFile("zcl_foobar.clas.abap", abap)).parse();
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    const attr = def!.getAttributes();
    expect(attr).to.not.equal(undefined);
    expect(attr.getConstants().length).to.equal(1);
    const c = attr.getConstants()[0];
    expect(c.getName()).to.equal("c_false");
    expect(c.getType()).to.be.instanceof(CharacterType);
  });

  it("test, positive, instance, BEGIN OF", () => {
    const abap = "CLASS zcl_foobar DEFINITION PUBLIC CREATE PUBLIC.\n" +
    "  PUBLIC SECTION.\n" +
    "  PROTECTED SECTION.\n" +
    "  PRIVATE SECTION.\n" +
    "    DATA: BEGIN OF foobar,\n" +
    "            moo TYPE i,\n" +
    "          END OF foobar.\n" +
    "ENDCLASS.\n" +
    "CLASS zcl_foobar IMPLEMENTATION.\n" +
    "ENDCLASS.";

    const reg = new Registry().addFile(new MemoryFile("zcl_foobar.clas.abap", abap)).parse();
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    const attr = def!.getAttributes();
    expect(attr.getInstance().length).to.equal(1);
  });

// todo, one test for each section, plus data/static/constant

  it("test, parser error", () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_foobar.clas.abap", "parser error")).parse();
    const def = run(reg);
    expect(def).to.equal(undefined);
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

    const clas = getABAPObjects(reg)[0] as Class;
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

    const clas = getABAPObjects(reg)[0] as Class;
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

    const clas = getABAPObjects(reg)[0] as Class;
    expect(clas.getDescription()).to.equal("");
  });

});

describe("Objects, class, getTypeDefinitions", () => {

  it("test 1", () => {
    const abap =
    `CLASS zcl_foobar DEFINITION PUBLIC CREATE PUBLIC.
      PUBLIC SECTION.
        TYPES: zstr TYPE string.
    ENDCLASS.
    CLASS zcl_foobar IMPLEMENTATION.
    ENDCLASS.`;

    const reg = new Registry().addFile(new MemoryFile("zcl_foobar.clas.abap", abap)).parse();
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    const attr = def!.getTypeDefinitions().getAll();
    expect(attr.length).to.equal(1);
    expect(attr[0].getName()).to.equal("zstr");
    expect(attr[0].getType()).to.be.instanceof(Basic.StringType);
  });

  it("test, TYPES BEGIN OF", () => {
    const abap =
    `CLASS zcl_foobar DEFINITION PUBLIC CREATE PUBLIC.
      PUBLIC SECTION.
        TYPES: BEGIN OF foo,
        zstr TYPE string,
        END OF foo.
    ENDCLASS.
    CLASS zcl_foobar IMPLEMENTATION.
    ENDCLASS.`;

    const reg = new Registry().addFile(new MemoryFile("zcl_foobar.clas.abap", abap)).parse();
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    const attr = def!.getTypeDefinitions().getAll();
    expect(attr.length).to.equal(1);
    expect(attr[0].getName()).to.equal("foo");
  });

  it("test, TYPES, must be parsed in sequence", () => {
    const abap =
    `CLASS zcl_foobar DEFINITION PUBLIC CREATE PUBLIC.
      PUBLIC SECTION.
        TYPES: BEGIN OF ty_header,
          field TYPE string,
          value TYPE string,
        END OF ty_header.

        TYPES ty_headers TYPE STANDARD TABLE OF ty_header WITH DEFAULT KEY.
      ENDCLASS.
      CLASS zcl_foobar IMPLEMENTATION.
      ENDCLASS.`;

    const reg = new Registry().addFile(new MemoryFile("zcl_foobar.clas.abap", abap)).parse();
    const def = run(reg);
    expect(def).to.not.equal(undefined);
    const attr = def!.getTypeDefinitions().getAll();
    expect(attr.length).to.equal(2);
    expect(attr[0].getName()).to.equal("ty_header");
    expect(attr[0].getType()).to.not.be.instanceof(Basic.VoidType);
    expect(attr[1].getName()).to.equal("ty_headers");
    expect(attr[1].getType()).to.not.be.instanceof(Basic.VoidType);
    const tab = attr[1].getType() as Basic.TableType;
    expect(tab.getRowType()).to.not.be.instanceof(Basic.VoidType);
  });
});