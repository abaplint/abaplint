import {ObjectNaming, ObjectNamingConf} from "../../../src/rules";
import {Registry} from "../../../src/registry";
import {MemoryFile} from "../../../src/files";
import {expect} from "chai";
import {Issue} from "../../../src";

function findIssues(filename: string, expectedIssueCount: number, config?: ObjectNamingConf): Issue[] {
  const reg = new Registry().addFile(new MemoryFile(filename, "")).parse();
  const rule = new ObjectNaming();
  if (config) {
    rule.setConfig(config);
  }
  const issues = rule.run(reg.getObjects()[0], reg);
  expect(issues.length).to.equal(expectedIssueCount);
  return issues;
}

describe("Rule: Object naming (required pattern)", function () {
  it("clas", function () {
    const config = new ObjectNamingConf();
    config.clas = "^ZCL_.*$";

    config.patternKind = "required";
    findIssues("zcl_class.clas.abap", 0, config);
    findIssues("cl_class.clas.abap", 1, config);

    config.patternKind = "forbidden";
    findIssues("zcl_class.clas.abap", 1, config);
    findIssues("cl_class.clas.abap", 0, config);
  });

  it("intf", function () {
    const config = new ObjectNamingConf();
    config.intf = "^ZIF_.*$";

    config.patternKind = "required";
    findIssues("zif_test.intf.abap", 0, config);
    findIssues("if_test.intf.abap", 1, config);

    config.patternKind = "forbidden";
    findIssues("zif_test.intf.abap", 1, config);
    findIssues("if_test.intf.abap", 0, config);
  });

  it("prog", function () {
    const config = new ObjectNamingConf();
    config.prog = "^Z.*$";

    config.patternKind = "required";
    findIssues("ztest.prog.abap", 0, config);
    findIssues("test.prog.abap", 1, config);

    config.patternKind = "forbidden";
    findIssues("ztest.prog.abap", 1, config);
    findIssues("test.prog.abap", 0, config);
  });

  it("fugr", function () {
    const config = new ObjectNamingConf();
    config.fugr = "^Z.*$";

    config.patternKind = "required";
    findIssues("ztest.fugr.abap", 0, config);
    findIssues("test.fugr.abap", 1, config);

    config.patternKind = "forbidden";
    findIssues("ztest.fugr.abap", 1, config);
    findIssues("test.fugr.abap", 0, config);
  });

  it("tabl", function () {
    const config = new ObjectNamingConf();
    config.tabl = "^Z.*$";

    config.patternKind = "required";
    findIssues("ztest.tabl.xml", 0, config);
    findIssues("test.tabl.xml", 1, config);

    config.patternKind = "forbidden";
    findIssues("ztest.tabl.xml", 1, config);
    findIssues("test.tabl.xml", 0, config);
  });

  it("ttyp", function () {
    const config = new ObjectNamingConf();
    config.ttyp = "^Z.*$";

    config.patternKind = "required";
    findIssues("ztest.ttyp.xml", 0, config);
    findIssues("test.ttyp.xml", 1, config);

    config.patternKind = "forbidden";
    findIssues("ztest.ttyp.xml", 1, config);
    findIssues("test.ttyp.xml", 0, config);
  });

  it("dtel", function () {
    const config = new ObjectNamingConf();
    config.dtel = "^Z.*$";

    config.patternKind = "required";
    findIssues("ztest.dtel.xml", 0, config);
    findIssues("test.dtel.xml", 1, config);

    config.patternKind = "forbidden";
    findIssues("ztest.dtel.xml", 1, config);
    findIssues("test.dtel.xml", 0, config);
  });

  it("doma", function () {
    const config = new ObjectNamingConf();
    config.doma = "^Z.*$";

    config.patternKind = "required";
    findIssues("ztest.doma.xml", 0, config);
    findIssues("test.doma.xml", 1, config);

    config.patternKind = "forbidden";
    findIssues("ztest.doma.xml", 1, config);
    findIssues("test.doma.xml", 0, config);
  });

  it("msag", function () {
    const config = new ObjectNamingConf();
    config.doma = "^Z.*$";

    config.patternKind = "required";
    findIssues("ztest.msag.xml", 0, config);
    findIssues("test.msag.xml", 1, config);

    config.patternKind = "forbidden";
    findIssues("ztest.msag.xml", 1, config);
    findIssues("test.msag.xml", 0, config);
  });

  it("tran", function () {
    const config = new ObjectNamingConf();
    config.tran = "^Z.*$";

    config.patternKind = "required";
    findIssues("ztest.tran.xml", 0, config);
    findIssues("test.tran.xml", 1, config);

    config.patternKind = "forbidden";
    findIssues("ztest.tran.xml", 1, config);
    findIssues("test.tran.xml", 0, config);
  });

  it("enqu", function () {
    const config = new ObjectNamingConf();
    config.enqu = "^Z.*$";

    config.patternKind = "required";
    findIssues("ztest.enqu.xml", 0, config);
    findIssues("test.enqu.xml", 1, config);

    config.patternKind = "forbidden";
    findIssues("ztest.enqu.xml", 1, config);
    findIssues("test.enqu.xml", 0, config);
  });

  it("auth", function () {
    const config = new ObjectNamingConf();
    config.auth = "^Z.*$";

    config.patternKind = "required";
    findIssues("ztest.suso.xml", 0, config);
    findIssues("test.suso.xml", 1, config);

    config.patternKind = "forbidden";
    findIssues("ztest.suso.xml", 1, config);
    findIssues("test.suso.xml", 0, config);
  });

  it("pinf", function () {
    const config = new ObjectNamingConf();
    config.pinf = "^Z.*$";

    config.patternKind = "required";
    findIssues("ztest.pinf.xml", 0, config);
    findIssues("test.pinf.xml", 1, config);

    config.patternKind = "forbidden";
    findIssues("ztest.pinf.xml", 1, config);
    findIssues("test.pinf.xml", 0, config);
  });

  it("idoc", function () {
    const config = new ObjectNamingConf();
    config.idoc = "^Z.*$";

    config.patternKind = "required";
    findIssues("ztest.idoc.xml", 0, config);
    findIssues("test.idoc.xml", 1, config);

    config.patternKind = "forbidden";
    findIssues("ztest.idoc.xml", 1, config);
    findIssues("test.idoc.xml", 0, config);
  });

  it("xslt", function () {
    const config = new ObjectNamingConf();
    config.idoc = "^Z.*$";

    config.patternKind = "required";
    findIssues("ztest.xslt.xml", 0, config);
    findIssues("test.xslt.xml", 1, config);

    config.patternKind = "forbidden";
    findIssues("ztest.xslt.xml", 1, config);
    findIssues("test.xslt.xml", 0, config);
  });

  it("Config, patternKind not set", function () {
    const config = new ObjectNamingConf();
    config.clas = "^ZCL_.*$";
    config.patternKind = undefined;

    findIssues("zcl_class.clas.abap", 0, config);
    findIssues("cl_class.clas.abap", 1, config);
  });

});