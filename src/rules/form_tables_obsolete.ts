import {Issue} from "../issue";
import {Class} from "../objects";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {Registry} from "../registry";
import * as Expressions from "../abap/expressions";
import {ABAPObject} from "../objects/_abap_object";

/** Checks for TABLES parameters in forms. */
export class FormTablesObsoleteConf extends BasicRuleConfig {
}

export class FormTablesObsolete extends ABAPRule {

  private conf = new FormTablesObsoleteConf();

  public getKey(): string {
    return "form_tables_obsolete";
  }

  private getDescription(): string {
    return "FORM TABLES parameters are obsolete.";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: FormTablesObsoleteConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _reg: Registry, obj: ABAPObject) {
    const ret: Issue[] = [];

    const stru = file.getStructure();
    if (obj instanceof Class || stru === undefined) {
      return ret;
    }

    for (const form of stru.findAllExpressions(Expressions.FormTables)) {
      const token = form.getFirstToken();
      const issue = Issue.atToken(file, token, this.getDescription(), this.getKey());
      ret.push(issue);
    }

    return ret;
  }

}