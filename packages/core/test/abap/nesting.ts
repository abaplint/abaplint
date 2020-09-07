import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {Class} from "../../src/objects";

const tests = [
  {
    n: "one",
    code: "WRITE 'Hello'.",
    top: 1,
  },
  {
    n: "two",
    code: "WRITE 'Hello'.\n" +
          "WRITE 'Hello'.\n",
    top: 2,
  },
  {
    n: "IF",
    code: "IF foo = bar.\n" +
          "WRITE 'Hello'.\n" +
          "ENDIF.",
    top: 1,
  },
  {
    n: "FORM",
    code: "FORM foo.\n" +
          "WRITE 'Hello'.\n" +
          "ENDFORM.",
    top: 1,
  },
  {
    n: "CLASS",
    code: "CLASS foobar IMPLEMENTATION.\n" +
          "METHOD foobar.\n" +
          "WRITE 'Hello'.\n" +
          "ENDMETHOD.\n" +
          "ENDCLASS.",
    top: 1,
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
  },
  {
    n: "CASE",
    code: "CASE foo.\n" +
          "WHEN 'asf'.\n" +
          "WRITE 'Hello'.\n" +
          "ENDCASE.",
    top: 1,
  },
  {
    n: "CASE2",
    code: "CASE foo.\n" +
          "  WHEN 'asf'.\n" +
          "    WRITE 'Hello'.\n" +
          "ENDCASE.\n" +
          "WRITE foo.\n",
    top: 2,
  },
  {
    n: "DO",
    code: "DO 2 TIMES.\n" +
          "WRITE 'Hello'.\n" +
          "ENDDO.",
    top: 1,
  },
  {
    n: "WHILE",
    code: "WHILE foo = bar.\n" +
          "WRITE 'Hello'.\n" +
          "ENDWHILE.",
    top: 1,
  },
  {
    n: "WHEN",
    code: "WHEN foo.\n" +
          "  WRITE 'Hello'.\n" +
          "WHEN bar.\n" +
          "  WRITE 'Hello'.\n",
    top: undefined,
  },
  {
    n: "ELSE",
    code: "IF foo = bar.\n" +
          "  WRITE 'Hello'.\n" +
          "ELSE.\n" +
          "  WRITE 'Hello'.\n" +
          "ENDIF.",
    top: 1,
  },
  {
    n: "ELSE2",
    code: "IF foo = bar.\n" +
          "  WRITE 'Hello'.\n" +
          "ELSE.\n" +
          "  WRITE 'Hello'.\n" +
          "ENDIF.\n" +
          "WRITE 'foo'.\n",
    top: 2,
  },
  {
    n: "IF2",
    code: "IF foo = bar.\n" +
          "  WRITE 'Hello'.\n" +
          "ENDIF.\n" +
          "WRITE 'foo'.\n",
    top: 2,
  },
  {
    n: "PRIVATE SECTION",
    code: "PRIVATE SECTION.\n" +
          "  DATA foo TYPE c.\n",
    top: undefined,
  },
  {
    n: "PROTECTED SECTION",
    code: "PROTECTED SECTION.\n" +
          "  DATA foo TYPE c.\n",
    top: undefined,
  },
  {
    n: "PUBLIC SECTION",
    code: "PUBLIC SECTION.\n" +
          "  DATA foo TYPE c.\n",
    top: undefined,
  },
  {
    n: "Combined SECTIONs",
    code: "PRIVATE SECTION.\n" +
          "  DATA foo TYPE c.\n" +
          "PUBLIC SECTION.\n" +
          "  DATA foo TYPE c.\n",
    top: undefined,
  },
  {
    n: "DEFINE",
    code: "DEFINE foobar.\n" +
          "  DATA foo TYPE c.\n" +
          "END-OF-DEFINITION.\n",
    top: 1,
  },
  {
    n: "LOOP",
    code: "LOOP AT foobar INTO moo.\n" +
          "  DATA foo TYPE c.\n" +
          "ENDLOOP.\n",
    top: 1,
  },
  {
    n: "Class Sections",
    code: "PUBLIC SECTION.\n" +
          "  DATA mv_text TYPE string.\n" +
          "PRIVATE SECTION.\n" +
          "  DATA mx_previous TYPE REF TO cx_root.  \n",
    top: undefined,
  },
  {
    n: "START OF SELECTION",
    code: "START-OF-SELECTION.\n" +
          "  PERFORM run.\n" +
          "CLASS lcl_foobar DEFINITION.\n" +
          "ENDCLASS.\n",
    top: 3,
  },
  {
    n: "START-OF-SELECTION 2",
    code: "START-OF-SELECTION.\n" +
          "  lcl_app=>run( ).\n" +
          "MODULE status_2000 OUTPUT.\n" +
          "  lcl_app=>status_2000( ).\n" +
          "ENDMODULE.\n",
    top: 3,
  },
  {
    n: "INITIALIZATION",
    code: "INITIALIZATION.\n" +
          "  PERFORM run.\n" +
          "CLASS lcl_foobar DEFINITION.\n" +
          "ENDCLASS.\n",
    top: 3,
  },
  {
    n: "INITIALIZATION2",
    code: "AT SELECTION-SCREEN ON VALUE-REQUEST FOR a_zip.\n" +
          "  lcl_app=>select_file( ).\n" +
          "INITIALIZATION.\n" +
          "  lcl_app=>initialization( ).\n",
    top: 4,
  },
  {
    n: "INITIALIZATION3",
    code: "INITIALIZATION.\n" +
          "  lcl_app=>initialization( ).\n" +
          "START-OF-SELECTION.\n" +
          "  lcl_app=>run( ).\n",
    top: 4,
  },
  {
    n: "Class with write after",
    code: "CLASS lcl_foo DEFINITION.\n" +
          "  PRIVATE SECTION.\n" +
          "    DATA mx_previous TYPE REF TO cx_root.\n" +
          "ENDCLASS.\n" +
          "WRITE 'foobar'.",
    top: 2,
  },
  {
    n: "TRY",
    code: "TRY.\n" +
          "    lo_html ?= iv_chunk.\n" +
          "  CATCH cx_sy_move_cast_error.\n" +
          "    ASSERT 1 = 0.\n" +
          "ENDTRY.\n",
    top: 1,
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
  },
  {
    n: "AT NEW",
    code: "AT NEW foobar.\n" +
          "  lo_html ?= iv_chunk.\n" +
          "ENDAT.\n",
    top: 1,
  },
  {
    n: "AT SELECTION-SCREEN",
    code: `AT SELECTION-SCREEN OUTPUT.
             DATA: lt_ucomm TYPE TABLE OF sy-ucomm.`,
    top: 2,
  },
];


describe("count top nesting", () => {
  tests.forEach((test) => {
    it("\"" + test.n + "\" should be " + test.top + " top statements", () => {
      const reg = new Registry().addFile(new MemoryFile("znesting.prog.abap", test.code)).parse();
      const clas = reg.getFirstObject() as Class;
      expect(clas.getMainABAPFile()?.getStructure()?.getChildren().length).to.equals(test.top);
    });
  });
});