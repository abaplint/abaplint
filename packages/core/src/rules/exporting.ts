import {Issue} from "../issue";
import {IRuleMetadata} from "./_irule";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {MethodParameters, MethodCallBody, MethodCall} from "../abap/2_statements/expressions";
import {ExpressionNode} from "../abap/nodes";
import {EditHelper} from "../edit";

export class ExportingConf extends BasicRuleConfig {
}

export class Exporting extends ABAPRule {

  private conf = new ExportingConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "exporting",
      title: "EXPORTING can be omitted",
      quickfix: true,
      shortDescription: `Detects EXPORTING statements which can be omitted.`,
      badExample: `call_method( EXPORTING foo = bar ).`,
      goodExample: `call_method( foo = bar ).`,
      extendedInformation:
`https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#omit-the-optional-keyword-exporting
https://docs.abapopenchecks.org/checks/30/`,
    };
  }

  private getMessage(): string {
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
      const tokens = e.getDirectTokens();
      const strings = tokens.map(t => t.getStr().toUpperCase());

      if (strings[0] === "EXPORTING"
          && strings.includes("IMPORTING") === false
          && strings.includes("RECEIVING") === false
          && strings.includes("EXCEPTIONS") === false
          && strings.includes("CHANGING") === false) {

        const next = e.getAllTokens()[1];
        const fix = EditHelper.deleteRange(file, tokens[0].getStart(), next.getStart());

        const issue = Issue.atToken(file, tokens[0], this.getMessage(), this.getMetadata().key, fix);
        return [issue];
      }
    }

    return [];
  }


}