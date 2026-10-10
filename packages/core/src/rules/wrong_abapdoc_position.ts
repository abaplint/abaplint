import * as Statements from "../abap/2_statements/statements";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {Comment} from "../abap/2_statements/statements/_statement";
import {StatementNode} from "../abap/nodes";
import {EditHelper, IEdit} from "../edit_helper";
import {Position} from "../position";

export class WrongAbapdocPositionConf extends BasicRuleConfig {
}

export class WrongAbapdocPosition extends ABAPRule {

  private conf = new WrongAbapdocPositionConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "wrong_abapdoc_position",
      title: "Wrong ABAP Doc position",
      shortDescription: `ABAP Doc must be placed directly in front of the declaration it documents.`,
      extendedInformation: `ABAP Doc documents the single declaration following it, an ABAP Doc block placed
elsewhere is silently ignored, leaving the declaration undocumented.

The following positions are reported,
* in front of a chained keyword, ie. before "CONSTANTS:" instead of after the colon,
* in the middle of a statement, ie. between the parameters of a METHODS definition,
* directly in front of ENDCLASS, ENDINTERFACE or a SECTION statement,
* separated from its declaration by a blank line or a normal comment, the system reads both as the end of the block.

Only checks ABAP Doc inside class definitions and interfaces, and directly in front of them.

The quick fix for a blank line deletes the blank lines.`,
      tags: [RuleTag.SingleFile, RuleTag.Quickfix],
      badExample: `CLASS zcl_foo DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! Navigation modes
    CONSTANTS:
      BEGIN OF cs_nav_mode,
        back TYPE i VALUE 1,
      END OF cs_nav_mode.
ENDCLASS.`,
      goodExample: `CLASS zcl_foo DEFINITION PUBLIC.
  PUBLIC SECTION.
    CONSTANTS:
      "! Navigation modes
      BEGIN OF cs_nav_mode,
        back TYPE i VALUE 1,
      END OF cs_nav_mode.
ENDCLASS.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: WrongAbapdocPositionConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    const statements = file.getStatements();

    let definition = false;
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const type = statement.get();

      if (type instanceof Statements.ClassDefinition || type instanceof Statements.Interface) {
        definition = true;
        continue;
      } else if (type instanceof Statements.EndClass || type instanceof Statements.EndInterface) {
        definition = false;
        continue;
      } else if (this.isAbapdoc(statement) === false) {
        continue;
      } else if (this.isAbapdoc(statements[i - 1]) === true
          && statements[i - 1].getStart().getRow() + 1 === statement.getStart().getRow()) {
        continue; // only report the first row of each block
      }

      let next: StatementNode | undefined = undefined;
      let j = i + 1;
      for (; j < statements.length; j++) {
        if (!(statements[j].get() instanceof Comment)) {
          next = statements[j];
          break;
        }
      }
      if (next === undefined) {
        continue;
      } else if (definition === false
          && !(next.get() instanceof Statements.ClassDefinition)
          && !(next.get() instanceof Statements.Interface)) {
        continue;
      }

      // comments inside "next" are listed in front of it, only look at the rows above it
      const nextRow = this.startRow(next);
      const trailing = statements[i - 1]?.getEnd().getRow() === statement.getStart().getRow();
      let last = statement;
      let separator: string | undefined = undefined;
      let fix: IEdit | undefined = undefined;
      for (const s of trailing ? [] : statements.slice(i + 1, j)) {
        if (s.getStart().getRow() >= nextRow) {
          break;
        } else if (s.getStart().getRow() > last.getEnd().getRow() + 1) {
          separator = "a blank line";
          if (this.isAbapdoc(s) === true) {
            fix = EditHelper.deleteRange(file, new Position(last.getEnd().getRow() + 1, 1), new Position(s.getStart().getRow(), 1));
          }
          break;
        } else if (this.isAbapdoc(s) === false) {
          separator = "a comment";
          break;
        }
        last = s;
      }
      if (separator === undefined && trailing === false && nextRow > last.getEnd().getRow() + 1) {
        separator = "a blank line";
        fix = EditHelper.deleteRange(file, new Position(last.getEnd().getRow() + 1, 1), new Position(nextRow, 1));
      }

      let message = this.check(statement, next);
      if (message !== undefined) {
        fix = undefined;
      } else if (separator !== undefined) {
        message = "ABAP Doc is separated from its declaration by " + separator;
      }
      if (message !== undefined) {
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity, fix));
      }
    }

    return issues;
  }

  private isAbapdoc(statement: StatementNode | undefined): boolean {
    return statement?.get() instanceof Comment
      && statement.getFirstToken().getStr().startsWith(`"!`);
  }

  private startRow(statement: StatementNode): number {
    return Math.min(statement.getStart().getRow(), ...statement.getPragmas().map(p => p.getRow()));
  }

  private check(abapdoc: StatementNode, next: StatementNode): string | undefined {
    const type = next.get();
    if (type instanceof Statements.EndClass
        || type instanceof Statements.EndInterface
        || type instanceof Statements.Public
        || type instanceof Statements.Protected
        || type instanceof Statements.Private) {
      return "ABAP Doc does not document anything, move or delete it";
    }

    const position = abapdoc.getStart();
    const colon = next.getColon();
    if (colon === undefined) {
      if (position.isAfter(next.getStart()) === true) {
        return "ABAP Doc inside statement, move it in front of the statement";
      }
      return undefined;
    }

    if (position.isBefore(colon.getStart()) === true) {
      return "ABAP Doc in front of chained statement, move it after the colon";
    }

    const member = next.getTokens().find(t => t.getStart().isAfter(colon.getStart()));
    if (member !== undefined && position.isAfter(member.getStart()) === true) {
      return "ABAP Doc inside statement, move it in front of the chained declaration";
    }

    return undefined;
  }

}
