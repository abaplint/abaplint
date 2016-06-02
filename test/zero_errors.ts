import "../typings/index.d.ts";
import Runner from "../src/runner";
import File from "../src/file";
import * as fs from "fs";
import * as chai from "chai";

let expect = chai.expect;

describe("zero errors", () => {
  let tests = [
    "zhello01.prog",
    "zhello02.prog",
    "zhello03.prog",
    "zhello04.prog",
    "zhello05.prog",
    "zhello06.prog",
    "zhello07.prog",
    "zhello08.prog",
    "zhello09.prog",
    "zhello10.prog",
    "zhello11.prog",
    "zhello12.prog",
    "zhello13.prog",
    "zhello14.prog",
    "zhello15.prog",
    "zif01.prog",
    "zif02.prog",
    "zif03.prog",
    "zcomment01.prog",
    "zcomment02.prog",
    "zcomment03.prog",
    "zmove_corresponding.prog",
    "zdefine01.prog",
    "zcall01.prog",
    "zdata01.prog",
//    "clas/zcx_ags_error.clas",
  ];

  tests.forEach((test) => {
    it(test + " should have zero errors", () => {
      let filename = "./test/abap/" + test + ".abap";
      let file = new File(filename, fs.readFileSync(filename, "utf8"));
      Runner.run([file]);
      expect(file.getIssueCount()).to.equals(0);
    });
  });
});