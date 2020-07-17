import {ObjectNaming, ObjectNamingConf} from "../../src/rules";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files";
import {expect} from "chai";
import {Issue} from "../../src";

async function findIssues(filename: string, expectedIssueCount: number, config?: ObjectNamingConf): Promise<Issue[]> {
  const reg = new Registry().addFile(new MemoryFile(filename, ""));
  await reg.parseAsync();
  const rule = new ObjectNaming();
  if (config) {
    rule.setConfig(config);
  }
  const issues = rule.initialize(reg).run(reg.getObjects()[0]);
  expect(issues.length).to.equal(expectedIssueCount);
  return issues;
}

describe("Rule: Object naming (required pattern)", () => {
  it("clas", async () => {
    const config = new ObjectNamingConf();
    config.clas = "^ZCL_.*$";

    config.patternKind = "required";
    await findIssues("zcl_class.clas.abap", 0, config);
    await findIssues("cl_class.clas.abap", 1, config);

    config.patternKind = "forbidden";
    await findIssues("zcl_class.clas.abap", 1, config);
    await findIssues("cl_class.clas.abap", 0, config);
  });

  it("intf", async () => {
    const config = new ObjectNamingConf();
    config.intf = "^ZIF_.*$";

    config.patternKind = "required";
    await findIssues("zif_test.intf.abap", 0, config);
    await findIssues("if_test.intf.abap", 1, config);

    config.patternKind = "forbidden";
    await findIssues("zif_test.intf.abap", 1, config);
    await findIssues("if_test.intf.abap", 0, config);
  });

  it("prog", async () => {
    const config = new ObjectNamingConf();
    config.prog = "^Z.*$";

    config.patternKind = "required";
    await findIssues("ztest.prog.abap", 0, config);
    await findIssues("test.prog.abap", 1, config);

    config.patternKind = "forbidden";
    await findIssues("ztest.prog.abap", 1, config);
    await findIssues("test.prog.abap", 0, config);
  });

  it("fugr", async () => {
    const config = new ObjectNamingConf();
    config.fugr = "^Z.*$";

    config.patternKind = "required";
    await findIssues("ztest.fugr.abap", 0, config);
    await findIssues("test.fugr.abap", 1, config);

    config.patternKind = "forbidden";
    await findIssues("ztest.fugr.abap", 1, config);
    await findIssues("test.fugr.abap", 0, config);
  });

  it("tabl", async () => {
    const config = new ObjectNamingConf();
    config.tabl = "^Z.*$";

    config.patternKind = "required";
    await findIssues("ztest.tabl.xml", 0, config);
    await findIssues("test.tabl.xml", 1, config);

    config.patternKind = "forbidden";
    await findIssues("ztest.tabl.xml", 1, config);
    await findIssues("test.tabl.xml", 0, config);
  });

  it("ttyp", async () => {
    const config = new ObjectNamingConf();
    config.ttyp = "^Z.*$";

    config.patternKind = "required";
    await findIssues("ztest.ttyp.xml", 0, config);
    await findIssues("test.ttyp.xml", 1, config);

    config.patternKind = "forbidden";
    await findIssues("ztest.ttyp.xml", 1, config);
    await findIssues("test.ttyp.xml", 0, config);
  });

  it("dtel", async () => {
    const config = new ObjectNamingConf();
    config.dtel = "^Z.*$";

    config.patternKind = "required";
    await findIssues("ztest.dtel.xml", 0, config);
    await findIssues("test.dtel.xml", 1, config);

    config.patternKind = "forbidden";
    await findIssues("ztest.dtel.xml", 1, config);
    await findIssues("test.dtel.xml", 0, config);
  });

  it("doma", async () => {
    const config = new ObjectNamingConf();
    config.doma = "^Z.*$";

    config.patternKind = "required";
    await findIssues("ztest.doma.xml", 0, config);
    await findIssues("test.doma.xml", 1, config);

    config.patternKind = "forbidden";
    await findIssues("ztest.doma.xml", 1, config);
    await findIssues("test.doma.xml", 0, config);
  });

  it("msag", async () => {
    const config = new ObjectNamingConf();
    config.msag = "^Z.*$";

    config.patternKind = "required";
    await findIssues("ztest.msag.xml", 0, config);
    await findIssues("test.msag.xml", 1, config);

    config.patternKind = "forbidden";
    await findIssues("ztest.msag.xml", 1, config);
    await findIssues("test.msag.xml", 0, config);
  });

  it("tran", async () => {
    const config = new ObjectNamingConf();
    config.tran = "^Z.*$";

    config.patternKind = "required";
    await findIssues("ztest.tran.xml", 0, config);
    await findIssues("test.tran.xml", 1, config);

    config.patternKind = "forbidden";
    await findIssues("ztest.tran.xml", 1, config);
    await findIssues("test.tran.xml", 0, config);
  });

  it("enqu", async () => {
    const config = new ObjectNamingConf();
    config.enqu = "^Z.*$";

    config.patternKind = "required";
    await findIssues("ztest.enqu.xml", 0, config);
    await findIssues("test.enqu.xml", 1, config);

    config.patternKind = "forbidden";
    await findIssues("ztest.enqu.xml", 1, config);
    await findIssues("test.enqu.xml", 0, config);
  });

  it("auth", async () => {
    const config = new ObjectNamingConf();
    config.auth = "^Z.*$";

    config.patternKind = "required";
    await findIssues("ztest.suso.xml", 0, config);
    await findIssues("test.suso.xml", 1, config);

    config.patternKind = "forbidden";
    await findIssues("ztest.suso.xml", 1, config);
    await findIssues("test.suso.xml", 0, config);
  });

  it("pinf", async () => {
    const config = new ObjectNamingConf();
    config.pinf = "^Z.*$";

    config.patternKind = "required";
    await findIssues("ztest.pinf.xml", 0, config);
    await findIssues("test.pinf.xml", 1, config);

    config.patternKind = "forbidden";
    await findIssues("ztest.pinf.xml", 1, config);
    await findIssues("test.pinf.xml", 0, config);
  });

  it("idoc", async () => {
    const config = new ObjectNamingConf();
    config.idoc = "^Z.*$";

    config.patternKind = "required";
    await findIssues("ztest.idoc.xml", 0, config);
    await findIssues("test.idoc.xml", 1, config);

    config.patternKind = "forbidden";
    await findIssues("ztest.idoc.xml", 1, config);
    await findIssues("test.idoc.xml", 0, config);
  });

  it("xslt", async () => {
    const config = new ObjectNamingConf();
    config.xslt = "^Z.*$";

    config.patternKind = "required";
    await findIssues("ztest.xslt.xml", 0, config);
    await findIssues("test.xslt.xml", 1, config);

    config.patternKind = "forbidden";
    await findIssues("ztest.xslt.xml", 1, config);
    await findIssues("test.xslt.xml", 0, config);
  });

  it("ssfo", async () => {
    const config = new ObjectNamingConf();
    config.ssfo = "^Z.*$";

    config.patternKind = "required";
    await findIssues("ztest.ssfo.xml", 0, config);
    await findIssues("test.ssfo.xml", 1, config);

    config.patternKind = "forbidden";
    await findIssues("ztest.ssfo.xml", 1, config);
    await findIssues("test.ssfo.xml", 0, config);
  });

  it("ssst", async () => {
    const config = new ObjectNamingConf();
    config.ssst = "^Z.*$";

    config.patternKind = "required";
    await findIssues("ztest.ssst.xml", 0, config);
    await findIssues("test.ssst.xml", 1, config);

    config.patternKind = "forbidden";
    await findIssues("ztest.ssst.xml", 1, config);
    await findIssues("test.ssst.xml", 0, config);
  });

  it("Config, patternKind not set", async () => {
    const config = new ObjectNamingConf();
    config.clas = "^ZCL_.*$";
    config.patternKind = undefined;

    await findIssues("zcl_class.clas.abap", 0, config);
    await findIssues("cl_class.clas.abap", 1, config);
  });

});