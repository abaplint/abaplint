import {Config} from "../../src/config";
import {expect} from "chai";
import {Version, getPreviousVersion, defaultRelease, ABAPRelease, versionToABAPRelease, LanguageVersion, ReleaseName, VersionOldOrNew} from "../../src/version";
import {Unknown} from "../../src/abap/2_statements/statements/_statement";
import {IStructure} from "../../src/abap/3_structures/structures/_structure";
import {StatementParser} from "../../src/abap/2_statements/statement_parser";
import {Registry} from "../../src/registry";
import {StructureNode, StatementNode} from "../../src/abap/nodes";
import {IFile} from "../../src/files/_ifile";
import {AbstractToken} from "../../src/abap/1_lexer/tokens/abstract_token";
import {Lexer} from "../../src/abap/1_lexer/lexer";
import {getABAPObjects} from "../get_abap";
import {MemoryFile} from "../../src/files/memory_file";

// utils for testing

export function getTokens(abap: string): readonly AbstractToken[] {
  return new Lexer().run(new MemoryFile("cl_foo.clas.abap", abap)).tokens;
}

export function getFile(abap: string): IFile[] {
  return [new MemoryFile("cl_foo.clas.abap", abap)];
}

// Ordered list of releases that have a Version enum mapping, deduped, in ordinal order.
// OpenABAP is excluded: it is a dialect (702 baseline + curated features), not a linear
// release step, so it must not appear in the "previous release" ladder.
const legacyReleases: ABAPRelease[] = (() => {
  const seen = new Set<number>();
  const result: ABAPRelease[] = [];
  for (const v of Object.values(Version)) {
    if (v === Version.OpenABAP) { continue; }
    try {
      const r = versionToABAPRelease(v as Version);
      if (!seen.has(r.ordinal)) {
        seen.add(r.ordinal);
        result.push(r);
      }
    } catch { /* */ }
  }
  return result.sort((a, b) => a.ordinal - b.ordinal);
})();

export function getPreviousRelease(r: ABAPRelease): ABAPRelease {
  const idx = legacyReleases.findIndex(x => x.name === r.name);
  if (idx <= 0) { throw new Error("No previous release for: " + r.name); }
  return legacyReleases[idx - 1];
}

export function getStatements(abap: string, version?: ABAPRelease | Version, langVer?: LanguageVersion): readonly StatementNode[] {
  const lexerResult = new Lexer().run(new MemoryFile("cl_foo.clas.abap", abap));
  let release: ABAPRelease;
  if (version === undefined) {
    release = defaultRelease;
  } else if (typeof version === "string") {
    release = versionToABAPRelease(version as Version);
  } else {
    release = version;
  }
  return new StatementParser(release, undefined, langVer ?? LanguageVersion.Normal).run([lexerResult], [])[0].statements;
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

function run(abap: string, text: string, type: any, version?: ABAPRelease | Version | undefined, langVer?: LanguageVersion) {
  it(text, () => {
    // For an explicit ABAPRelease use the object form {release, language} so the
    // exact release (including Release.Newest, which has no plain Version) and the
    // requested languageVersion are honored without Config.checkVersion() magic.
    const ver: VersionOldOrNew | undefined =
      (version !== undefined && typeof version !== "string")
        ? {release: (version as ABAPRelease).name as ReleaseName, language: langVer ?? LanguageVersion.Normal}
        : version as Version | undefined;
    const config = Config.getDefault(ver, langVer);
    const file = parse(abap, config);
    const slist = file.getStatements();

    expect(slist[0].get()).to.be.instanceof(type);
// assumption: no colons in input
    expect(slist[0].getTokens().length).to.equal(file.getTokens(false).length);
  });
}

function runExpectFail(abap: string, text: string, version?: ABAPRelease | Version | undefined, langVer?: LanguageVersion) {
  it(text, () => {
    const slist = getStatements(abap, version, langVer);
    expect(slist[0].get()).to.be.instanceof(Unknown);
  });
}

export function structureType(cases: {abap: string, only?: boolean}[], expected: IStructure): void {
  describe("Structure type", () => {
    cases.forEach(c => {
      const callback = () => {
        const file = parse(c.abap); // note that parsing will also trigger the structure matches
        const statements = file.getStatements();
        const length = statements.length;
        const match = expected.getMatcher().run(statements.slice(), new StructureNode(expected));

        expect(match.errorDescription).to.equal("");
        expect(length).to.equal(statements.length);
        expect(match.error).to.equal(false);
        expect(match.matched.length).to.equal(length);
      };

      if (c.only === true) {
        it.only(c.abap, callback);
      } else {
        it(c.abap, callback);
      }
    });
  });
}

export function statementType(tests: any, description: string, type: any, timeout = 250) {
  describe(description + " statement type", function() {
// note that timeout() only works inside function()
    this.timeout(timeout);
    tests.forEach((test: any) => {
      run(test, "\"" + test + "\" should be " + description, type);
    });
  });
}

export function statementExpectFail(tests: string[], description: string) {
  describe(description + " statement version should fail,", function() {
// note that timeout() only works inside function()
    this.timeout(250);
    tests.forEach(test => {
      runExpectFail(test, "\"" + test + "\" should not be recognized");
    });
  });
}

export function statementVersion(tests: any, description: string, type: any) {
  describe(description + " statement version,", function() {
// note that timeout() only works inside function()
    this.timeout(250);
    tests.forEach((test: any) => {
      run(test.abap, "\"" + test.abap + "\" should be " + description, type, test.rel, test.langVer);
// should fail in previous version
      const lower = (typeof test.rel === "string")
        ? getPreviousVersion(test.rel as Version)
        : getPreviousRelease(test.rel as ABAPRelease);
      run(test.abap,
          "\"" + test.abap + "\" should not work in lower version(" + (typeof lower === "string" ? lower : lower.name) + ")",
          Unknown,
          lower,
          test.langVer);
    });
  });
}

export function statementVersionOk(
  tests: {abap: string, rel: ABAPRelease | Version, langVer?: LanguageVersion}[],
  description: string, type: any) {
  describe(description + " statement version,", function() {
// note that timeout() only works inside function()
    this.timeout(250);
    tests.forEach(test => {
      run(test.abap, "\"" + test.abap + "\" should be " + description, type, test.rel, test.langVer);
    });
  });
}

export function statementVersionFail(tests: {abap: string, rel: ABAPRelease | Version, langVer?: LanguageVersion}[], description: string) {
  describe(description + " statement version should fail,", function() {
// note that timeout() only works inside function()
    this.timeout(250);
    tests.forEach(test => {
      runExpectFail(test.abap, "\"" + test.abap + "\" should not be recognized", test.rel, test.langVer);
    });
  });
}
