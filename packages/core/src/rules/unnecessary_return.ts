import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {StatementFlow} from "../abap/flow/statement_flow";

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
    for (const _graph of flows) {
//      console.log(graph.toDigraph());
    }

    return issues;
  }

}