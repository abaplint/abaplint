import {Issue} from "../issue";
import {Class} from "../objects";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {Registry} from "../registry";
import * as Statements from "../abap/statements";
import {ABAPObject} from "../objects/_abap_object";

/** Checks for TABLES parameters in forms. */
export class FormTablesObsoleteConf extends BasicRuleConfig {
}

export class FormTablesObsolete extends ABAPRule {

  private conf = new FormTablesObsoleteConf();

  public getKey(): string {
    return "form_tables_obsolete";
  }

  public getDescription(): string {
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

    for (const form of stru.findAllStatements(Statements.Form)) {
      if (form.findDirectTokenByText("TABLES")) {
        const token = form.getFirstToken();
        ret.push(new Issue({
          file,
          message: this.getDescription(),
          key: this.getKey(),
          start: token.getStart(),
          end: token.getEnd(),
        }));
      }
    }

    return ret;
  }

}