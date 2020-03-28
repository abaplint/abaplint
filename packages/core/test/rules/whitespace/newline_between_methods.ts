import {NewlineBetweenMethods, NewlineBetweenMethodsConf, NewlineLogic} from "../../../src/rules/whitespace/newline_between_methods";
import {testRuleWithVariableConfig} from "../_utils";

const configNewlineLess = new NewlineBetweenMethodsConf();
configNewlineLess.count = 2;
configNewlineLess.logic = NewlineLogic.Less;

const configNewlineExact = new NewlineBetweenMethodsConf();
configNewlineExact.count = 2;
configNewlineExact.logic = NewlineLogic.Exact;

const configInvalid = new NewlineBetweenMethodsConf();
configInvalid.count = 1;
configInvalid.logic = NewlineLogic.Less;

const testCases: string[] = [
  ` CLASS lcl_foo DEFINITION CREATE PUBLIC.
      PUBLIC SECTION.
        METHODS foo.
        METHODS abc.
    ENDCLASS.
    CLASS lcl_foo IMPLEMENTATION.
      METHOD foo.
        WRITE '4'.
      ENDMETHOD.


      METHOD abc.
        WRITE '1'.
      ENDMETHOD.
    ENDCLASS.`,

  ` CLASS lcl_foo DEFINITION CREATE PUBLIC.
      PUBLIC SECTION.
        METHODS foo.
        METHODS abc.
    ENDCLASS.
    CLASS lcl_foo IMPLEMENTATION.
      METHOD foo.
        WRITE '4'.
      ENDMETHOD.
      METHOD abc.
        WRITE '1'.
      ENDMETHOD.
    ENDCLASS.`,

  ` CLASS lcl_foo DEFINITION CREATE PUBLIC.
    PUBLIC SECTION.
      METHODS foo.
      METHODS abc.
    ENDCLASS.
    CLASS lcl_foo IMPLEMENTATION.
      METHOD foo.
        WRITE '4'.
      ENDMETHOD.

      METHOD abc.
        WRITE '1'.
      ENDMETHOD.
    ENDCLASS.`,

  ` CLASS lcl_foo DEFINITION CREATE PUBLIC.
    PUBLIC SECTION.
      METHODS foo.
      METHODS abc.
    ENDCLASS.
    CLASS lcl_foo IMPLEMENTATION.
      METHOD foo.
        WRITE '4'.
      ENDMETHOD.


      METHOD abc.
        WRITE '1'.
      ENDMETHOD.


    ENDCLASS.`,

  ` CLASS lcl_foo DEFINITION CREATE PUBLIC.
    PUBLIC SECTION.
      METHODS foo.
      METHODS abc.
      METHODS bar.
    ENDCLASS.
    CLASS lcl_foo IMPLEMENTATION.
      METHOD foo.
        WRITE '4'.
      ENDMETHOD.

      METHOD abc.
        WRITE '1'.
      ENDMETHOD.


      METHOD bar.
        WRITE '2'.
      ENDMETHOD.



    ENDCLASS.`,
];

const newlineTests = [
  {
    abap: testCases[0],
    description: "less, exact amount, no newline before endclass",
    config: configNewlineLess,
    issueLength: 1,
  },
  {
    abap: testCases[0],
    description: "exact, exact amount, no newline before endclass",
    config: configNewlineExact,
    issueLength: 0,
  },
  {
    abap: testCases[1],
    description: "less, no newlines, no newline before endclass",
    config: configNewlineLess,
    issueLength: 1,
  },
  {
    abap: testCases[1],
    description: "exact, no newlines, no newline before endclass",
    config: configNewlineExact,
    issueLength: 1,
  },
  {
    abap: testCases[2],
    description: "less, less amount",
    config: configNewlineLess,
    issueLength: 0,
  },
  {
    abap: testCases[2],
    description: "exact, less amount",
    config: configNewlineExact,
    issueLength: 1,
  },
  {
    abap: testCases[3],
    description: "less, exact amount",
    config: configNewlineLess,
    issueLength: 2,
  },
  {
    abap: testCases[3],
    description: "exact, exact amount",
    config: configNewlineExact,
    issueLength: 0,
  },
  {
    abap: testCases[4],
    description: "less, variable amount",
    config: configNewlineLess,
    issueLength: 2,
  },
  {
    abap: testCases[4],
    description: "exact, exact amount",
    config: configNewlineExact,
    issueLength: 2,
  },
  // invalid configuration: no check
  {
    abap: testCases[0],
    description: "invalid, exact amount ",
    config: configInvalid,
    issueLength: 0,
  },
  {
    abap: testCases[1],
    description: "invalid, no new lines ",
    config: configInvalid,
    issueLength: 0,
  },
  {
    abap: testCases[2],
    description: "invalid, less amount",
    config: configInvalid,
    issueLength: 0,
  },
  {
    abap: testCases[3],
    description: "invalid, exact amount",
    config: configInvalid,
    issueLength: 0,
  },
  {
    abap: testCases[4],
    description: "invalid, variable amount",
    config: configInvalid,
    issueLength: 0,
  },
];

testRuleWithVariableConfig(newlineTests, NewlineBetweenMethods);