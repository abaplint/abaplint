import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import * as Statements from "../abap/2_statements/statements";
import {StatementFlow} from "../abap/flow/statement_flow";
import {EditHelper, IEdit} from "../edit_helper";

export class UnnecessaryReturnConf extends BasicRuleConfig {
}

export class UnnecessaryReturn extends ABAPRule {
  private conf = new UnnecessaryReturnConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "unnecessary_return",
      title: "Unnecessary Return",
      shortDescription: `Finds unnecessary RETURN statements`,
      extendedInformation: `todo`,
      tags: [RuleTag.SingleFile],
      badExample: `METHOD hello.
  ...
  RETURN.
ENDMETHOD.`,
      goodExample: `METHOD hello.
  ...
ENDMETHOD.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UnnecessaryReturnConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const structure = file.getStructure();
    if (structure === undefined) {
      return [];
    }

    const flows = new StatementFlow().build(structure);
    for (const graph of flows) {
      for (const edge of graph.listEdges()) {
        if (edge.from.startsWith("Return:") && edge.to === "end#1") {
          const row = Number.parseInt(edge.from.match(/:(\d+),/)![1], 10);
          const message = "Unnecessary RETURN";
          const node = this.findNode(file, row);
          let fix: IEdit | undefined = undefined;
          if (node) {
            fix = EditHelper.deleteStatement(file, node);
            issues.push(Issue.atStatement(file, node, message, this.getMetadata().key, this.getConfig().severity, fix));
          } else {
            issues.push(Issue.atRow(file, row, message, this.getMetadata().key, this.getConfig().severity));
          }
        }
      }
    }

    return issues;
  }

  private findNode(file: ABAPFile, row: number) {
    for (const s of file.getStatements()) {
      if (s.getStart().getRow() === row && s.get() instanceof Statements.Return) {
        return s;
      }
    }
    return undefined;
  }

}