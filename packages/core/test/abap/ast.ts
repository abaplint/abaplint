import {expect} from "chai";
import {getStatements} from "./_utils";

// todo, rename and move somewhere under /test/abap/

const tests = [
  {abap: "add 2 to lv_foo.", cnt: 5},
  {abap: "CONCATENATE lv_tmp iv_pack INTO lv_xstring IN BYTE MODE.", cnt: 9},
  {abap: "EXPORT list = it_list TO DATA BUFFER lv_xstring.", cnt: 9},
  {abap: "EXPORT list = it_list moo = boo TO DATA BUFFER lv_xstring.", cnt: 12},
];

describe("ast count root children, statement", () => {
  tests.forEach((test) => {
    it("\"" + test.abap + "\" should have " + test.cnt, () => {
      const slist = getStatements(test.abap);
      expect(slist[0].getChildren().length).to.equals(test.cnt);
    });
  });
});