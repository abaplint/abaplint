import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {LocalVariableNames, LocalVariableNamesConf} from "../../src/rules";
import {Issue} from "../../src/issue";

async function findIssues(abap: string, config?: LocalVariableNamesConf): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoobar.prog.abap", abap));
  await reg.parseAsync();
  const rule = new LocalVariableNames();
  if (config) {
    rule.setConfig(config);
  }
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: local variable names (required pattern)", () => {
  const anyUpToThreeLetterPrefix = "^[a-zA-Z]{1,3}_.*$";
  const fsPrefix = "^<[a-zA-Z]{1,3}_.*>$";

  it("parser error", async () => {
    const abap = "sdf lksjdf lkj sdf";
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("local variable with prefix", async () => {
    const abap = `
    FORM foobar.
    DATA lv_moo TYPE i.
    ENDFORM.`;

    const config = new LocalVariableNamesConf();
    config.expectedData = anyUpToThreeLetterPrefix;
    config.patternKind = "required";
    expect((await findIssues(abap, config)).length).to.equal(0);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config)).length).to.equal(1);

    config.patternKind = undefined;
    expect((await findIssues(abap, config)).length).to.equal(0);
  });

  it("local variable without prefix, FORM", async () => {
    const abap = `
    FORM foobar.
    DATA moo TYPE i.
    ENDFORM.`;

    const config = new LocalVariableNamesConf();
    config.expectedData = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect((await findIssues(abap, config)).length).to.equal(1);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config)).length).to.equal(0);

    config.patternKind = undefined;
    expect((await findIssues(abap, config)).length).to.equal(1);
  });

  it("local variable without prefix inside METHOD", async () => {
    const abap = `
CLASS foo IMPLEMENTATION.
    METHOD foobar.
      DATA moo TYPE i.
    ENDMETHOD.
ENDCLASS.`;

    const config = new LocalVariableNamesConf();
    config.expectedData = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect((await findIssues(abap, config)).length).to.equal(1);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config)).length).to.equal(0);
  });

  it("local nested structure with prefix inside METHOD", async () => {
    const abap = `
    CLASS lcl_abapgit_object_ddlx DEFINITION.
    PUBLIC SECTION.
      METHODS clear_fields.
  ENDCLASS.


  CLASS lcl_abapgit_object_ddlx IMPLEMENTATION.

    METHOD clear_fields.

      DATA:
        BEGIN OF ls_fields_to_clear,
          BEGIN OF metadata,
            created_at    TYPE c,
            created_by    TYPE c,
            changed_at    TYPE c,
            changed_by    TYPE c,
            responsible   TYPE c,
            BEGIN OF package_ref,
              name TYPE c,
            END OF package_ref,
            BEGIN OF container_ref,
              package_name TYPE c,
            END OF container_ref,
            version       TYPE c,
            master_system TYPE c,
          END OF metadata,
        END OF ls_fields_to_clear.

      CLEAR ls_fields_to_clear.

    ENDMETHOD.
  ENDCLASS.`;

    const config = new LocalVariableNamesConf();
    config.expectedData = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect((await findIssues(abap, config)).length).to.equal(0);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config)).length).to.equal(1);
  });

  it("local nested structure without prefix inside METHOD", async () => {
    const abap = `
    CLASS lcl_abapgit_object_ddlx DEFINITION.
    PUBLIC SECTION.
      METHODS clear_fields.
  ENDCLASS.


  CLASS lcl_abapgit_object_ddlx IMPLEMENTATION.

    METHOD clear_fields.

      DATA:
        BEGIN OF fields_to_clear,
          BEGIN OF metadata,
            created_at    TYPE c,
            created_by    TYPE c,
            changed_at    TYPE c,
            changed_by    TYPE c,
            responsible   TYPE c,
            BEGIN OF package_ref,
              name TYPE c,
            END OF package_ref,
            BEGIN OF container_ref,
              package_name TYPE c,
            END OF container_ref,
            version       TYPE c,
            master_system TYPE c,
          END OF metadata,
        END OF fields_to_clear.

      CLEAR ls_fields_to_clear.

    ENDMETHOD.
  ENDCLASS.`;

    const config = new LocalVariableNamesConf();
    config.expectedData = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect((await findIssues(abap, config)).length).to.equal(1);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config)).length).to.equal(0);
  });

  it("local variable without prefix inside Function Module", async () => {
    const abap = `
FUNCTION foo.
  DATA moo TYPE i.
ENDFUNCTION.`;
    const config = new LocalVariableNamesConf();
    config.expectedData = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect((await findIssues(abap, config)).length).to.equal(1);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config)).length).to.equal(0);
  });

  it("no prefix, FORM, fieldsymbol", async () => {
    const abap = `
FORM foobar.
  FIELD-SYMBOLs <moo> TYPE i.
ENDFORM.`;
    const config = new LocalVariableNamesConf();
    config.expectedFS = fsPrefix;

    config.patternKind = "required";
    expect((await findIssues(abap, config)).length).to.equal(1);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config)).length).to.equal(0);
  });

  it("prefix, FORM, fieldsymbol", async () => {
    const abap = `
FORM foobar.
  FIELD-SYMBOLs <lv_moo> TYPE i.
ENDFORM.`;
    const config = new LocalVariableNamesConf();
    config.expectedFS = fsPrefix;

    config.patternKind = "required";
    expect((await findIssues(abap, config)).length).to.equal(0);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config)).length).to.equal(1);
  });

  it("prefix, FORM, DATA BEGIN OF", async () => {
    const abap = `
FORM foobar.
  DATA: BEGIN OF ls_foo,
                 moob TYPE i,
        END OF ls_foo.
ENDFORM.`;
    const config = new LocalVariableNamesConf();
    config.expectedData = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect((await findIssues(abap, config)).length).to.equal(0);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config)).length).to.equal(1);
  });

  it("no prefix, FORM, DATA BEGIN OF", async () => {
    const abap = `
FORM foobar.
  DATA: BEGIN OF foo,
            moob TYPE i,
        END OF foo.
ENDFORM.`;
    const config = new LocalVariableNamesConf();
    config.expectedData = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect((await findIssues(abap, config)).length).to.equal(1);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config)).length).to.equal(0);
  });

  it("no prefix, local constant", async () => {
    const abap = `
FORM foobar.
  CONSTANTS foo TYPE c VALUE 'A' LENGTH 1.
ENDFORM.`;
    const config = new LocalVariableNamesConf();
    config.expectedConstant = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect((await findIssues(abap, config)).length).to.equal(1);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config)).length).to.equal(0);
  });

  it("prefix, local constant", async () => {
    const abap = `
FORM foobar.
  CONSTANTS lc_foo TYPE c VALUE 'A' LENGTH 1.
ENDFORM.`;
    const config = new LocalVariableNamesConf();
    config.expectedConstant = anyUpToThreeLetterPrefix;

    config.patternKind = "required";
    expect((await findIssues(abap, config)).length).to.equal(0);

    config.patternKind = "forbidden";
    expect((await findIssues(abap, config)).length).to.equal(1);
  });

  it("ok, local constant structure", async () => {
    const abap = `
FORM foobar.
  CONSTANTS: BEGIN OF lc_parameter_type,
              import TYPE vepparamtype VALUE 'I',
              export TYPE vepparamtype VALUE 'O',
              END OF lc_parameter_type.
ENDFORM.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);

      // todo prefix - not supported by parser yet (this syntax will never report any issues)
  });

  it("local variable, defined inline, expect prefix", async () => {
    const abap = `
FORM foobar.
  DATA(dsfs) = 2.
ENDFORM.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("local variable, defined inline, ok", async () => {
    const abap = `
FORM foobar.
  DATA(lv_dsfs) = 2.
ENDFORM.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("local fs, defined inline, expect prefix", async () => {
    const abap = `
FORM foobar.
  LOOP AT bar ASSIGNING FIELD-SYMBOL(<bar>).
  ENDLOOP.
ENDFORM.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("local fs, defined inline, ok", async () => {
    const abap = `
FORM foobar.
  LOOP AT bar ASSIGNING FIELD-SYMBOL(<lv_bar>).
  ENDLOOP.
ENDFORM.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });


});