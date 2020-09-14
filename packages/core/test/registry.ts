import {Registry} from "../src/registry";
import {MemoryFile} from "../src/files";
import {expect} from "chai";
import {getABAPObjects} from "./get_abap";
import {ABAPObject} from "../src/objects/_abap_object";
import {Version} from "../src/version";
import {Config} from "../src/config";

describe("Registry", () => {

  it("Parse ABAP file", async () => {
    const file = new MemoryFile("zfoobar.prog.abap", "IF moo = boo. ENDIF.");
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    const abap = getABAPObjects(reg)[0].getABAPFiles();
    expect(abap.length).to.equal(1);
    expect(abap[0].getStatements().length).to.equal(2);
    expect(abap[0].getStructure()).to.not.equal(undefined);
  });

  it("Parse PROG without main", async () => {
    const file = new MemoryFile("zfoobar.prog.xml", "<foo></foo>");
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    expect(reg).to.not.equal(undefined);
  });

  it("Add README.md, should skip", async () => {
    const file = new MemoryFile("README.md", "<foo></foo>");
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    expect(reg).to.not.equal(undefined);
    expect(reg.findIssues().length).to.equal(0);
  });

  it("Add and update file", async () => {
    const first = new MemoryFile("zfoobar.prog.abap", "first");
    const reg = new Registry().addFile(first);
    await reg.parseAsync();
    expect(getABAPObjects(reg)[0].getABAPFiles().length).to.equal(1);
    expect(reg.getObjectCount()).to.equal(1);

    const updated = new MemoryFile("zfoobar.prog.abap", "updated");
    reg.updateFile(updated);
    await reg.parseAsync();
    expect(getABAPObjects(reg)[0].getABAPFiles().length).to.equal(1);
    expect(reg.getObjectCount()).to.equal(1);

    expect(getABAPObjects(reg)[0].getABAPFiles()[0].getRaw()).to.equal("updated");
  });

  it("filename with namespace", async () => {
    const reg = new Registry().addFile(new MemoryFile("#namesp#cl_foobar.clas.abap", "parser error"));
    expect(reg.getObjectCount()).to.equal(1);
    expect(reg.getFirstObject()!.getType()).to.equal("CLAS");
    expect(reg.getObject("CLAS", "/namesp/cl_foobar")).to.not.equal(undefined);
  });

  it("foo.bar.", async () => {
    const reg = new Registry().addFile(new MemoryFile("foo.bar.", "something"));
    expect(reg.getObjectCount()).to.equal(1);
    expect(reg.getFirstObject()!.getType()).to.equal("BAR");
  });

  it("filename with namespace, url encoded", async () => {
    const reg = new Registry().addFile(new MemoryFile("%23namesp%23cl_foobar.clas.abap", "parser error"));
    expect(reg.getObjectCount()).to.equal(1);
    expect(reg.getFirstObject()!.getType()).to.equal("CLAS");
    expect(reg.getObject("CLAS", "/namesp/cl_foobar")).to.not.equal(undefined);
  });

  it("filename with namespace, url encoded, with folder", async () => {
    const reg = new Registry().addFile(new MemoryFile("/src/%23namesp%23cl_foobar.clas.abap", "parser error"));
    expect(reg.getObjectCount()).to.equal(1);
    expect(reg.getFirstObject()!.getType()).to.equal("CLAS");
    expect(reg.getObject("CLAS", "/namesp/cl_foobar")).to.not.equal(undefined);
  });

  it("filename with namespace, with dash", async () => {
    const reg = new Registry().addFile(new MemoryFile("/src/%23name-sp%23cl_foobar.clas.abap", "parser error"));
    expect(reg.getObjectCount()).to.equal(1);
    expect(reg.getFirstObject()!.getType()).to.equal("CLAS");
    expect(reg.getObject("CLAS", "/name-sp/cl_foobar")).to.not.equal(undefined);
  });

  it("Update unknown file, 1", async () => {
    const file = new MemoryFile("zfoobar.prog.abap", "IF moo = boo. ENDIF.");
    const registry = new Registry();
    expect(() => { registry.updateFile(file); }).to.throw("find: object not found");
  });

  it("Update unknown file, 2", async () => {
    const file = new MemoryFile("zfoobar.clas.abap", "WRITE hello.");
    const registry = new Registry().addFile(file);
    const update = new MemoryFile("zfoobar.clas.testclasses.abap", "WRITE hello..");
    expect(() => { registry.updateFile(update); }).to.throw("updateFile: file not found");
  });

  it("Remove files", async () => {
    const file1 = new MemoryFile("zfoobar.clas.abap", "WRITE hello.");
    const file2 = new MemoryFile("zfoobar.clas.testclasses.abap", "WRITE hello..");
    const registry = new Registry().addFiles([file1, file2]);

    expect(getABAPObjects(registry).length).to.equal(1);
    expect(getABAPObjects(registry)[0].getFiles().length).to.equal(2);

    registry.removeFile(file1);
    expect(getABAPObjects(registry).length).to.equal(1);
    expect(getABAPObjects(registry)[0].getFiles().length).to.equal(1);
    expect(getABAPObjects(registry)[0].getFiles()[0].getFilename()).to.equal("zfoobar.clas.testclasses.abap");

    registry.removeFile(file2);
    expect(getABAPObjects(registry).length).to.equal(0);

    expect(() => { registry.removeFile(file1); }).to.throw();
  });

  it("Add and update", async () => {
    const file = new MemoryFile("zfoobar.prog.abap", "REPORT zfoobar.\nDATA hello TYPE i.\nWRITE hello.");
    const registry = new Registry().addFile(file);
    expect(registry.findIssues().length).to.equal(0);

    const updated = new MemoryFile("zfoobar.prog.abap", "REPORT zfoobar.\nmoo boo");
    registry.updateFile(updated);
    const issues = registry.findIssues();
    expect(issues.length).to.equal(1);
  });

  it("Double parse should give the same issues, structure", async () => {
    const file = new MemoryFile("zfoobar.prog.abap", "IF foo = bar.");
    const registry = new Registry().addFile(file);
    expect(registry.findIssues().length).to.equal(1);
    expect(registry.findIssues().length).to.equal(1);
  });

  it("Double parse should give the same issues, parser errror", async () => {
    const file = new MemoryFile("zfoobar.prog.abap", "moo boo");
    const registry = new Registry().addFile(file);
    expect(registry.findIssues().length).to.equal(registry.findIssues().length);
  });

  it("Global interface, constant without VALUE", async () => {
    const abap = `INTERFACE if_t100_message.
  CONSTANTS: default_textid TYPE string.
ENDINTERFACE.`;
    const file = new MemoryFile("if_t100_message.intf.abap", abap);
    const registry = new Registry().addFile(file);
    // tests that no exceptions are thrown
    registry.findIssues();
  });

  it("Double parse should give the same issues, rule", async () => {
    const file = new MemoryFile("zfoobar.prog.abap", "BREAK-POINT.");
    const registry = new Registry().addFile(file);
    const expected = 2;
    expect(registry.findIssues().length).to.equal(expected);
    expect(registry.findIssues().length).to.equal(expected);
  });

  it("full windows path, main file", async () => {
    const file = new MemoryFile("C:\\Users\\foobar\\git\\transpiler\\packages\\abap-loader\\build\\test\\zprogram.prog.abap", "BREAK-POINT.");
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    expect(reg.getObjectCount()).to.equal(1);
    const abap = reg.getFirstObject() as ABAPObject | undefined;
    expect(abap?.getName()).to.equal("ZPROGRAM");
    expect(abap?.getMainABAPFile()).to.not.equal(undefined);
  });

  it("Special name, character > escaped", async () => {
    const reg = new Registry().addFile(new MemoryFile("%3e6.msag.xml", "xml"));
    expect(reg.getObjectCount()).to.equal(1);
    expect(reg.getFirstObject()!.getType()).to.equal("MSAG");
    expect(reg.getObject("MSAG", ">6")).to.not.equal(undefined);
  });

  it("Special name, <icon> program", async () => {
    const reg = new Registry().addFile(new MemoryFile("%3cicon%3e.prog.abap", "write 'hello'."));
    expect(reg.getObjectCount()).to.equal(1);
    expect(reg.getFirstObject()!.getType()).to.equal("PROG");
    expect(reg.getObject("PROG", "<icon>")).to.not.equal(undefined);
  });

});

