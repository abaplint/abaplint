import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {RuleTag, IRuleMetadata} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class PragmaPlacementConf extends BasicRuleConfig {
}

export class PragmaPlacement extends ABAPRule {
  private conf = new PragmaPlacementConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "pragma_placement",
      title: "Pragma Placement",
      shortDescription: `Place pragmas at end of statements`,
      tags: [RuleTag.SingleFile],
      extendedInformation: `https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/abenpragma.htm`,
      badExample: `DATA field ##NO_TEXT TYPE i.`,
      goodExample: `DATA field TYPE i ##NO_TEXT.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: PragmaPlacementConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const s of file.getStatements()) {
      if (s.getPragmas().length === 0) {
        continue;
      }

      for (const p of s.getPragmas()) {
        const children = s.getChildren();
        if (children.length === 1) {
          break; // empty statement with pragma
        }
        if (children[children.length - 2].getLastToken().getStart().isAfter(p.getStart())) {
          const message = "Place pragma at end of statement";
          const issue = Issue.atToken(file, p, message, this.getMetadata().key, this.conf.severity);
          issues.push(issue);
          continue; // max one finding per statement
        }
      }
    }

    return issues;
  }

}