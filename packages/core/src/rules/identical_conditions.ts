import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ExpressionNode, StructureNode} from "../abap/nodes";
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
}

export class IdenticalConditions extends ABAPRule {
  private conf = new IdenticalConditionsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "identical_conditions",
      title: "Identical conditions",
      shortDescription: `Find identical conditions in IF + CASE + WHILE etc

Prerequsites: code is pretty printed with identical cAsE`,
      tags: [RuleTag.SingleFile],
      badExample: `IF foo = bar OR 1 = a OR foo = bar.
ENDIF.
CASE bar.
  WHEN '1'.
  WHEN 'A' OR '1'.
ENDCASE.`,
      goodExample: `IF foo = bar OR 1 = a.
ENDIF.
CASE bar.
  WHEN '1'.
  WHEN 'A'.
ENDCASE.`,
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

    return issues;
  }

////////////////

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