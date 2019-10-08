import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {MethodParameterNames} from "../../src/rules/method_parameter_names";
import {expect} from "chai";

function findIssues(abap: string, filename: string) {
  const reg = new Registry().addFile(new MemoryFile(filename, abap)).parse();
  const rule = new MethodParameterNames();
  return rule.run(reg.getObjects()[0], reg);
}

describe(`Rule: method parameter names`, function() {
  it(`positive 1`, function () {
    const abap = `
INTERFACE zif_foobar PUBLIC.
  METHODS method1 IMPORTING foo TYPE i.
ENDINTERFACE.`;
    const issues = findIssues(abap, `zif_foobar.intf.abap`);
    expect(issues.length).to.equal(1);
  });

  it(`negative, 1`, function () {
    const abap = `
INTERFACE zif_foobar PUBLIC.
  METHODS method1 IMPORTING !iv_foo TYPE i.
ENDINTERFACE.`;
    const issues = findIssues(abap, `zif_foobar.intf.abap`);
    expect(issues.length).to.equal(0);
  });

  it(`negative`, function () {
    const abap = `
INTERFACE zif_foobar PUBLIC.
  METHODS method1 IMPORTING iv_foo TYPE i.
ENDINTERFACE.`;
    const issues = findIssues(abap, `zif_foobar.intf.abap`);
    expect(issues.length).to.equal(0);
  });

  it(`no methods, interface`, function () {
    const abap = `
INTERFACE zif_foobar PUBLIC.
ENDINTERFACE.`;
    const issues = findIssues(abap, `zif_foobar.intf.abap`);
    expect(issues.length).to.equal(0);
  });

  it(`no methods, class`, function () {
    const abap = `
CLASS zcl_foobar PUBLIC.
ENDCLASS.`;
    const issues = findIssues(abap, `zif_foobar.clas.abap`);
    expect(issues.length).to.equal(0);
  });

  it(`parser error, class`, function () {
    const abap = `sdfsd sdf sdfsd fd`;
    const issues = findIssues(abap, `zif_foobar.clas.abap`);
    expect(issues.length).to.equal(0);
  });

  it(`parser error, interface`, function () {
    const abap = `sdfsd sdf sdfsd fd`;
    const issues = findIssues(abap, `zif_foobar.intf.abap`);
    expect(issues.length).to.equal(0);
  });

  it(`skip exception`, function () {
    const abap = `
CLASS zcx_abapgit_exception DEFINITION
PUBLIC
INHERITING FROM cx_static_check
CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS constructor IMPORTING foo TYPE C OPTIONAL.
ENDCLASS.
CLASS zcx_abapgit_exception IMPLEMENTATION.
ENDCLASS.`;

    const issues = findIssues(abap, `zcx_abapgit_exception.clas.abap`);
    expect(issues.length).to.equal(0);
  });

  it(`skip p_task`, function () {
    const abap = `
INTERFACE zif_foobar PUBLIC.
  METHODS method1 IMPORTING p_task TYPE i.
ENDINTERFACE.`;
    const issues = findIssues(abap, `zif_foobar.intf.abap`);
    expect(issues.length).to.equal(0);
  });

  it(`positive, instance method`, function () {
    const abap = `
CLASS lcl_foobar DEFINITION.
  PUBLIC SECTION.
    METHODS method1 IMPORTING foo TYPE i.
ENDCLASS.`;
    const issues = findIssues(abap, `foobar.prog.abap`);
    expect(issues.length).to.equal(1);
  });

  it(`positive, static method`, function () {
    const abap = `
CLASS lcl_foobar DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS method1 IMPORTING foo TYPE i.
ENDCLASS.`;
    const issues = findIssues(abap, `foobar.prog.abap`);
    expect(issues.length).to.equal(1);
  });

  it(`end position`, function () {
    const abap = `
CLASS lcl_foobar DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS method1 IMPORTING foo TYPE i.
ENDCLASS.`;
    const issues = findIssues(abap, `foobar.prog.abap`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getEnd().getCol()).to.equal(40);
  });

  it(`ignore event handler parameter names`, function () {
    const abap = `
CLASS lcl_foobar DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS on_link_click FOR EVENT link_click OF cl_salv_events_table
  IMPORTING row column.
ENDCLASS.`;
    const issues = findIssues(abap, `foobar.prog.abap`);
    expect(issues.length).to.equal(0);
  });

});