import * as Statements from "../abap/2_statements/statements";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {Comment} from "../abap/2_statements/statements/_statement";
import {StatementNode} from "../abap/nodes";

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
* directly in front of ENDCLASS, ENDINTERFACE or a SECTION statement.

Only checks ABAP Doc inside class definitions and interfaces.`,
      tags: [RuleTag.SingleFile],
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
      } else if (definition === false || this.isAbapdoc(statement) === false) {
        continue;
      } else if (this.isAbapdoc(statements[i - 1]) === true
          && statements[i - 1].getStart().getRow() + 1 === statement.getStart().getRow()) {
        continue; // only report the first row of each block
      }

      let next: StatementNode | undefined = undefined;
      for (let j = i + 1; j < statements.length; j++) {
        if (statements[j].get() instanceof Comment) {
          continue;
        }
        next = statements[j];
        break;
      }
      if (next === undefined) {
        continue;
      }

      const message = this.check(statement, next);
      if (message !== undefined) {
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

  private isAbapdoc(statement: StatementNode | undefined): boolean {
    return statement?.get() instanceof Comment
      && statement.getFirstToken().getStr().startsWith(`"!`);
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