describe("Registry, object types", () => {

  it("Unknown object type", async () => {
    const file = new MemoryFile("abcd.abcd.abcd", "BREAK-POINT.");
    const registry = new Registry().addFile(file);
    const issues = registry.findIssues();
    expect(issues.length).to.equal(1);
    expect(issues[0].getKey()).to.equal("registry_add");
  });

  it("Unknown object type, multi files", async () => {
    const file2 = new MemoryFile("src/zprog.prog.abap", "REPORT zprog.");
    const file1 = new MemoryFile("LICENSE", "moo");
    const registry = new Registry().addFile(file1).addFile(file2);
    const issues = registry.findIssues();

    expect(issues.length).to.equal(0);
  });

  it("Object type = PROG", async () => {
    const file = new MemoryFile("zfoobar.prog.abap", "BREAK-POINT.");
    const registry = new Registry().addFile(file);
    expect(registry.getObjectCount()).to.equal(1);
    expect(registry.getFirstObject()!.getType()).to.equal("PROG");
  });

  it("Object type = W3MI", async () => {
    const file = new MemoryFile("background.w3mi.data.png", "moo");
    const registry = new Registry().addFile(file);
    expect(registry.getObjectCount()).to.equal(1);
    expect(registry.getFirstObject()!.getType()).to.equal("W3MI");
  });

  it("generator, yield", async () => {
    const file1 = new MemoryFile("file1.w3mi.data.png", "moo");
    const file2 = new MemoryFile("file2.w3mi.data.png", "moo");
    const registry = new Registry().addFile(file1).addFile(file2);

    expect(registry.getObjectCount()).to.equal(2);

    let ret = "";
    for (const a of registry.getObjects()) {
      ret = ret + a.getName();
    }
    expect(ret).to.equal("FILE1FILE2");
  });

  it("add and remove", async () => {
    const file = new MemoryFile("background.w3mi.data.png", "moo");
    const registry = new Registry().addFile(file);
    expect(registry.getObjectCount()).to.equal(1);
    const obj = registry.getFirstObject();
    expect(obj!.getType()).to.equal("W3MI");

    registry.removeFile(file);
    expect(registry.getObjectCount()).to.equal(0);
  });

  it("add two with same name", async () => {
    const file1 = new MemoryFile("background.tran.xml", "moo");
    const file2 = new MemoryFile("background.prog.xml", "moo");
    const registry = new Registry().addFile(file1).addFile(file2);

    expect(registry.getObjectCount()).to.equal(2);
  });

});


