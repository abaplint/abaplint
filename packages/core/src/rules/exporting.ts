import {Issue} from "../issue";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {MethodParameters, MethodCallBody, MethodCall} from "../abap/2_statements/expressions";
import {ExpressionNode} from "../abap/nodes";
import {EditHelper} from "../edit_helper";

export class ExportingConf extends BasicRuleConfig {
}

export class Exporting extends ABAPRule {

  private conf = new ExportingConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "exporting",
      title: "EXPORTING can be omitted",
      shortDescription: `Detects EXPORTING statements which can be omitted.`,
      badExample: `call_method( EXPORTING foo = bar ).`,
      goodExample: `call_method( foo = bar ).`,
      extendedInformation:
`https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#omit-the-optional-keyword-exporting
https://docs.abapopenchecks.org/checks/30/`,
      tags: [RuleTag.Styleguide, RuleTag.Quickfix],
    };
  }

  private getMessage(): string {
    return "The EXPORTING keyword can be omitted";
  }

  public runParsed(file: ABAPFile) {
    let issues: Issue[] = [];

    for (const statement of file.getStatements()) {
      const expressions = statement.findAllExpressionsMulti([MethodCallBody, MethodCall]);

      for (const b of expressions) {
        if (b.get() instanceof MethodCallBody) {
          if (b.getFirstToken().getStr() !== "(") {
            continue;
          }
          issues = issues.concat(this.check(b, file));
        } else if (b.get() instanceof MethodCall) {
          issues = issues.concat(this.check(b, file));
        }
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
    const e = node.findFirstExpression(MethodParameters);
    if (e === undefined) {
      return [];
    }

    if (e.getFirstToken().getStr().toUpperCase() !== "EXPORTING") {
      return [];
    }

    const tokens = e.getDirectTokens();
    const strings = tokens.map(t => t.getStr().toUpperCase());

    if (strings[0] === "EXPORTING"
          && strings.includes("IMPORTING") === false
          && strings.includes("RECEIVING") === false
          && strings.includes("EXCEPTIONS") === false
          && strings.includes("CHANGING") === false) {

      const next = e.getAllTokens()[1];
      const fix = EditHelper.deleteRange(file, tokens[0].getStart(), next.getStart());

      const issue = Issue.atToken(file, tokens[0], this.getMessage(), this.getMetadata().key, this.conf.severity, fix);
      return [issue];
    }

    return [];
  }


}