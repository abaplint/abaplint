import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ExpressionNode, StructureNode, TokenNode} from "../abap/nodes";
import {ABAPFile} from "../abap/abap_file";

class Conditions {
  private readonly arr: string[] = [];

  public constructor() {
    this.arr = [];
  }

  public push(e: ExpressionNode) {
    this.arr.push(e.concatTokens());
  }

  public findFirstDuplicate() {
    return this.arr.find(x => this.arr.indexOf(x) !== this.arr.lastIndexOf(x));
  }
}


export class IdenticalConditionsConf extends BasicRuleConfig {
  /** Report a comparison of an operand with itself, like a = a or a <> a */
  public selfComparison: boolean = true;
}

export class IdenticalConditions extends ABAPRule {
  private conf = new IdenticalConditionsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "identical_conditions",
      title: "Identical conditions",
      shortDescription: `Find identical conditions in IF + CASE + WHILE etc

Prerequsites: code is pretty printed with identical cAsE`,
      extendedInformation: `Option selfComparison: reports a comparison with =, <>, <, >, <= or >= (and EQ, NE, LT, GT, LE, GE)
whose two operands are the same data object, like a = a or ls_new-id <> ls_new-id. The comparison is always true or
always false, usually one side should be another field.

Only operands that are data objects are compared: fields, components, attributes, field symbols, dereferences,
offset/length and table expressions without calls. Not reported: method calls and built-in functions, which can
return different values, literals like 1 = 1, ASSERT, and SQL conditions.`,
      tags: [RuleTag.SingleFile],
      badExample: `IF foo = bar OR 1 = a OR foo = bar.
ENDIF.
CASE bar.
  WHEN '1'.
  WHEN 'A' OR '1'.
ENDCASE.
IF ls_new-id = ls_new-id.
ENDIF.`,
      goodExample: `IF foo = bar OR 1 = a.
ENDIF.
CASE bar.
  WHEN '1'.
  WHEN 'A'.
ENDCASE.
IF ls_new-id = ls_old-id.
ENDIF.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: IdenticalConditionsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    let issues: Issue[] = [];

    const structure = file.getStructure();
    if (structure === undefined) {
      return [];
    }

    for (const i of structure.findAllStructures(Structures.If)) {
      issues = issues.concat(this.analyzeIf(file, i));
    }
    for (const i of structure.findAllStructures(Structures.Case)) {
      issues = issues.concat(this.analyzeWhen(file, i));
    }
    for (const i of structure.findAllExpressions(Expressions.Cond)) {
      issues = issues.concat(this.analyzeCond(file, i));
    }
    if (this.conf.selfComparison) {
      issues = issues.concat(this.analyzeSelfComparison(file));
    }

    return issues;
  }

////////////////

  private analyzeSelfComparison(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];

    for (const statement of file.getStatements()) {
      if (statement.get() instanceof Statements.Assert) {
        continue;
      }
      for (const compare of statement.findAllExpressionsRecursive(Expressions.Compare)) {
        const children = compare.getChildren();
        const negated = children[0] instanceof TokenNode && children[0].getFirstToken().getStr().toUpperCase() === "NOT";
        const rest = children.slice(negated ? 1 : 0);
        if (rest.length !== 3
            || !(rest[0] instanceof ExpressionNode) || !(rest[0].get() instanceof Expressions.Source)
            || !(rest[1] instanceof ExpressionNode) || !(rest[1].get() instanceof Expressions.CompareOperator)
            || !(rest[2] instanceof ExpressionNode) || !(rest[2].get() instanceof Expressions.Source)) {
          continue;
        }
        const operator = rest[1].concatTokens().toUpperCase().replace(/ /g, "");
        const value = this.selfValue(operator);
        const left = this.dataObject(rest[0]);
        if (value === undefined || left === undefined || left !== this.dataObject(rest[2])) {
          continue;
        }
        const result = value !== negated ? "true" : "false";
        const message = "Comparison is always " + result + ", " + rest[0].concatTokens() + " is compared with itself";
        issues.push(Issue.atRange(file, compare.getFirstToken().getStart(), compare.getLastToken().getEnd(),
                                  message, this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

  /** result of comparing a value with itself, undefined for operators like CO or CP */
  private selfValue(operator: string): boolean | undefined {
    if (["=", "EQ", "<=", "=<", "LE", ">=", "=>", "GE"].includes(operator)) {
      return true;
    } else if (["<>", "><", "NE", "<", "LT", ">", "GT"].includes(operator)) {
      return false;
    }
    return undefined;
  }

  /** the text of an operand that is a data object without calls, names in upper case, literals as they are */
  private dataObject(source: ExpressionNode): string | undefined {
    const children = source.getChildren();
    if (!(children[0] instanceof ExpressionNode) || !(children[0].get() instanceof Expressions.FieldChain)
        || (children.length === 2 && !(children[1].get() instanceof Expressions.Dereference))
        || children.length > 2
        || source.findFirstExpression(Expressions.MethodCall) !== undefined
        || source.findFirstExpression(Expressions.MethodCallChain) !== undefined
        || source.findFirstExpression(Expressions.NewObject) !== undefined) {
      return undefined;
    }
    return source.getTokens().map(t => {
      const str = t.getStr();
      return str.startsWith("'") || str.startsWith("`") || str.startsWith("|") || str.startsWith("}") ? str : str.toUpperCase();
    }).join(" ");
  }

  private analyzeCond(file: ABAPFile, node: ExpressionNode): Issue[] {
    const conditions = new Conditions();
    let operator = "";

    for (const c of node.getChildren()) {
      if (c instanceof ExpressionNode) {
        conditions.push(c);
      } else if (operator === "") {
        operator = c.get().getStr().toUpperCase();
      } else if (operator !== c.get().getStr().toUpperCase()) {
        return [];
      }
    }

    const duplicate = conditions.findFirstDuplicate();
    if (duplicate) {
      const message = "Identical conditions: " + duplicate;
      const issue = Issue.atToken(file, node.getFirstToken(), message, this.getMetadata().key, this.conf.severity);
      return [issue];
    }

    return [];
  }

  private analyzeIf(file: ABAPFile, node: StructureNode): Issue[] {
    const conditions = new Conditions();

    const i = node.findDirectStatement(Statements.If);
    if (i === undefined) {
      throw new Error("identical_conditions, no IF found");
    }
    const c = i?.findDirectExpression(Expressions.Cond);
    if (c) {
      conditions.push(c);
    }

    for (const e of node.findDirectStructures(Structures.ElseIf)) {
      const c = e.findDirectStatement(Statements.ElseIf)?.findDirectExpression(Expressions.Cond);
      if (c) {
        conditions.push(c);
      }
    }

    const duplicate = conditions.findFirstDuplicate();
    if (duplicate) {
      const message = "Identical conditions: " + duplicate;
      const issue = Issue.atStatement(file, i, message, this.getMetadata().key, this.conf.severity);
      return [issue];
    }

    return [];
  }

  private analyzeWhen(file: ABAPFile, node: StructureNode): Issue[] {
    const conditions = new Conditions();

    const i = node.findDirectStatement(Statements.Case);
    if (i === undefined) {
      throw new Error("identical_conditions, no CASE found");
    }

    for (const e of node.findDirectStructures(Structures.When)) {
      const w = e.findDirectStatement(Statements.When);
      if (w === undefined) {
        continue;
      }
      for (const s of w.findAllExpressions(Expressions.Source)) {
        conditions.push(s);
      }
    }

    const duplicate = conditions.findFirstDuplicate();
    if (duplicate) {
      const message = "Identical conditions: " + duplicate;
      const issue = Issue.atStatement(file, i, message, this.getMetadata().key, this.conf.severity);
      return [issue];
    }

    return [];
  }
}