import {expect} from "chai";
import {Config, IEdit, IRegistry, MemoryFile, Registry, Version} from "../../src";
import {applyEditList} from "../../src/edit_helper";
import {SyntaxLogic} from "../../src/abap/5_syntax/syntax";
import {ABAPObject} from "../../src/objects/_abap_object";
import {IRule} from "../../src/rules/_irule";

// Shared fixtures and checks for the rules that remove redundant code around local variables.

export const definitions = `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif.
    DATA attr TYPE i.
    DATA text TYPE string.
    DATA ref TYPE REF TO lcl.
    DATA tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
    METHODS run IMPORTING imp TYPE i OPTIONAL iref TYPE REF TO lcl OPTIONAL VALUE(val) TYPE i OPTIONAL
      RETURNING VALUE(result) TYPE i.
    METHODS get IMPORTING p TYPE i OPTIONAL RETURNING VALUE(r) TYPE i.
    METHODS obj IMPORTING p TYPE REF TO lcl OPTIONAL RETURNING VALUE(r) TYPE REF TO lcl.
    METHODS ch CHANGING c TYPE i.
    METHODS chref CHANGING c TYPE REF TO lcl.
    METHODS ex EXPORTING e TYPE i.
    METHODS put IMPORTING p TYPE i OPTIONAL o TYPE REF TO lcl OPTIONAL.
ENDCLASS.
INTERFACE lif.
  DATA flag TYPE abap_bool.
ENDINTERFACE.
CLASS lsub DEFINITION INHERITING FROM lcl.
ENDCLASS.
CLASS lsub IMPLEMENTATION.
ENDCLASS.
FORM frm USING u TYPE i.
ENDFORM.
CLASS lcl IMPLEMENTATION.
  METHOD get.
  ENDMETHOD.
  METHOD obj.
  ENDMETHOD.
  METHOD ch.
  ENDMETHOD.
  METHOD chref.
  ENDMETHOD.
  METHOD ex.
  ENDMETHOD.
  METHOD put.
  ENDMETHOD.
  METHOD run.
`;

export const ending = `
  ENDMETHOD.
ENDCLASS.`;

/** the body of METHOD run of class lcl */
export function inMethod(body: string): string {
  return definitions + body + ending;
}

export interface IRedundantTest {
  abap: string;
  cnt: number;
  fix?: boolean;
  /** the fixture is expected to fail the syntax check */
  syntaxError?: boolean;
}

export function syntaxIssues(reg: IRegistry): string[] {
  const syntax = new SyntaxLogic(reg, reg.getFirstObject()! as ABAPObject).run();
  return syntax.issues.map(i => i.getMessage() + " at " + i.getStart().getRow());
}

function overlaps(edit: IEdit, chosen: IEdit[]): boolean {
  for (const other of chosen) {
    for (const filename of Object.keys(edit)) {
      for (const a of edit[filename]) {
        for (const b of other[filename] || []) {
          if (a.range.start.getRow() <= b.range.end.getRow() && b.range.start.getRow() <= a.range.end.getRow()) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

/** applies the fixes like abaplint --fix does: each rule until it has no more fixes, all rules until nothing changes.
 * Checks the syntax after every round. Returns the final source and the number of rounds */
export function fixAll(abap: string, rules: IRule[], version?: Version): {code: string, rounds: number} {
  const reg = new Registry(version ? Config.getDefault(version) : undefined)
    .addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
  let rounds = 0;
  for (;;) {
    let changed = false;
    for (const rule of rules) {
      for (;;) {
        const edits: IEdit[] = [];
        for (const issue of rule.initialize(reg).run(reg.getFirstObject()!)) {
          const fix = issue.getDefaultFix();
          if (fix !== undefined && !overlaps(fix, edits)) {
            edits.push(fix);
          }
        }
        if (edits.length === 0) {
          break;
        }
        applyEditList(reg, edits);
        reg.parse();
        rounds++;
        changed = true;
        expect(syntaxIssues(reg), rule.getMetadata().key + " round " + rounds + ":\n" +
          reg.getFirstObject()!.getFiles()[0].getRaw()).to.deep.equal([]);
        expect(rounds).to.be.lessThan(100);
      }
    }
    if (changed === false) {
      break;
    }
  }
  return {code: reg.getFirstObject()!.getFiles()[0].getRaw(), rounds};
}

/** the fixtures pass the syntax check, unless marked otherwise, and so does the result of all fixes */
export function testSyntaxAfterFix(tests: IRedundantTest[], rule: new () => IRule) {
  const key = new rule().getMetadata().key;
  describe(key + " syntax", () => {
    it("fixtures have no syntax errors", () => {
      for (const test of tests) {
        if (test.syntaxError === true) {
          continue;
        }
        const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", test.abap)).parse();
        expect(syntaxIssues(reg), test.abap).to.deep.equal([]);
      }
    });

    it("fixed fixtures still pass syntax", () => {
      for (const test of tests.filter(t => t.fix === true)) {
        fixAll(test.abap, [new rule()]);
      }
    });
  });
}

/** issue count for each version */
export function testVersions(abap: string, rule: new () => IRule, expected: {version: Version, cnt: number}[]) {
  const key = new rule().getMetadata().key;
  describe(key + " versions", () => {
    for (const e of expected) {
      it("version " + e.version, () => {
        const reg = new Registry(Config.getDefault(e.version)).addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
        const issues = new rule().initialize(reg).run(reg.getFirstObject()!);
        expect(issues.length).to.equal(e.cnt);
      });
    }
  });
}
