import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ExpressionNode} from "../abap/nodes";

export class NoYodaConditionsConf extends BasicRuleConfig {
}

export class NoYodaConditions extends ABAPRule {

  private conf = new NoYodaConditionsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "no_yoda_conditions",
      title: "No Yoda conditions",
      shortDescription: `Finds Yoda conditions and reports issues`,
      extendedInformation: `https://en.wikipedia.org/wiki/Yoda_conditions

Conditions with operators CP, NP, CS, NS, CA, NA, CO, CN are ignored`,
      tags: [RuleTag.SingleFile],
      badExample: `IF 0 <> sy-subrc.
ENDIF.`,
      goodExample: `IF sy-subrc <> 0.
ENDIF.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: NoYodaConditionsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const c of file.getStructure()?.findAllExpressions(Expressions.Compare) || []) {
      const operator = c.findDirectExpression(Expressions.CompareOperator)?.concatTokens().toUpperCase();
      if (operator === undefined
          || operator === "CP"
          || operator === "NP"
          || operator === "CS"
          || operator === "NS"
          || operator === "CA"
          || operator === "NA"
          || operator === "CO"
          || operator === "CN") {
        continue;
      }

      const sources = c.findDirectExpressions(Expressions.Source);
      if (sources.length !== 2) {
        continue;
      }

  // Scenarios:
  //   constant COMPARE chain
  //   constant COMPARE multiple tokens with spaces
  //   fieldChain COMPARE multiple tokens with spaces

      if ((this.withoutSpaces(sources[0]) === false && this.withoutSpaces(sources[1]) === true) || (
        (this.isConstant(sources[0]) === true && this.isFieldChain(sources[1]) === true))) {
        const start = sources[0].getFirstToken().getStart();
        const end = sources[1].getLastToken().getEnd();
        const issue = Issue.atRange(file, start, end, "No Yoda conditions", this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }

    return issues;
  }

  private isConstant(node: ExpressionNode): boolean {
    if (node.getChildren().length > 1) {
      return false;
    }

    return node.getFirstChild()?.get() instanceof Expressions.Constant;
  }

  private isFieldChain(node: ExpressionNode): boolean {
    if (node.getChildren().length > 1) {
      return false;
    }

    return node.getFirstChild()?.get() instanceof Expressions.FieldChain;
  }

  private withoutSpaces(node: ExpressionNode): boolean {
    return node.concatTokensWithoutStringsAndComments().includes(" ");
  }

}
