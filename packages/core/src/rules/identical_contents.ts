import * as Structures from "../abap/3_structures/structures";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {IRuleMetadata, RuleTag} from "./_irule";
import {StatementNode, StructureNode} from "../abap/nodes";
import {ABAPFile} from "../abap/abap_file";
import {Unknown} from "../abap/2_statements/statements/_statement";

export class IdenticalContentsConf extends BasicRuleConfig {
}

export class IdenticalContents extends ABAPRule {
  private conf = new IdenticalContentsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "identical_contents",
      title: "Identical contents",
      shortDescription: `Find identical contents in blocks inside IFs, both in the beginning and in the end.`,
      extendedInformation: `
Prerequsites: code is pretty printed with identical cAsE

Chained statments are ignored`,
      tags: [RuleTag.SingleFile],
      badExample: `IF foo = bar.
  WRITE 'bar'.
  WRITE 'world'.
ELSE.
  WRITE 'foo'.
  WRITE 'world'.
ENDIF.`,
      goodExample: `IF foo = bar.
  WRITE 'bar'.
ELSE.
  WRITE 'foo'.
ENDIF.
WRITE 'world'.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: IdenticalContentsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    let issues: Issue[] = [];

    const structure = file.getStructure();
    if (structure === undefined) {
      return [];
    }
    for (const statement of file.getStatements()) {
      if (statement.get() instanceof Unknown) {
        return []; // contains parser errors
      }
    }

    for (const i of structure.findAllStructuresRecursive(Structures.If)) {
      issues = issues.concat(this.analyzeIf(file, i));
    }

    return issues;
  }

////////////////

  private analyzeIf(file: ABAPFile, node: StructureNode): Issue[] {
    if (node.getChildren().length !== 4) {
      return [];
    }

    const ifBody = node.findDirectStructure(Structures.Body);
    if (node.findDirectStructure(Structures.ElseIf)) {
      return [];
    }
    const elseBody = node.findDirectStructure(Structures.Else)?.findDirectStructure(Structures.Body);
    if (elseBody === undefined || ifBody === undefined) {
      return [];
    }

    {
      const ifFirst = ifBody.getFirstChild();
      const elseFirst = elseBody.getFirstChild();
      if (ifFirst === undefined || elseFirst === undefined || this.isChained(ifFirst)) {
        return [];
      } else if (ifFirst.concatTokens() === elseFirst.concatTokens()) {
        const message = "Identical contents";
        const issue = Issue.atToken(file, node.getFirstToken(), message, this.getMetadata().key, this.conf.severity);
        return [issue];
      }
    }

    {
      const ifLast = ifBody.getLastChild();
      const elseLast = elseBody.getLastChild();
      if (ifLast === undefined || elseLast === undefined || this.isChained(ifLast)) {
        return [];
      } else if (ifLast.concatTokens() === elseLast.concatTokens()) {
        const message = "Identical contents";
        const issue = Issue.atToken(file, node.getFirstToken(), message, this.getMetadata().key, this.conf.severity);
        return [issue];
      }
    }

    return [];
  }

  private isChained(node: StructureNode | StatementNode | undefined): boolean {
    if (node === undefined) {
      return false;
    } else if (node instanceof StatementNode) {
      return node.getColon() !== undefined;
    } else {
      return this.isChained(node.getFirstStatement());
    }
  }

}