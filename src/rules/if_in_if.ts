import {Issue} from "../issue";
import * as Structures from "../abap/structures/";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";

export class IfInIfConf extends BasicRuleConfig {
}

export class IfInIf extends ABAPRule {

  private conf = new IfInIfConf();

  public getKey(): string {
    return "if_in_if";
  }

  public getDescription(): string {
    return "IF in IF";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: IfInIfConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return [];
    }

    for (const i of stru.findAllStructures(Structures.If)) {
      if (i.findDirectStructures(Structures.Elseif).length > 0 || i.findDirectStructures(Structures.Else).length > 0) {
        continue;
      }

      const blist = i.findDirectStructures(Structures.Body);
      if (blist.length === 0) {
        continue;
      }

      const nlist = blist[0].findDirectStructures(Structures.Normal);
      if (nlist.length !== 1) {
        continue;
      }

      const niflist = nlist[0].findDirectStructures(Structures.If);
      if (niflist.length !== 1) {
        continue;
      }

      const nestedIf = niflist[0];
      if (nestedIf.findDirectStructures(Structures.Elseif).length > 0 || nestedIf.findDirectStructures(Structures.Else).length > 0) {
        continue;
      }

      const issue = new Issue({file, message: this.getDescription(), key: this.getKey(), start: i.getFirstToken().getPos()});
      issues.push(issue);
    }

    return issues;
  }

}