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
      top: 1,
      firstchildren: 2,
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
      firstchildren: 2,
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
    it("\"" + test.n + "\" should be " + test.top + " first child statements", () => {
      let file = new File("temp.abap", test.code);
      Runner.run([file]);
      expect(file.getNesting()[0].getChildren().length).to.equals(test.firstchildren);
    });
  });
});