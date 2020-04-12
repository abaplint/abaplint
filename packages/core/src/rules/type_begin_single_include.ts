import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";

export class TypeBeginSingleTypeConf extends BasicRuleConfig {
}

export class TypeBeginSingleType extends ABAPRule {

  private conf = new TypeBeginSingleTypeConf();

  public getMetadata() {
    return {
      key: "type_begin_single_include",
      title: "TYPE BEGIN contains single field",
      quickfix: false,
      shortDescription: `Finds TYPE BEGIN with just one INCLUDE TYPE`,
    };
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
        const issue = Issue.atToken(file, token, message, this.getMetadata().key);
        issues.push(issue);
      }
    }

    return issues;
  }

}