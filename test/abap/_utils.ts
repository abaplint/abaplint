import {MemoryFile} from "../../src/files";
import {Config} from "../../src/config";
import {expect} from "chai";
import {Version, getPreviousVersion, defaultVersion} from "../../src/version";
import {Unknown} from "../../src/abap/statements/_statement";
import {IStructure} from "../../src/abap/structures/_structure";
import {StatementParser} from "../../src/abap/statement_parser";
import {Registry} from "../../src/registry";
import {StructureNode, StatementNode} from "../../src/abap/nodes/";
import {IFile} from "../../src/files/_ifile";
import {Token} from "../../src/abap/tokens/_token";
import {Lexer} from "../../src/abap/lexer";

// utils for testing

export function getTokens(abap: string): Token[] {
  return Lexer.run(new MemoryFile("cl_foo.clas.abap", abap));
}

export function getFile(abap: string): IFile[] {
  return [new MemoryFile("cl_foo.clas.abap", abap)];
}

export function getStatements(abap: string, version?: Version): StatementNode[] {
  return new StatementParser().run(getFile(abap), version ? version : defaultVersion, [])[0].getStatements();
}

export function findIssues(abap: string) {
  const file = new MemoryFile("zfoo.prog.abap", abap);
  return new Registry().addFile(file).findIssues();
}

export function parse(abap: string, config?: Config) {
  const file = new MemoryFile("zfoo.prog.abap", abap);
  return new Registry(config).addFile(file).parse().getABAPFiles()[0];
}

function run(abap: string, text: string, type: any, version?: Version | undefined) {
  const config = Config.getDefault(version);
  const file = parse(abap, config);
  const slist = file.getStatements();

  if (version === undefined) {
    version = Config.getDefault().getVersion();
  }

  it(text, () => {
    expect(slist[0].get()).to.be.instanceof(type);
// assumption: no colons in input
    expect(slist[0].getTokens().length).to.equal(file.getTokens(false).length);
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
    this.timeout(200); // tslint:disable-line
    tests.forEach((test: any) => {
      run(test, "\"" + test + "\" should be " + description, type);
    });
  });
}

export function statementVersion(tests: any, description: string, type: any) {
  describe(description + " statement version,", function() {
// note that timeout() only works inside function()
    this.timeout(200); // tslint:disable-line
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

export function statementVersionOk(tests: any, description: string, type: any) {
  describe(description + " statement version,", function() {
// note that timeout() only works inside function()
    this.timeout(200); // tslint:disable-line
    tests.forEach((test: any) => {
      run(test.abap, "\"" + test.abap + "\" should be " + description, type, test.ver);
    });
  });
}