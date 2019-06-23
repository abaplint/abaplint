import {Issue} from "../issue";
import * as Structures from "../abap/structures/";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";

export class EmptyLoopConf extends BasicRuleConfig {
  public length: number = 120;
}

export class EmptyLoop extends ABAPRule {

  private conf = new EmptyLoopConf();

  public getKey(): string {
    return "empty_loop";
  }

  public getDescription(): string {
    return "Empty loop";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: EmptyLoopConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return [];
    }

    for (const l of stru.findAllStructures(Structures.Loop)) {
      if (l.getChildren().length === 2) {
        const issue = new Issue({file, message: this.getDescription(), key: this.getKey(), start: l.getFirstToken().getStart()});
        issues.push(issue);
      }
    }

    return issues;
  }

}