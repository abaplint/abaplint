import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import * as Expressions from "../abap/2_statements/expressions";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ExpressionNode} from "../abap/nodes";
import {EditHelper} from "../edit_helper";

export class PreferStringTemplateConf extends BasicRuleConfig {
}

export class PreferStringTemplate extends ABAPRule {

  private conf = new PreferStringTemplateConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "prefer_string_template",
      title: "Prefer string template over &&",
      shortDescription: `Use string templates instead of && to assemble text`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#use--to-assemble-text`,
      tags: [RuleTag.Styleguide, RuleTag.SingleFile, RuleTag.Quickfix],
      badExample: `DATA(msg) = \`Hello \` && name && \`!\`.`,
      goodExample: `DATA(msg) = |Hello { name }!|.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: PreferStringTemplateConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    const structure = file.getStructure();
    if (structure === undefined) {
      return [];
    }

    const allSources = structure.findAllExpressions(Expressions.Source);

    // collect all Source nodes that appear as the RHS (children[2]) of a && expression
    const rhsChildren = new Set<ExpressionNode>();
    for (const source of allSources) {
      const children = source.getChildren();
      if (children.length === 3 && children[1].getFirstToken().getStr() === "&&") {
        rhsChildren.add(children[2] as ExpressionNode);
      }
    }

    for (const source of allSources) {
      const children = source.getChildren();
      if (children.length !== 3) {
        continue;
      }
      if (children[1].getFirstToken().getStr() !== "&&") {
        continue;
      }
      // only process top-level && roots (not nested RHS children)
      if (rhsChildren.has(source)) {
        continue;
      }

      const operands = this.flattenChain(source);
      if (!operands.some(op => { const c = op.getFirstToken().getStr()[0]; return c === "'" || c === "`"; })) {
        continue;
      }

      const template = this.buildTemplate(operands);
      const start = source.getFirstToken().getStart();
      const end = source.getLastToken().getEnd();
      const fix = EditHelper.replaceRange(file, start, end, template);

      const token = children[1].getFirstToken();
      issues.push(Issue.atToken(file, token, "Use string template instead of &&", this.getMetadata().key, this.conf.severity, fix));
    }

    return issues;
  }

  private flattenChain(node: ExpressionNode): ExpressionNode[] {
    const children = node.getChildren();
    if (children.length === 3 && children[1].getFirstToken().getStr() === "&&") {
      return [...this.flattenChain(children[0] as ExpressionNode), ...this.flattenChain(children[2] as ExpressionNode)];
    }
    if (children.length === 1 && children[0] instanceof ExpressionNode) {
      return this.flattenChain(children[0]);
    }
    return [node];
  }

  private buildTemplate(operands: ExpressionNode[]): string {
    let inner = "";
    for (const op of operands) {
      const raw = op.getFirstToken().getStr();
      const firstChar = raw[0];
      if (firstChar === "'" || firstChar === "`") {
        inner += raw.slice(1, -1);
      } else {
        inner += `{ ${op.concatTokens()} }`;
      }
    }
    return `|${inner}|`;
  }

}
