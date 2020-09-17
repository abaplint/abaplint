import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {IRuleMetadata} from "./_irule";
import {ExpressionNode, StructureNode} from "../abap/nodes";

function hasDuplicates(arr: string[]): boolean {
  return arr.some(x => arr.indexOf(x) !== arr.lastIndexOf(x));
}


export class IdenticalConditionsConf extends BasicRuleConfig {
}

export class IdenticalConditions extends ABAPRule {
  private conf = new IdenticalConditionsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "identical_conditions",
      title: "Identical conditions",
      shortDescription: `Find identical conditions in IF + CASE + WHILE etc`,
      tags: [],
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
    const conditions: string[] = [];
    let operator = "";

    for (const c of node.getChildren()) {
      if (c instanceof ExpressionNode) {
        conditions.push(c.concatTokens().toUpperCase());
      } else if (operator === "") {
        operator = c.get().getStr().toUpperCase();
      } else if (operator !== c.get().getStr().toUpperCase()) {
        return [];
      }
    }

    if (hasDuplicates(conditions)) {
      const message = "Identical conditions";
      const issue = Issue.atToken(file, node.getFirstToken(), message, this.getMetadata().key, this.conf.severity);
      return [issue];
    }

    return [];
  }

  private analyzeIf(file: ABAPFile, node: StructureNode): Issue[] {
    const conditions: string[] = [];

    const i = node.findDirectStatement(Statements.If);
    if (i === undefined) {
      throw new Error("identical_conditions, no IF found");
    }
    const c = i?.findDirectExpression(Expressions.Cond);
    if (c) {
      conditions.push(c.concatTokens().toUpperCase());
    }

    for (const e of node.findDirectStructures(Structures.ElseIf)) {
      const c = e.findDirectStatement(Statements.ElseIf)?.findDirectExpression(Expressions.Cond);
      if (c) {
        conditions.push(c.concatTokens().toUpperCase());
      }
    }

    if (hasDuplicates(conditions)) {
      const message = "Identical conditions";
      const issue = Issue.atStatement(file, i, message, this.getMetadata().key, this.conf.severity);
      return [issue];
    }

    return [];
  }

  private analyzeWhen(file: ABAPFile, node: StructureNode): Issue[] {
    const conditions: string[] = [];

    const i = node.findDirectStatement(Statements.Case);
    if (i === undefined) {
      throw new Error("identical_conditions, no CASE found");
    }
    const c = i?.findDirectExpression(Expressions.Source);
    if (c) {
      conditions.push(c.concatTokens().toUpperCase());
    }

    for (const e of node.findDirectStructures(Structures.When)) {
      const w = e.findDirectStatement(Statements.When);
      if (w === undefined) {
        continue;
      }
      for (const s of w.findAllExpressions(Expressions.Source)) {
        conditions.push(s.concatTokens().toUpperCase());
      }
    }

    if (hasDuplicates(conditions)) {
      const message = "Identical conditions";
      const issue = Issue.atStatement(file, i, message, this.getMetadata().key, this.conf.severity);
      return [issue];
    }

    return [];
  }
}