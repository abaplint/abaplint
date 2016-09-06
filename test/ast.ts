import "../typings/index.d.ts";
import * as chai from "chai";
import Runner from "../src/runner";
import {File} from "../src/file";

let expect = chai.expect;

let tests = [
  {abap: "add 2 to lv_foo.", cnt: 4},
  {abap: "CONCATENATE lv_tmp iv_pack INTO lv_xstring IN BYTE MODE.", cnt: 8},
  {abap: "EXPORT list = it_list TO DATA BUFFER lv_xstring.", cnt: 6},
  {abap: "EXPORT list = it_list moo = boo TO DATA BUFFER lv_xstring.", cnt: 6},
];

describe("ast count root children", () => {
  tests.forEach((test) => {
    let file = Runner.parse([new File("temp.abap", test.abap)])[0];
    let slist = file.getStatements();
    it("\"" + test.abap + "\" should have " + test.cnt, () => {
      expect(slist[0].getRoot().getChildren().length).to.equals(test.cnt);
    });
  });
});