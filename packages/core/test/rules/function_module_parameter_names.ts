import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {FunctionModuleParameterNames, FunctionModuleParameterNamesConf} from "../../src/rules/function_module_parameter_names";
import {expect} from "chai";
import {Issue} from "../../src/issue";

interface IParams {
  importing?: string[];
  exporting?: string[];
  changing?: string[];
  tables?: string[];
}

function buildXml(modules: {name: string, params: IParams}[]): string {
  const items = modules.map(m => {
    const section = (tag: string, row: string, names?: string[]) => {
      if (names === undefined || names.length === 0) {
        return "";
      }
      const rows = names.map(n => `<${row}><PARAMETER>${n}</PARAMETER><TYP>I</TYP></${row}>`).join("");
      return `<${tag}>${rows}</${tag}>`;
    };
    return `<item>
      <FUNCNAME>${m.name}</FUNCNAME>
      <SHORT_TEXT>test</SHORT_TEXT>
      ${section("IMPORT", "RSIMP", m.params.importing)}
      ${section("CHANGING", "RSCHA", m.params.changing)}
      ${section("EXPORT", "RSEXP", m.params.exporting)}
      ${section("TABLES", "RSTBL", m.params.tables)}
    </item>`;
  }).join("");

  return `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_FUGR" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <AREAT>test</AREAT>
   <INCLUDES>
    <SOBJ_NAME>LZFOOTOP</SOBJ_NAME>
    <SOBJ_NAME>SAPLZFOO</SOBJ_NAME>
   </INCLUDES>
   <FUNCTIONS>${items}</FUNCTIONS>
  </asx:values>
 </asx:abap>
</abapGit>`;
}

async function findIssues(params: IParams, config?: FunctionModuleParameterNamesConf): Promise<Issue[]> {
  const reg = new Registry();
  reg.addFile(new MemoryFile("zfoo.fugr.xml", buildXml([{name: "ZGET_NAME", params}])));
  reg.addFile(new MemoryFile("zfoo.fugr.saplzfoo.abap", "FUNCTION-POOL zfoo."));
  reg.addFile(new MemoryFile("zfoo.fugr.zget_name.abap", "FUNCTION zget_name.\nENDFUNCTION."));
  await reg.parseAsync();
  const rule = new FunctionModuleParameterNames();
  if (config) {
    rule.setConfig(config);
  }
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: function_module_parameter_names (general)", () => {

  it("not a function group", async () => {
    const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", "WRITE 'hello'."));
    await reg.parseAsync();
    const issues = new FunctionModuleParameterNames().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equal(0);
  });

  it("module without parameters", async () => {
    const issues = await findIssues({});
    expect(issues.length).to.equal(0);
  });

  it("all directions ok", async () => {
    const issues = await findIssues({
      importing: ["IV_FOO"],
      exporting: ["EV_FOO"],
      changing: ["CV_FOO"],
      tables: ["TT_FOO"],
    });
    expect(issues.length).to.equal(0);
  });

  it("issue is reported in the file of the module", async () => {
    const issues = await findIssues({importing: ["FOO"]});
    expect(issues.length).to.equal(1);
    expect(issues[0].getFilename()).to.equal("zfoo.fugr.zget_name.abap");
    expect(issues[0].getKey()).to.equal("function_module_parameter_names");
  });

  it("module in a function group without a file for the module, falls back to main file", async () => {
    const reg = new Registry();
    reg.addFile(new MemoryFile("zfoo.fugr.xml", buildXml([{name: "ZGET_NAME", params: {importing: ["FOO"]}}])));
    reg.addFile(new MemoryFile("zfoo.fugr.saplzfoo.abap", "FUNCTION-POOL zfoo."));
    await reg.parseAsync();
    const issues = new FunctionModuleParameterNames().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equal(1);
  });

});

describe("Rule: function_module_parameter_names (directions)", () => {

  it("importing, wrong", async () => {
    const issues = await findIssues({importing: ["FOO"]});
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("FOO");
  });

  it("importing, a prefix of another direction is wrong", async () => {
    const issues = await findIssues({importing: ["EV_FOO"]});
    expect(issues.length).to.equal(1);
  });

  it("exporting, wrong", async () => {
    const issues = await findIssues({exporting: ["FOO"]});
    expect(issues.length).to.equal(1);
  });

  it("changing, wrong", async () => {
    const issues = await findIssues({changing: ["FOO"]});
    expect(issues.length).to.equal(1);
  });

  it("tables, wrong", async () => {
    const issues = await findIssues({tables: ["FOO"]});
    expect(issues.length).to.equal(1);
  });

  it("tables, ok", async () => {
    const issues = await findIssues({tables: ["TT_FOO"]});
    expect(issues.length).to.equal(0);
  });

  it("multiple wrong parameters, one issue each", async () => {
    const issues = await findIssues({
      importing: ["FOO", "IV_OK"],
      exporting: ["BAR"],
      changing: ["BAZ"],
      tables: ["QUX"],
    });
    expect(issues.length).to.equal(4);
  });

  it("case insensitive", async () => {
    const issues = await findIssues({importing: ["iv_foo"]});
    expect(issues.length).to.equal(0);
  });

});

describe("Rule: function_module_parameter_names (configuration)", () => {

  it("custom pattern per direction", async () => {
    const config = new FunctionModuleParameterNamesConf();
    config.importing = "^P_.+$";
    const ok = await findIssues({importing: ["P_FOO"]}, config);
    expect(ok.length).to.equal(0);
    const bad = await findIssues({importing: ["IV_FOO"]}, config);
    expect(bad.length).to.equal(1);
  });

  it("patternKind forbidden, match", async () => {
    const config = new FunctionModuleParameterNamesConf();
    config.patternKind = "forbidden";
    config.importing = "^IV_";
    config.exporting = "^EV_";
    config.changing = "^CV_";
    config.tables = "^TT_";
    const issues = await findIssues({
      importing: ["IV_FOO"],
      exporting: ["EV_FOO"],
      changing: ["CV_FOO"],
      tables: ["TT_FOO"],
    }, config);
    expect(issues.length).to.equal(4);
    expect(issues[0].getMessage()).to.contain("must not match");
  });

  it("patternKind forbidden, no match", async () => {
    const config = new FunctionModuleParameterNamesConf();
    config.patternKind = "forbidden";
    config.importing = "^IV_";
    const issues = await findIssues({importing: ["FOO"]}, config);
    expect(issues.length).to.equal(0);
  });

  it("ignoreNames", async () => {
    const config = new FunctionModuleParameterNamesConf();
    config.ignoreNames = ["FOO", "BAR"];
    const issues = await findIssues({importing: ["foo"], exporting: ["BAR"], changing: ["BAZ"]}, config);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("BAZ");
  });

  it("ignorePatterns", async () => {
    const config = new FunctionModuleParameterNamesConf();
    config.ignorePatterns = ["^FOO"];
    const issues = await findIssues({importing: ["FOO_1"], exporting: ["BAR"]}, config);
    expect(issues.length).to.equal(1);
  });

});
