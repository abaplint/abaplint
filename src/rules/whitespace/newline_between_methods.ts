import {Issue} from "../../issue";
import {BasicRuleConfig} from "../_basic_rule_config";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {SequentialBlank} from "./sequential_blank";
import * as Statements from "../../abap/statements";

export class NewlineBetweenMethodsConf extends BasicRuleConfig {}

export class NewlineBetweenMethods extends ABAPRule {
  private conf = new NewlineBetweenMethodsConf();

  public getKey(): string {
    return "newline_between_methods";
  }

  private getDescription(): string {
    return `A single newline is required in between methods.`;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: NewlineBetweenMethodsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    const rows = file.getRawRows();
    for (const statement of file.getStatements()) {
      const nextRow = statement.getStart().getRow();
      if (!(statement.get() instanceof Statements.EndMethod)
          || (rows[nextRow].includes("ENDCLASS.")
          || (SequentialBlank.isBlankOrWhitespace(rows[nextRow]) && !SequentialBlank.isBlankOrWhitespace(rows[nextRow + 1])))) {
        continue;
      }
      issues.push(Issue.atStatement(
        file,
        statement,
        this.getDescription(),
        this.getKey()));
    }
    return issues;
  }
}