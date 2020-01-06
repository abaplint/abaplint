import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import * as Structures from "../abap/structures";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ClassName} from "../abap/expressions";

// todo, unit test missing

/** Reports errors if the current class references itself with "current_class=>"
 * https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#omit-the-self-reference-me-when-calling-an-instance-method
 */
export class PrefixIsCurrentClassConf extends BasicRuleConfig {
}

export class PrefixIsCurrentClass extends ABAPRule {
  private conf = new PrefixIsCurrentClassConf();

  public getKey(): string {
    return "prefix_is_current_class";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: PrefixIsCurrentClassConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const struc = file.getStructure();
    if (struc === undefined) {
      return [];
    }

    for (const c of struc.findAllStructures(Structures.ClassImplementation)) {
      const name = c.findFirstExpression(ClassName)!.getFirstToken().getStr().toUpperCase();
      const search = name + "=>";

      for (const s of c.findAllStatementNodes()) {
        if (s.concatTokens().toUpperCase().includes(search)) {
          const issue = Issue.atToken(file, s.getFirstToken(), "Statement contains \"" + search + "\"", this.getKey());
          issues.push(issue);
        }
      }
    }

    return issues;
  }
}
