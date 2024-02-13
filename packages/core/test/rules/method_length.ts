import {MethodLength, MethodLengthConf} from "../../src/rules/method_length";
import {testRule} from "./_utils";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";

function testRulesWithFile(tests: any): void {
  describe("test files for method length", () => {
    tests.forEach((test: any) => {
      it(test.description, () => {
        const reg = new Registry();
        reg.addFile(new MemoryFile(test.filename, test.abap)).parse();

        const rule = new MethodLength();
        rule.setConfig(test.conf);

        const issues = rule.initialize(reg).run(reg.getFirstObject()!);
        expect(issues.length).to.equals(test.issueLength);
      });
    });
  });
}

const confIgnoreTestClasses = new MethodLengthConf();
confIgnoreTestClasses.ignoreTestClasses = true;
confIgnoreTestClasses.statements = 3;

const confCheckTestClasses = new MethodLengthConf();
confCheckTestClasses.ignoreTestClasses = false;
confCheckTestClasses.statements = 3;

const confCheckForms = new MethodLengthConf();
confCheckForms.checkForms = false;
confCheckForms.statements = 3;

const abapTestClassOverLength = `
  CLASS ltcl_foo definition final for testing.
    PUBLIC SECTION.
      METHODS foo.
  ENDCLASS.
  CLASS ltcl_foo IMPLEMENTATION.
    METHOD foo.
      WRITE '1''.
      WRITE '2'.
      WRITE '3'.
      WRITE '4'.
    ENDMETHOD.
  ENDCLASS.`;

const abapTestClassValidLength = `
  CLASS ltcl_foo definition final for testing.
    PUBLIC SECTION.
      METHODS foo.
  ENDCLASS.
  CLASS ltcl_foo IMPLEMENTATION.
    METHOD foo.
      WRITE '1''.
      WRITE '2'.
      WRITE '3'.
    ENDMETHOD.
  ENDCLASS.`;

const abapClassOverLength = `
  CLASS zcl_foo DEFINITION CREATE PUBLIC.
    PUBLIC SECTION.
      METHODS foo.
  ENDCLASS.
  CLASS zcl_foo IMPLEMENTATION.
    METHOD foo.
      WRITE '1''.
      WRITE '2'.
      WRITE '3'.
      WRITE '4'.
    ENDMETHOD.
  ENDCLASS.`;

const abapClassValidLength = `
  CLASS zcl_foo DEFINITION CREATE PUBLIC.
  PUBLIC SECTION.
  METHODS foo.
  ENDCLASS.
  CLASS zcl_foo IMPLEMENTATION.
  METHOD foo.
  WRITE '1''.
  WRITE '2'.
  WRITE '3'.
  ENDMETHOD.
  ENDCLASS.`;

const abapFormOverLength = `
    FORM testing.
      WRITE '1'.
      WRITE '2'.
      WRITE '3'.
      WRITE '4'.
    ENDFORM.`;

const abapFormValidLength = `
    FORM testing.
      WRITE '1'.
      WRITE '2'.
      WRITE '3'.
    ENDFORM.`;

const testClassTests = [
  {abap: abapTestClassOverLength,
    description: "testclass, ignore, over length",
    conf: confIgnoreTestClasses,
    filename: `zcl_foo.clas.testclasses.abap`,
    issueLength: 0},

  {abap: abapTestClassOverLength,
    description: "testclass, check, over length",
    conf: confCheckTestClasses,
    filename: `zcl_foo.clas.testclasses.abap`,
    issueLength: 1},

  {abap: abapTestClassValidLength,
    description: "testclass, check, valid length",
    conf: confCheckTestClasses,
    filename: `zcl_foo.clas.testclasses.abap`,
    issueLength: 0},

  {abap: abapTestClassValidLength,
    description: "testclass, ignore, valid length",
    conf: confIgnoreTestClasses,
    filename: `zcl_foo.clas.testclasses.abap`,
    issueLength: 0},

  {abap: abapClassOverLength,
    description: "class, ignore, over length",
    conf: confIgnoreTestClasses,
    filename: `zcl_foo.clas.abap`,
    issueLength: 1},

  {abap: abapClassOverLength,
    description: "class, check, over length",
    conf: confCheckTestClasses,
    filename: `zcl_foo.clas.abap`,
    issueLength: 1},

  {abap: abapClassValidLength,
    description: "class, check, valid length",
    conf: confCheckTestClasses,
    filename: `zcl_foo_method_length.clas.abap`,
    issueLength: 0},

  {abap: abapFormOverLength,
    description: "form, off, over length",
    conf: confCheckForms,
    filename: `zcl_foo.clas.abap`,
    issueLength: 0},

  {abap: abapFormValidLength,
    description: "form, off, valid length",
    conf: confCheckForms,
    filename: `zcl_foo.clas.abap`,
    issueLength: 0},

  {abap: abapFormOverLength,
    description: "form, check, over length",
    conf: confCheckTestClasses,
    filename: `zcl_foo.clas.abap`,
    issueLength: 1},

  {abap: abapFormValidLength,
    description: "form, check, valid length",
    conf: confCheckTestClasses,
    filename: `zcl_foo.clas.abap`,
    issueLength: 0},

  {abap: `CLASS foo DEFINITION FOR TESTING.
  PUBLIC SECTION.
    METHODS bar.
ENDCLASS.
CLASS foo IMPLEMENTATION.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.`,
  description: "global testclass",
  conf: confIgnoreTestClasses,
  filename: `foo.clas.abap`,
  issueLength: 0},
];

testRulesWithFile(testClassTests);

const lengthTests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "METHOD foobar. ENDMETHOD.", cnt: 1},
  {abap: "METHOD foobar. WRITE foo. ENDMETHOD.", cnt: 0},

  {abap: `METHOD foobar.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  WRITE foo.
  ENDMETHOD.`, cnt: 1},

  {abap: `CLASS lcl DEFINITION ABSTRACT.
  PUBLIC SECTION.
    METHODS foo.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
ENDCLASS.`, cnt: 0},
];

testRule(lengthTests, MethodLength);


const emptyMethodTests = [
  {abap: "METHOD foobar. ENDMETHOD.", cnt: 0},
];

const config = new MethodLengthConf();
config.errorWhenEmpty = false;

testRule(emptyMethodTests, MethodLength, config);