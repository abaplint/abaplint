import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Statements from "../abap/statements";
import * as Structures from "../abap/structures";

/** Finds TYPE BEGIN with just one INCLUDE TYPE */
export class TypeBeginSingleTypeConf extends BasicRuleConfig {
}

export class TypeBeginSingleType extends ABAPRule {

  private conf = new TypeBeginSingleTypeConf();

  public getKey(): string {
    return "type_begin_single_include";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: TypeBeginSingleTypeConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return [];
    }

    for (const t of stru.findAllStructures(Structures.Types)) {
      if (t.getChildren().length !== 3) {
        continue;
      }
      if (t.findFirstStatement(Statements.IncludeType)) {
        const token = t.getFirstToken();
        const message = "TYPE BEGIN with single INCLUDE TYPE";
        const issue = Issue.atToken(file, token, message, this.getKey());
        issues.push(issue);
      }
    }

    return issues;
  }

}