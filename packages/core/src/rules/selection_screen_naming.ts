import {ABAPRule} from "./_abap_rule";
import {Issue} from "../issue";
import {NamingRuleConfig} from "./_naming_rule_config";
import {Parameter, SelectOption, SelectionScreen} from "../abap/2_statements/statements";
import {IStatement} from "../abap/2_statements/statements/_statement";
import {NameValidator} from "../utils/name_validator";
import {BlockName, FieldSub, InlineField} from "../abap/2_statements/expressions";
import {StatementNode, ExpressionNode} from "../abap/nodes";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class SelectionScreenNamingConf extends NamingRuleConfig {
  /** The pattern for selection-screen parameters */
  public parameter: string = "^P_.+$";
  /** The pattern for selection-screen select-options */
  public selectOption: string = "^S_.+$";
  /** The pattern for selection-screen screen elements */
  public screenElement: string = "^SC_.+$";
}

export class SelectionScreenNaming extends ABAPRule {

  private conf = new SelectionScreenNamingConf();
  private regex = this.compile();

  public getMetadata(): IRuleMetadata {
    return {
      key: "selection_screen_naming",
      title: "Selection screen naming conventions",
      shortDescription: `Allows you to enforce a pattern, such as a prefix, for selection-screen variable names.`,
      tags: [RuleTag.Naming, RuleTag.SingleFile],
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
    this.regex = this.compile();
  }

  private compile() {
    return {
      parameter: new RegExp(this.conf.parameter, "i"),
      selectOption: new RegExp(this.conf.selectOption, "i"),
      screenElement: new RegExp(this.conf.screenElement, "i"),
      ignorePatterns: NameValidator.compileIgnorePatterns(this.conf),
    };
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];
    if (this.conf.patternKind === undefined) {
      this.conf.patternKind = "required";
    }
    let parameterCheckDisabled: boolean = false;
    let selectOptionDisabled: boolean = false;
    let screenElementDisabled: boolean = false;
    if (this.conf.parameter === undefined || this.conf.parameter.length === 0) {
      parameterCheckDisabled = true;
    }
    if (this.conf.selectOption === undefined || this.conf.selectOption.length === 0) {
      selectOptionDisabled = true;
    }
    if (this.conf.screenElement === undefined || this.conf.screenElement.length === 0) {
      screenElementDisabled = true;
    }

    for (const stat of file.getStatements()) {
      if ((stat.get() instanceof Parameter && !parameterCheckDisabled)
          || (stat.get() instanceof SelectOption && !selectOptionDisabled)
          || (stat.get() instanceof SelectionScreen && !screenElementDisabled)) {
        const fieldNode = this.getFieldForStatementNode(stat);
        const regex = this.getRegexForStatement(stat.get());
        if (fieldNode && NameValidator.violatesRule(fieldNode.getFirstToken().getStr(), regex, this.conf, this.regex.ignorePatterns)) {
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
    } else if (statement instanceof SelectionScreen) {
      pattern = this.conf.screenElement;
    }
    return pattern;
  }

  private getRegexForStatement(statement: IStatement): RegExp {
    if (statement instanceof Parameter) {
      return this.regex.parameter;
    } else if (statement instanceof SelectOption) {
      return this.regex.selectOption;
    }
    return this.regex.screenElement;
  }

  private getFieldForStatementNode(statNode: StatementNode): ExpressionNode | undefined {
    if (statNode.get() instanceof Parameter) {
      return statNode.findFirstExpression(FieldSub);
    } else if (statNode.get() instanceof SelectOption) {
      return statNode.findFirstExpression(FieldSub);
    } else if (statNode.get() instanceof SelectionScreen) {
      let ret = statNode.findFirstExpression(InlineField);
      if (ret === undefined && statNode.concatTokens().toUpperCase().includes(" BEGIN OF TABBED BLOCK")) {
        ret = statNode.findFirstExpression(BlockName);
      }
      return ret;
    } else {
      return undefined;
    }
  }
}
