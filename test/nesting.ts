import "../typings/index.d.ts";
import File from "../src/file";
import Runner from "../src/runner";
import * as chai from "chai";

let expect = chai.expect;

describe("nesting", () => {
  let tests = [
    {
      n: "1",
      code: "WRITE 'Hello'.",
      top: 1,
    },
    {
      n: "2",
      code: "WRITE 'Hello'.\n" +
            "WRITE 'Hello'.\n",
      top: 2,
    },
    {
      n: "3",
      code: "IF foo = bar.\n" +
            "WRITE 'Hello'.\n" +
            "ENDIF.",
      top: 1,
    },
    {
      n: "4",
      code: "FORM foo.\n" +
            "WRITE 'Hello'.\n" +
            "ENDFORM.",
      top: 1,
    },
  ];

  tests.forEach((test) => {
    it("test " + test.n + " should be " + test.top, () => {
      let file = new File("temp.abap", test.code);
      Runner.run([file]);
      expect(file.getNesting().length).to.equals(test.top);
    });
  });
});
