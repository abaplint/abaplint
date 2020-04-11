import {Issue} from "../issue";
import * as Structures from "../abap/3_structures/structures";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";

/** Detects nested ifs which can be refactored to a single condition using AND. */
export class IfInIfConf extends BasicRuleConfig {
}

export class IfInIf extends ABAPRule {

  private conf = new IfInIfConf();

  public getKey(): string {
    return "if_in_if";
  }

  private getMessage(): string {
    return "IF in IF. Use IF cond1 AND cond2 instead";
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

    let possible = stru.findAllStructures(Structures.If);
    possible = possible.concat(stru.findAllStructures(Structures.Else));

    for (const i of possible) {
      if (i.findDirectStructures(Structures.ElseIf).length > 0
          || i.findDirectStructures(Structures.Else).length > 0) {
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
      if (i.get() instanceof Structures.If
          && (nestedIf.findDirectStructures(Structures.ElseIf).length > 0
          || nestedIf.findDirectStructures(Structures.Else).length > 0)) {
        continue;
      }

      const token = i.getFirstToken();
      const issue = Issue.atToken(file, token, this.getMessage(), this.getKey());
      issues.push(issue);
    }

    return issues;
  }

}