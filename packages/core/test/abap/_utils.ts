import {MemoryFile} from "../../src/files";
import {Config} from "../../src/config";
import {expect} from "chai";
import {Version, getPreviousVersion, defaultVersion} from "../../src/version";
import {Unknown} from "../../src/abap/2_statements/statements/_statement";
import {IStructure} from "../../src/abap/3_structures/structures/_structure";
import {StatementParser} from "../../src/abap/2_statements/statement_parser";
import {Registry} from "../../src/registry";
import {StructureNode, StatementNode} from "../../src/abap/nodes";
import {IFile} from "../../src/files/_ifile";
import {Token} from "../../src/abap/1_lexer/tokens/_token";
import {Lexer} from "../../src/abap/1_lexer/lexer";
import {getABAPObjects} from "../get_abap";

// utils for testing

export function getTokens(abap: string): readonly Token[] {
  return Lexer.run(new MemoryFile("cl_foo.clas.abap", abap)).tokens;
}

export function getFile(abap: string): IFile[] {
  return [new MemoryFile("cl_foo.clas.abap", abap)];
}

export function getStatements(abap: string, version?: Version): readonly StatementNode[] {
  const lexerResult = Lexer.run(new MemoryFile("cl_foo.clas.abap", abap));
  return new StatementParser(version ? version : defaultVersion).run([lexerResult], [])[0].statements;
}

export function findIssues(abap: string) {
  const file = new MemoryFile("zfoo.prog.abap", abap);
  return new Registry().addFile(file).findIssues();
}

export function parse(abap: string, config?: Config) {
  const file = new MemoryFile("zfoo.prog.abap", abap);
  const reg = new Registry(config).addFile(file).parse();
  const abapObjects = getABAPObjects(reg);
  const firstObject = abapObjects[0];
  const files = firstObject.getABAPFiles();
  return files[0];
}

function run(abap: string, text: string, type: any, version?: Version | undefined) {
  it(text, () => {
    const config = Config.getDefault(version);
    const file = parse(abap, config);
    const slist = file.getStatements();

    if (version === undefined) {
      version = Config.getDefault().getVersion();
    }

    expect(slist[0].get()).to.be.instanceof(type);
// assumption: no colons in input
    expect(slist[0].getTokens().length).to.equal(file.getTokens(false).length);
  });
}

function runExpectFail(abap: string, text: string, version?: Version | undefined) {
  it(text, () => {
    const config = Config.getDefault(version);
    const file = parse(abap, config);
    const slist = file.getStatements();

    if (version === undefined) {
      version = Config.getDefault().getVersion();
    }

    expect(slist[0].get()).to.be.instanceof(Unknown);
  });
}

export function structureType(cas: {abap: string}[], expected: IStructure): void {
  describe("Structure type", () => {
    cas.forEach((c: {abap: string}) => {
      it(c.abap, () => {
        const file = parse(c.abap);
        const statements = file.getStatements();
        const length = statements.length;
        const match = expected.getMatcher().run(statements.slice(), new StructureNode(expected));

        expect(match.errorDescription).to.equal("");
        expect(length).to.equal(statements.length);
        expect(match.error).to.equal(false);
        expect(match.matched.length).to.equal(length);
      });
    });
  });
}

export function statementType(tests: any, description: string, type: any) {
  describe(description + " statement type", function() {
// note that timeout() only works inside function()
    this.timeout(200);
    tests.forEach((test: any) => {
      run(test, "\"" + test + "\" should be " + description, type);
    });
  });
}

export function statementVersion(tests: any, description: string, type: any) {
  describe(description + " statement version,", function() {
// note that timeout() only works inside function()
    this.timeout(200);
    tests.forEach((test: any) => {
      run(test.abap, "\"" + test.abap + "\" should be " + description, type, test.ver);
// should fail in previous version
      const lower = getPreviousVersion(test.ver);
      run(test.abap,
          "\"" + test.abap + "\" should not work in lower version(" + lower + ")",
          Unknown,
          lower);
    });
  });
}

export function statementVersionOk(tests: {abap: string, ver: Version}[], description: string, type: any) {
  describe(description + " statement version,", function() {
// note that timeout() only works inside function()
    this.timeout(200);
    tests.forEach(test => {
      run(test.abap, "\"" + test.abap + "\" should be " + description, type, test.ver);
    });
  });
}

export function statementVersionFail(tests: {abap: string, ver: Version}[], description: string) {
  describe(description + " statement version should fail,", function() {
// note that timeout() only works inside function()
    this.timeout(200);
    tests.forEach(test => {
      runExpectFail(test.abap, "\"" + test.abap + "\" should not be recognized", test.ver);
    });
  });
}