describe("exclude list", () => {

  function getConfig(rules: any): Config {
    const conf: any = {
      global: {
        files: "/src/**/*.*",
        skipGeneratedGatewayClasses: true,
        skipGeneratedPersistentClasses: true,
        skipGeneratedFunctionGroups: true,

      },
      dependencies: [],
      syntax: {
        version: Version.v702,
        errorNamespace: "^(Z|Y)",
        globalConstants: [],
        globalMacros: [],
      },
      rules: rules,
    };

    return new Config(JSON.stringify(conf));
  }

  it("will exclude issues based on the global exclude patterns", () => {

    const config = getConfig({
      "space_before_dot": true,
    });

    const file = new MemoryFile("foo.prog.abap", "BREAK-POINT    .");

    config.getGlobal().exclude = ["FOO.prog.abap"];
    let registry = new Registry(config).addFile(file);
    expect(registry.findIssues().length).to.equal(0);

    config.getGlobal().exclude = [];
    registry = new Registry(config).addFile(file);
    expect(registry.findIssues().length).to.equal(1);

    config.getGlobal().exclude = [".*\.abap"];
    registry = new Registry(config).addFile(file);
    expect(registry.findIssues().length).to.equal(0);

  });

  it("will not crash with an undefined global exclude list", () => {

    const config = getConfig({
      "space_before_dot": true,
    });

    const file = new MemoryFile("foo.prog.abap", "BREAK-POINT    .");

    delete config.getGlobal().exclude;
    const registry = new Registry(config).addFile(file);
    expect(registry.findIssues().length).to.equal(1);

  });

  it("will exclude issues based on the local exclude patterns", () => {

    const config = getConfig({
      "space_before_dot": {
        exclude: ["FOO.prog.abap"],
      },
    });

    const file = new MemoryFile("foo.prog.abap", "BREAK-POINT    .");

    const registry = new Registry(config).addFile(file);
    expect(registry.findIssues().length).to.equal(0);

  });

  it("will not exclude issues which are not ignored", () => {

    const config = getConfig({
      "space_before_dot": true,
    });

    const file = new MemoryFile("foo.prog.abap", "BREAK-POINT    .");

    const registry = new Registry(config).addFile(file);
    expect(registry.findIssues().length).to.equal(1);

  });

});