import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {Issue} from "../issue";
import {NamingRuleConfig} from "./_naming_rule_config";
import {Parameter, SelectOption} from "../abap/2_statements/statements";
import {IStatement} from "../abap/2_statements/statements/_statement";
import {NameValidator} from "../utils/name_validator";
import {FieldSub, Field} from "../abap/2_statements/expressions";
import {StatementNode, ExpressionNode} from "../abap/nodes";
import {RuleTag} from "./_irule";

export class SelectionScreenNamingConf extends NamingRuleConfig {
  /** The pattern for selection-screen parameters */
  public parameter: string = "^P_.+$";
  /** The pattern for selection-screen select-options */
  public selectOption: string = "^S_.+$";
}
export class SelectionScreenNaming extends ABAPRule {

  private conf = new SelectionScreenNamingConf();

  public getMetadata() {
    return {
      key: "selection_screen_naming",
      title: "Selection screen naming conventions",
      shortDescription: `Allows you to enforce a pattern, such as a prefix, for selection-screen variable names.`,
      tags: [RuleTag.Naming],
    };
  }

  private getDescription(expected: string, actual: string): string {
    return this.conf.patternKind === "required" ?
      `Selection-Screen variable name does not match pattern ${expected}: ${actual}` :
      `Selection-Screen variable name must not match pattern ${expected}: ${actual}`;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SelectionScreenNamingConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];
    if (this.conf.patternKind === undefined) {
      this.conf.patternKind = "required";
    }
    let parameterCheckDisabled: boolean = false;
    let selectOptionDisabled: boolean = false;
    if (this.conf.parameter === undefined || this.conf.parameter.length === 0) {
      parameterCheckDisabled = true;
    }
    if (this.conf.selectOption === undefined || this.conf.selectOption.length === 0) {
      selectOptionDisabled = true;
    }

    for (const stat of file.getStatements()) {
      if ((stat.get() instanceof Parameter && !parameterCheckDisabled)
          || (stat.get() instanceof SelectOption && !selectOptionDisabled)) {
        const fieldNode = this.getFieldForStatementNode(stat);
        const regex = new RegExp(this.getPatternForStatement(stat.get()), "i");
        if (fieldNode && NameValidator.violatesRule(fieldNode.getFirstToken().getStr(), regex, this.conf)) {
          issues.push(Issue.atToken(
            file,
            fieldNode.getFirstToken(),
            this.getDescription(this.getPatternForStatement(stat.get()), fieldNode.getFirstToken().getStr()),
            this.getMetadata().key,
            this.conf.severity));
        }
      }
    }
    return issues;
  }

  private getPatternForStatement(statement: IStatement): string {
    let pattern = "";
    if (statement instanceof Parameter) {
      pattern = this.conf.parameter;
    } else if (statement instanceof SelectOption) {
      pattern = this.conf.selectOption;
    }
    return pattern;
  }

  private getFieldForStatementNode(statNode: StatementNode): ExpressionNode | undefined {
    if (statNode.get() instanceof Parameter) {
      return statNode.findFirstExpression(FieldSub);
    } else if (statNode.get() instanceof SelectOption) {
      return statNode.findFirstExpression(Field);
    } else {
      return undefined;
    }
  }
}
