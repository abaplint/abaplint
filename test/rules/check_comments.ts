import {CheckCommentsConf, CheckComments} from "../../src/rules/check_comments";
import {testRuleWithVariableConfig} from "./_utils";


const configNoEndOfLine = new CheckCommentsConf();
configNoEndOfLine.allowEndOfLine = false;

const configEndOfLineAllowed = new CheckCommentsConf();
configEndOfLineAllowed.allowEndOfLine = true;

const testCases: string[] = [
  ` REPORT yfoo. " inline comment `,

  ` REPORT yfoo. " inline comment
    " normal comment
    WRITE 'abc'.`,

  ` REPORT yfoo.
    * asterisk comment
    WRITE 'abc'.`,
  ` REPORT yfoo.
    WRITE ' "abc'.
    DATA(date) = cl_reca_date=>add_to_date( id_days = 1
                                            id_date = sy-datum ). "today `,

  ` SELECT kna1~kunnr, "test
      kna1~name1 "test
      kna1~ort01 "test
      kna1~stras "test
      kna1~pstlz "test
      kna1~stceg "test
    FROM kna1 "test
    INTO TABLE mt_selection "test
    WHERE kna1~ktokd = 'ZAG' "test
      AND kna1~sperr = ' ' "test
      AND kna1~sperz = ' ' "test
    GROUP BY kunnr name1 ort01 stras pstlz stceg. "test`,

  ` WRITE: ' "fake comment '.
    WRITE: | "another fake comment  "test|.
    WRITE: '"fake comment'. "real comment
    WRITE: | "fake '"comment'|. "real comment`,

  ` CLASS zcl_foo DEFINITION CREATE PUBLIC.
      PUBLIC SECTION.
        "!abapdoc
        METHODS foo.
    ENDCLASS.`,
];

const checkCommentsTests = [
  {
    abap: testCases[0],
    description: "no end of line, with end of line",
    config: configNoEndOfLine,
    issueLength: 1,
  },
  {
    abap: testCases[0],
    description: "end of line allowed, with end of line",
    config: configEndOfLineAllowed,
    issueLength: 0,
  },
  {
    abap: testCases[1],
    description: "no end of line, normal comment + end of line",
    config: configNoEndOfLine,
    issueLength: 1,
  },
  {
    abap: testCases[1],
    description: "end of line allowed, normal comment + end of line",
    config: configEndOfLineAllowed,
    issueLength: 0,
  },
  {
    abap: testCases[2],
    description: "no end of line, asterisk comment",
    config: configNoEndOfLine,
    issueLength: 0,
  },
  {
    abap: testCases[2],
    description: "end of line allowed, asterisk comment",
    config: configEndOfLineAllowed,
    issueLength: 0,
  },
  {
    abap: testCases[3],
    description: "no end of line, inline after expr",
    config: configNoEndOfLine,
    issueLength: 1,
  },
  {
    abap: testCases[3],
    description: "end of line allowed, inline after expr",
    config: configEndOfLineAllowed,
    issueLength: 0,
  },
  {
    abap: testCases[4],
    description: "no end of line, select, multiple comments",
    config: configNoEndOfLine,
    issueLength: 12,
  },
  {
    abap: testCases[4],
    description: "end of line allowed, select, multiple comments",
    config: configEndOfLineAllowed,
    issueLength: 0,
  },
  {
    abap: testCases[5],
    description: "no end of line, writes with strings",
    config: configNoEndOfLine,
    issueLength: 2,
  },
  {
    abap: testCases[5],
    description: "end of line allowed, writes with strings",
    config: configEndOfLineAllowed,
    issueLength: 0,
  },
  {
    abap: testCases[6],
    description: "no end of line, abapdoc",
    config: configNoEndOfLine,
    issueLength: 0,
  },
  {
    abap: testCases[6],
    description: "end of line allowed, abapdoc",
    config: configEndOfLineAllowed,
    issueLength: 0,
  },
  {
    abap: `lo_obj=>method( 'sdfsdfsd'). "#EC NOTEXT`,
    description: "end of line allowed, pseudo comment",
    config: configNoEndOfLine,
    issueLength: 0,
  },

];

testRuleWithVariableConfig(checkCommentsTests, CheckComments);