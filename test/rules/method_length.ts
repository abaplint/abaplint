import {MethodLength, MethodLengthConf} from "../../src/rules/method_length";
import {testRule} from "./_utils";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files";
import {expect} from "chai";

function testRulesWithFile(tests: any): void {
  describe("test files for method length", function () {
    tests.forEach((test: any) => {
      const reg = new Registry();
      reg.addFile(new MemoryFile(test.filename, test.abap)).parse();

      const rule = new MethodLength();
      rule.setConfig(test.conf);

      const issues = rule.run(reg.getObjects()[0], reg);
      it(test.description, () => {
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

const testClassTests = [
  { abap: abapTestClassOverLength,
    description: "testclass, ignore, over length",
    conf: confIgnoreTestClasses,
    filename: `zcl_foo.clas.testclasses.abap`,
    issueLength: 0},

  { abap: abapTestClassOverLength,
    description: "testclass, check, over length",
    conf: confCheckTestClasses,
    filename: `zcl_foo.clas.testclasses.abap`,
    issueLength: 1},

  { abap: abapTestClassValidLength,
    description: "testclass, check, valid length",
    conf: confCheckTestClasses,
    filename: `zcl_foo.clas.testclasses.abap`,
    issueLength: 0},

  { abap: abapTestClassValidLength,
    description: "testclass, ignore, valid length",
    conf: confIgnoreTestClasses,
    filename: `zcl_foo.clas.testclasses.abap`,
    issueLength: 0},

  { abap: abapClassOverLength,
    description: "class, ignore, over length",
    conf: confIgnoreTestClasses,
    filename: `zcl_foo.clas.abap`,
    issueLength: 1},

  { abap: abapClassOverLength,
    description: "class, check, over length",
    conf: confCheckTestClasses,
    filename: `zcl_foo.clas.abap`,
    issueLength: 1},

  { abap: abapClassValidLength,
    description: "class, check, valid length",
    conf: confCheckTestClasses,
    filename: `zcl_foo.clas.abap`,
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
];

testRule(lengthTests, MethodLength);


const emptyMethodTests = [
  {abap: "METHOD foobar. ENDMETHOD.", cnt: 0},
];

const config = new MethodLengthConf();
config.errorWhenEmpty = false;

testRule(emptyMethodTests, MethodLength, config);