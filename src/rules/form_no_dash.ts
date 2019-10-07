import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {ABAPFile} from "../files";
import * as Statements from "../abap/statements";
import {Dash} from "../abap/tokens";


/** Checks for a Dash in form names.*/
export class FormNoDashConf extends BasicRuleConfig {
}

export class FormNoDash extends ABAPRule {

  private conf = new FormNoDashConf();

  public getKey(): string {
    return "form_no_dash";
  }

  public getDescription(): string {
    return "No dash allowed in FORM Names.";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: FormNoDashConf): void {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const struc = file.getStructure();
    if (struc === undefined) {
      return issues;
    }
    for (const form of struc.findAllStatements(Statements.Form)) {
      if (form.concatTokens().includes(Dash.railroad())) {
        const token = form.getFirstToken();
        issues.push(new Issue({
          file,
          message: this.getDescription(),
          key: this.getKey(),
          start: token.getStart(),
          end: token.getEnd(),
        }));
      }
    }
    return issues;
  }

}