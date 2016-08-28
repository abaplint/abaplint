import "../typings/index.d.ts";
import File from "../src/file";
import Runner from "../src/runner";
import * as chai from "chai";

let expect = chai.expect;

  let tests = [
    {
      n: "one",
      code: "WRITE 'Hello'.",
      top: 1,
      firstchildren: 0,
    },
    {
      n: "two",
      code: "WRITE 'Hello'.\n" +
            "WRITE 'Hello'.\n",
      top: 2,
      firstchildren: 0,
    },
    {
      n: "IF",
      code: "IF foo = bar.\n" +
            "WRITE 'Hello'.\n" +
            "ENDIF.",
      top: 1,
      firstchildren: 1,
    },
    {
      n: "FORM",
      code: "FORM foo.\n" +
            "WRITE 'Hello'.\n" +
            "ENDFORM.",
      top: 1,
      firstchildren: 1,
    },
    {
      n: "CLASS",
      code: "CLASS foobar IMPLEMENTATION.\n" +
            "METHOD foobar.\n" +
            "WRITE 'Hello'.\n" +
            "ENDMETHOD.\n" +
            "ENDCLASS.",
      top: 1,
      firstchildren: 1,
    },
    {
      n: "multiple FORM",
      code: "FORM foo.\n" +
            "WRITE 'Hello'.\n" +
            "ENDFORM.\n" +
            "FORM foobar.\n" +
            "WRITE 'Hello'.\n" +
            "ENDFORM.",
      top: 2,
      firstchildren: 1,
    },
    {
      n: "CASE",
      code: "CASE foo.\n" +
            "WHEN 'asf'.\n" +
            "WRITE 'Hello'.\n" +
            "ENDCASE.",
      top: 1,
      firstchildren: 1,
    },
    {
      n: "CASE2",
      code: "CASE foo.\n" +
            "  WHEN 'asf'.\n" +
            "    WRITE 'Hello'.\n" +
            "ENDCASE.\n" +
            "WRITE foo.\n",
      top: 2,
      firstchildren: 1,
    },
    {
      n: "DO",
      code: "DO 2 TIMES.\n" +
            "WRITE 'Hello'.\n" +
            "ENDDO.",
      top: 1,
      firstchildren: 1,
    },
    {
      n: "WHILE",
      code: "WHILE foo = bar.\n" +
            "WRITE 'Hello'.\n" +
            "ENDWHILE.",
      top: 1,
      firstchildren: 1,
    },
    {
      n: "WHEN",
      code: "WHEN foo.\n" +
            "  WRITE 'Hello'.\n" +
            "WHEN bar.\n" +
            "  WRITE 'Hello'.\n",
      top: 2,
      firstchildren: 1,
    },
    {
      n: "ELSE",
      code: "IF foo = bar.\n" +
            "  WRITE 'Hello'.\n" +
            "ELSE.\n" +
            "  WRITE 'Hello'.\n" +
            "ENDIF.",
      top: 2,
      firstchildren: 1,
    },
    {
      n: "ELSE2",
      code: "IF foo = bar.\n" +
            "  WRITE 'Hello'.\n" +
            "ELSE.\n" +
            "  WRITE 'Hello'.\n" +
            "ENDIF.\n" +
            "WRITE 'foo'.\n",
      top: 3,
      firstchildren: 1,
    },
    {
      n: "IF2",
      code: "IF foo = bar.\n" +
            "  WRITE 'Hello'.\n" +
            "ENDIF.\n" +
            "WRITE 'foo'.\n",
      top: 2,
      firstchildren: 1,
    },
    {
      n: "PRIVATE SECTION",
      code: "PRIVATE SECTION.\n" +
            "  DATA foo TYPE c.\n",
      top: 1,
      firstchildren: 1,
    },
    {
      n: "PROTECTED SECTION",
      code: "PROTECTED SECTION.\n" +
            "  DATA foo TYPE c.\n",
      top: 1,
      firstchildren: 1,
    },
    {
      n: "PUBLIC SECTION",
      code: "PUBLIC SECTION.\n" +
            "  DATA foo TYPE c.\n",
      top: 1,
      firstchildren: 1,
    },
    {
      n: "Combined SECTIONs",
      code: "PRIVATE SECTION.\n" +
            "  DATA foo TYPE c.\n" +
            "PUBLIC SECTION.\n" +
            "  DATA foo TYPE c.\n",
      top: 2,
      firstchildren: 1,
    },
    {
      n: "DEFINE",
      code: "DEFINE foobar.\n" +
            "  DATA foo TYPE c.\n" +
            "END-OF-DEFINITION.\n",
      top: 1,
      firstchildren: 1,
    },
    {
      n: "LOOP",
      code: "LOOP AT foobar INTO moo.\n" +
            "  DATA foo TYPE c.\n" +
            "ENDLOOP.\n",
      top: 1,
      firstchildren: 1,
    },
    {
      n: "Class Sections",
      code: "PUBLIC SECTION.\n" +
            "  DATA mv_text TYPE string.\n" +
            "PRIVATE SECTION.\n" +
            "  DATA mx_previous TYPE REF TO cx_root.  \n",
      top: 2,
      firstchildren: 1,
    },
    {
      n: "START OF SELECTION",
      code: "START-OF-SELECTION.\n" +
            "  PERFORM run.\n" +
            "CLASS lcl_foobar DEFINITION.\n" +
            "ENDCLASS.\n",
      top: 2,
      firstchildren: 1,
    },
    {
      n: "START-OF-SELECTION 2",
      code: "START-OF-SELECTION.\n" +
            "  lcl_app=>run( ).\n" +
            "MODULE status_2000 OUTPUT.\n" +
            "  lcl_app=>status_2000( ).\n" +
            "ENDMODULE.\n",
      top: 2,
      firstchildren: 1,
    },
    {
      n: "INITIALIZATION",
      code: "INITIALIZATION.\n" +
            "  PERFORM run.\n" +
            "CLASS lcl_foobar DEFINITION.\n" +
            "ENDCLASS.\n",
      top: 2,
      firstchildren: 1,
    },
    {
      n: "INITIALIZATION2",
      code: "AT SELECTION-SCREEN ON VALUE-REQUEST FOR a_zip.\n" +
            "  lcl_app=>select_file( ).\n" +
            "INITIALIZATION.\n" +
            "  lcl_app=>initialization( ).\n",
      top: 2,
      firstchildren: 1,
    },
    {
      n: "INITIALIZATION3",
      code: "INITIALIZATION.\n" +
            "  lcl_app=>initialization( ).\n" +
            "START-OF-SELECTION.\n" +
            "  lcl_app=>run( ).\n",
      top: 2,
      firstchildren: 1,
    },
    {
      n: "Class with write after",
      code: "CLASS lcl_foo DEFINITION.\n" +
            "  PRIVATE SECTION.\n" +
            "    DATA mx_previous TYPE REF TO cx_root.\n" +
            "ENDCLASS.\n" +
            "WRITE 'foobar'.",
      top: 2,
      firstchildren: 1,
    },
    {
      n: "TRY",
      code: "TRY.\n" +
            "    lo_html ?= iv_chunk.\n" +
            "  CATCH cx_sy_move_cast_error.\n" +
            "    ASSERT 1 = 0.\n" +
            "ENDTRY.\n",
      top: 1,
      firstchildren: 2,
    },
    {
      n: "TRY, double CATCH",
      code: "TRY.\n" +
            "    lo_html ?= iv_chunk.\n" +
            "  CATCH cx_sy_move_cast_error.\n" +
            "    ASSERT 1 = 0.\n" +
            "  CATCH cx_sy_move_cast_error.\n" +
            "    ASSERT 1 = 0.\n" +
            "ENDTRY.\n",
      top: 1,
      firstchildren: 3,
    },
    {
      n: "AT NEW",
      code: "AT NEW foobar.\n" +
            "  lo_html ?= iv_chunk.\n" +
            "ENDAT.\n",
      top: 1,
      firstchildren: 1,
    },
    {
      n: "AT SELECTION-SCREEN",
      code: "AT SELECTION-SCREEN OUTPUT.\n" +
            "  DATA: lt_ucomm TYPE TABLE OF sy-ucomm.\n",
      top: 1,
      firstchildren: 1,
    },
  ];

describe("count top nesting", () => {
  tests.forEach((test) => {
    it("\"" + test.n + "\" should be " + test.top + " top statements", () => {
      let file = new File("temp.abap", test.code);
      Runner.run([file]);
      expect(file.getNesting().length).to.equals(test.top);
    });
  });
});

describe("count first top child nesting", () => {
  tests.forEach((test) => {
    it("\"" + test.n + "\" should be " + test.firstchildren + " first child statements", () => {
      let file = new File("temp.abap", test.code);
      Runner.run([file]);
      expect(file.getNesting()[0].getChildren().length).to.equals(test.firstchildren);
    });
  });
});