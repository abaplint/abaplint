import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {ABAPFile} from "../files";
import {Dash, DashW} from "../abap/1_lexer/tokens";
import {FormName} from "../abap/2_statements/expressions";

export class NamesNoDashConf extends BasicRuleConfig {
}

// todo, also check for other characters like %&$, rename rule? and extend to more kinds of identifiers?
export class NamesNoDash extends ABAPRule {

  private conf = new NamesNoDashConf();

  public getMetadata() {
    return {
      key: "names_no_dash",
      title: "No dashes in FORM and DATA names",
      shortDescription: `Checks for a "-" in FORM and DATA names`,
    };
  }

  private getMessage(): string {
    return "No dash allowed in FORM and DATA names";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: NamesNoDashConf): void {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const struc = file.getStructure();
    if (struc === undefined) {
      return issues;
    }

    for (const form of struc.findAllStatements(Statements.Form)) {
      const expr = form.findFirstExpression(FormName);
      for (const token of expr!.getTokens()) {
        if (token instanceof Dash || token instanceof DashW) {
          const issue = Issue.atToken(file, token, this.getMessage(), this.getMetadata().key, this.conf.severity);
          issues.push(issue);
          break;
        }
      }
    }

    for (const name of struc.findAllExpressions(Expressions.DefinitionName)) {
      const text = name.concatTokens();
      if (text.includes("-")) {
        const issue = Issue.atToken(file, name.getFirstToken(), this.getMessage(), this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }

    return issues;
  }

}