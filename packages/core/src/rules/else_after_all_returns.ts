import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject} from "../objects/_abap_object";
import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import * as Expressions from "../abap/2_statements/expressions";
import {StatementNode, StructureNode} from "../abap/nodes";
import {EditHelper} from "../edit_helper";
import {Comment} from "../abap/2_statements/statements/_statement";

export class ElseAfterAllReturnsConf extends BasicRuleConfig {
}

export class ElseAfterAllReturns extends ABAPRule {
  private conf = new ElseAfterAllReturnsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "else_after_all_returns",
      title: "Else after all returns",
      shortDescription: `Finds ELSE branches that are redundant because all prior branches exit unconditionally.`,
      extendedInformation: `When every branch preceding ELSE ends with RETURN, EXIT, or CONTINUE (or a non-resumable RAISE / LEAVE), ` +
        `the ELSE keyword adds no logical value and can be removed by de-indenting its body.`,
      tags: [RuleTag.SingleFile, RuleTag.Styleguide, RuleTag.Quickfix],
      badExample: `IF x = 1.\n  RETURN.\nELSE.\n  WRITE 'hello'.\nENDIF.`,
      goodExample: `IF x = 1.\n  RETURN.\nENDIF.\nWRITE 'hello'.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ElseAfterAllReturnsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _obj: ABAPObject) {
    const issues: Issue[] = [];

    const structure = file.getStructure();
    if (structure === undefined) {
      return [];
    }

    for (const ifNode of structure.findAllStructures(Structures.If)) {
      const elseNode = ifNode.findDirectStructure(Structures.Else);
      if (elseNode === undefined) {
        continue;
      }

      if (this.allBranchesExit(ifNode)) {
        const elseStatement = elseNode.findFirstStatement(Statements.Else);
        const endifStatement = ifNode.findDirectStatement(Statements.EndIf);
        if (elseStatement === undefined || endifStatement === undefined) {
          continue;
        }

        const fix = EditHelper.merge(
          EditHelper.replaceRange(file, elseStatement.getFirstToken().getStart(), elseStatement.getLastToken().getEnd(), "ENDIF."),
          EditHelper.deleteStatement(file, endifStatement),
        );
        const message = "Redundant ELSE: all prior branches exit unconditionally";
        issues.push(Issue.atStatement(file, elseStatement, message, this.getMetadata().key, this.conf.severity, fix));
      }
    }

    return issues;
  }

  // Returns true if every branch before the ELSE ends with an unconditional exit.
  private allBranchesExit(ifNode: StructureNode): boolean {
    // Main IF body
    const mainBody = ifNode.findDirectStructure(Structures.Body);
    if (!this.bodyEndsWithExit(mainBody)) {
      return false;
    }

    // Each ELSEIF body
    for (const elseifNode of ifNode.findDirectStructures(Structures.ElseIf)) {
      const elseifBody = elseifNode.findDirectStructure(Structures.Body);
      if (!this.bodyEndsWithExit(elseifBody)) {
        return false;
      }
    }

    return true;
  }

  private bodyEndsWithExit(body: StructureNode | undefined): boolean {
    if (body === undefined) {
      return false;
    }
    const last = this.lastNonCommentStatement(body);
    if (last === undefined) {
      return false;
    }
    return this.isExit(last);
  }

  private collectStatements(node: StructureNode): StatementNode[] {
    const result: StatementNode[] = [];
    for (const child of node.getChildren()) {
      if (child instanceof StatementNode) {
        result.push(child);
      } else if (child instanceof StructureNode) {
        result.push(...this.collectStatements(child));
      }
    }
    return result;
  }

  private lastNonCommentStatement(node: StructureNode): StatementNode | undefined {
    const all = this.collectStatements(node);
    for (let i = all.length - 1; i >= 0; i--) {
      if (!(all[i].get() instanceof Comment)) {
        return all[i];
      }
    }
    return undefined;
  }

  private isExit(node: StatementNode): boolean {
    const s = node.get();
    if (s instanceof Statements.Return
        || s instanceof Statements.Exit
        || s instanceof Statements.Continue) {
      return true;
    }
    if (s instanceof Statements.Raise) {
      return !node.concatTokens().toUpperCase().includes("RESUMABLE");
    }
    if (s instanceof Statements.Leave) {
      const tokens = node.concatTokens().toUpperCase();
      return !tokens.includes("LIST-PROCESSING") && node.findFirstExpression(Expressions.AndReturn) === undefined;
    }
    return false;
  }

}
