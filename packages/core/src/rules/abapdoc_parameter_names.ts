import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {Comment} from "../abap/2_statements/statements/_statement";
import {StatementNode} from "../abap/nodes";

export class AbapdocParameterNamesConf extends BasicRuleConfig {
}

export class AbapdocParameterNames extends ABAPRule {

  private conf = new AbapdocParameterNamesConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "abapdoc_parameter_names",
      title: "ABAP Doc parameter names",
      shortDescription: `Checks that the parameters documented in ABAP Doc exist in the method definition.`,
      extendedInformation: `Reports "! @parameter lines in the ABAP Doc block in front of a METHODS or CLASS-METHODS
definition when the parameter is not a parameter of the method, typically after a parameter was renamed or removed.
Also reports a parameter documented twice.

Missing @parameter lines are not reported, documenting parameters is optional. @raising and @exception lines are not checked.

Only the block directly in front of the method is checked, a blank line or a plain comment ends the block,
see rule wrong_abapdoc_position for misplaced ABAP Doc.`,
      tags: [RuleTag.SingleFile],
      badExample: `CLASS zcl_foo DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! @parameter iv_bar | Bar
    METHODS foo IMPORTING iv_foo TYPE i.
ENDCLASS.`,
      goodExample: `CLASS zcl_foo DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! @parameter iv_foo | Foo
    METHODS foo IMPORTING iv_foo TYPE i.
ENDCLASS.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: AbapdocParameterNamesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    const statements = file.getStatements();

    for (let i = 0; i < statements.length; i++) {
      const def = statements[i];
      if (!(def.get() instanceof Statements.MethodDef)) {
        continue;
      }

      const name = def.findDirectExpression(Expressions.MethodName);
      if (name === undefined) {
        continue;
      }

      const abapdoc: StatementNode[] = [];
      let nextRow: number | undefined = undefined;
      for (let j = i - 1; j >= 0 && statements[j].get() instanceof Comment; j--) {
        const comment = statements[j];
        const start = comment.getStart();
        if (start.isAfter(name.getFirstToken().getStart())) {
          continue; // comment inside the statement, after the method name
        }
        nextRow = nextRow ?? def.getTokens().find(t => t.getStart().isAfter(start))?.getStart().getRow();
        if (this.isAbapdoc(comment, def) === false || start.getRow() + 1 !== nextRow) {
          break; // a blank line or a plain comment ends the block
        }
        abapdoc.unshift(comment);
        nextRow = start.getRow();
      }
      if (abapdoc.length === 0) {
        continue;
      }

      const parameters = def.findAllExpressions(Expressions.MethodParamName)
        .map(p => p.getFirstToken().getStr().replace(/^!/, "").toUpperCase());
      const documented = new Set<string>();

      for (const comment of abapdoc) {
        const match = comment.getFirstToken().getStr().match(/^"!\s*@parameter\s+!?([^\s|]+)/i);
        if (match === null) {
          continue;
        }
        const parameter = match[1].toUpperCase();
        let message: string | undefined = undefined;
        if (parameters.includes(parameter) === false) {
          message = `ABAP Doc parameter "${match[1]}" is not a parameter of method ${name.concatTokens()}`;
        } else if (documented.has(parameter) === true) {
          message = `ABAP Doc parameter "${match[1]}" documented more than once`;
        }
        documented.add(parameter);
        if (message !== undefined) {
          issues.push(Issue.atStatement(file, comment, message, this.getMetadata().key, this.conf.severity));
        }
      }
    }

    return issues;
  }

  /** ABAP Doc in front of the method name, after the colon of a chain */
  private isAbapdoc(comment: StatementNode, def: StatementNode): boolean {
    if (comment.getFirstToken().getStr().startsWith(`"!`) === false) {
      return false;
    }
    const colon = def.getColon();
    return colon === undefined || comment.getStart().isAfter(colon.getStart());
  }

}
