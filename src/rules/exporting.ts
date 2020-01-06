import {Position} from "../position";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {MethodParameters, MethodCallBody, MethodCall} from "../abap/expressions";
import {ExpressionNode} from "../abap/nodes";

export class Counter {
  public exporting: boolean = false;
  public other: boolean = false;
  public pos: Position;
}

/** Detects EXPORTING statements which can be omitted.
 * https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#omit-the-optional-keyword-exporting
 * https://docs.abapopenchecks.org/checks/30/
 */
export class ExportingConf extends BasicRuleConfig {
}

export class Exporting extends ABAPRule {

  private conf = new ExportingConf();

  public getKey(): string {
    return "exporting";
  }

  private getDescription(): string {
    return "The EXPORTING keyword can be omitted";
  }

  public runParsed(file: ABAPFile) {
    let issues: Issue[] = [];

    for (const statement of file.getStatements()) {
      for (const b of statement.findAllExpressions(MethodCallBody)) {
        if (b.getFirstToken().getStr() !== "(") {
          continue;
        }
        issues = issues.concat(this.check(b, file));
      }

      for (const b of statement.findAllExpressions(MethodCall)) {
        issues = issues.concat(this.check(b, file));
      }

    }

    return issues;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ExportingConf) {
    this.conf = conf;
  }

  private check(node: ExpressionNode, file: ABAPFile): Issue[] {

    for (const e of node.findAllExpressions(MethodParameters)) {
      const found = e.findDirectTokenByText("EXPORTING");
      if (found !== undefined
          && e.findDirectTokenByText("IMPORTING") === undefined
          && e.findDirectTokenByText("RECEIVING") === undefined
          && e.findDirectTokenByText("EXCEPTIONS") === undefined
          && e.findDirectTokenByText("CHANGING") === undefined) {
        const issue = Issue.atToken(file, found, this.getDescription(), this.getKey());
        return [issue];
      }
    }

    return [];
  }


}