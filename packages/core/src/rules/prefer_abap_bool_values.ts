import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {EditHelper} from "../edit_helper";
import {ABAPFile} from "../abap/abap_file";
import {ExpressionNode} from "../abap/nodes";

const ABAP_BOOL = "ABAP_BOOL";
const ABAP_TRUE = "abap_true";
const ABAP_FALSE = "abap_false";
const VALID_VALUES = new Set(["ABAP_TRUE", "ABAP_FALSE", "ABAP_UNDEFINED"]);

export class PreferAbapBoolValuesConf extends BasicRuleConfig {
}

export class PreferAbapBoolValues extends ABAPRule {
  private conf = new PreferAbapBoolValuesConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "prefer_abap_bool_values",
      title: "Prefer abap_true and abap_false",
      shortDescription: `Use abap_true and abap_false instead of 'X' and ' ' for abap_bool variables`,
      // eslint-disable-next-line max-len
      extendedInformation: `https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#use-abap_true-abap_false-and-abap_undefined-for-abap_bool-variables`,
      tags: [RuleTag.Styleguide, RuleTag.SingleFile, RuleTag.Quickfix],
      badExample: `DATA lv_flag TYPE abap_bool.\nlv_flag = 'X'.`,
      goodExample: `DATA lv_flag TYPE abap_bool.\nlv_flag = abap_true.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: PreferAbapBoolValuesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    const structure = file.getStructure();
    if (structure === undefined) {
      return [];
    }

    const boolVars = this.collectBoolVars(file);

    // Check Move statements: target = source
    for (const stat of structure.findAllStatements(Statements.Move)) {
      const target = stat.findFirstExpression(Expressions.Target);
      const source = stat.findFirstExpression(Expressions.Source);
      if (target === undefined || source === undefined) {
        continue;
      }

      const targetName = target.concatTokens().toUpperCase();
      if (!boolVars.has(targetName)) {
        continue;
      }

      this.checkSourceNode(source, file, issues);
    }

    // Check comparisons: IF/ELSEIF conditions
    const compareStatements = [
      ...structure.findAllStatements(Statements.If),
      ...structure.findAllStatements(Statements.ElseIf),
    ];
    for (const stat of compareStatements) {
      const cond = stat.findFirstExpression(Expressions.Cond);
      if (cond === undefined) {
        continue;
      }
      for (const compare of cond.findAllExpressions(Expressions.Compare)) {
        this.checkCompareBoolLiteral(compare, boolVars, file, issues);
      }
    }

    return issues;
  }

  private collectBoolVars(file: ABAPFile): Set<string> {
    const boolVars = new Set<string>();
    const structure = file.getStructure();
    if (structure === undefined) {
      return boolVars;
    }

    const statements = [
      ...structure.findAllStatements(Statements.Data),
      ...structure.findAllStatements(Statements.ClassData),
      ...structure.findAllStatements(Statements.FieldSymbol),
    ];

    for (const stat of statements) {
      const typeNameExpr = stat.findFirstExpression(Expressions.TypeName);
      if (typeNameExpr === undefined) {
        continue;
      }
      if (typeNameExpr.concatTokens().toUpperCase() !== ABAP_BOOL) {
        continue;
      }

      const nameExpr = stat.findFirstExpression(Expressions.DefinitionName)
        ?? stat.findFirstExpression(Expressions.FieldSymbol);
      if (nameExpr === undefined) {
        continue;
      }
      boolVars.add(nameExpr.concatTokens().toUpperCase());
    }

    return boolVars;
  }

  private checkSourceNode(source: ExpressionNode, file: ABAPFile, issues: Issue[]): void {
    const firstToken = source.getFirstToken().getStr().toUpperCase();

    if (firstToken === "COND") {
      const condBody = source.findDirectExpression(Expressions.CondBody);
      if (condBody) {
        this.checkCondBodyBranches(condBody, file, issues);
      }
      return;
    }

    if (firstToken === "SWITCH") {
      const switchBody = source.findDirectExpression(Expressions.SwitchBody);
      if (switchBody) {
        this.checkSwitchBodyBranches(switchBody, file, issues);
      }
      return;
    }

    // Plain literal assignment
    const issue = this.checkLiteralSource(source, file);
    if (issue) {
      issues.push(issue);
    }
  }

  private checkLiteralSource(source: ExpressionNode, file: ABAPFile): Issue | undefined {
    const constantStr = source.findFirstExpression(Expressions.ConstantString);
    if (constantStr === undefined) {
      return undefined;
    }
    const token = constantStr.getFirstToken();
    const val = token.getStr();

    if (val === "'X'") {
      const fix = EditHelper.replaceToken(file, token, ABAP_TRUE);
      return Issue.atToken(file, token, `Use ${ABAP_TRUE} instead of 'X'`, this.getMetadata().key, this.conf.severity, fix);
    }
    if (val === "' '") {
      const fix = EditHelper.replaceToken(file, token, ABAP_FALSE);
      return Issue.atToken(file, token, `Use ${ABAP_FALSE} instead of ' '`, this.getMetadata().key, this.conf.severity, fix);
    }

    return undefined;
  }

  private checkCondBodyBranches(condBody: ExpressionNode, file: ABAPFile, issues: Issue[]): void {
    // CondBody: WHEN <cond> THEN <source> [WHEN <cond> THEN <source>]* [ELSE <source>]
    // Walk children; Source nodes after THEN/ELSE are the result values
    let afterThenOrElse = false;
    for (const child of condBody.getChildren()) {
      const tokenStr = child.getFirstToken().getStr().toUpperCase();
      if (tokenStr === "THEN" || tokenStr === "ELSE") {
        afterThenOrElse = true;
        continue;
      }
      if (tokenStr === "WHEN") {
        afterThenOrElse = false;
        continue;
      }
      if (afterThenOrElse && child instanceof ExpressionNode && child.get() instanceof Expressions.Source) {
        const issue = this.checkLiteralSource(child as ExpressionNode, file);
        if (issue) {
          issues.push(issue);
        }
        afterThenOrElse = false;
      }
    }
  }

  private checkSwitchBodyBranches(switchBody: ExpressionNode, file: ABAPFile, issues: Issue[]): void {
    // SwitchBody: <source> WHEN <val> [OR <val>]* THEN <source> [ELSE <source>]
    // First Source is the operand; Source after THEN/ELSE are result values
    let firstSourceSeen = false;
    let afterThenOrElse = false;
    for (const child of switchBody.getChildren()) {
      const tokenStr = child.getFirstToken().getStr().toUpperCase();
      if (tokenStr === "THEN" || tokenStr === "ELSE") {
        afterThenOrElse = true;
        continue;
      }
      if (tokenStr === "WHEN" || tokenStr === "OR") {
        afterThenOrElse = false;
        continue;
      }
      if (child instanceof ExpressionNode && child.get() instanceof Expressions.Source) {
        if (!firstSourceSeen) {
          firstSourceSeen = true;
          continue;
        }
        if (afterThenOrElse) {
          const issue = this.checkLiteralSource(child as ExpressionNode, file);
          if (issue) {
            issues.push(issue);
          }
          afterThenOrElse = false;
        }
      }
    }
  }

  private checkCompareBoolLiteral(
    compare: ExpressionNode,
    boolVars: Set<string>,
    file: ABAPFile,
    issues: Issue[],
  ): void {
    // Compare: Source CompareOperator Source  (or other forms)
    const sources = compare.findDirectExpressions(Expressions.Source);
    if (sources.length < 2) {
      return;
    }

    const [left, right] = sources;
    const leftStr = left.concatTokens().toUpperCase();
    const rightStr = right.concatTokens().toUpperCase();

    let literalSource: ExpressionNode | undefined;

    if (boolVars.has(leftStr) && !VALID_VALUES.has(rightStr)) {
      literalSource = right;
    } else if (boolVars.has(rightStr) && !VALID_VALUES.has(leftStr)) {
      literalSource = left;
    }

    if (literalSource) {
      const issue = this.checkLiteralSource(literalSource, file);
      if (issue) {
        issues.push(issue);
      }
    }
  }
}
