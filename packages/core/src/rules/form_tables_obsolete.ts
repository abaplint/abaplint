import {Issue} from "../issue";
import {Class} from "../objects";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import * as Expressions from "../abap/2_statements/expressions";
import {ABAPObject} from "../objects/_abap_object";
import {IRuleMetadata} from "./_irule";

export class FormTablesObsoleteConf extends BasicRuleConfig {
}

export class FormTablesObsolete extends ABAPRule {

  private conf = new FormTablesObsoleteConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "form_tables_obsolete",
      title: "TABLES parameters are obsolete",
      shortDescription: `Checks for TABLES parameters in forms.`,
      extendedInformation: `https://help.sap.com/doc/abapdocu_751_index_htm/7.51/en-US/abapform_tables.htm`,
    };
  }

  private getMessage(): string {
    return "FORM TABLES parameters are obsolete";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: FormTablesObsoleteConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject) {
    const ret: Issue[] = [];

    const stru = file.getStructure();
    if (obj instanceof Class || stru === undefined) {
      return ret;
    }

    for (const form of stru.findAllExpressions(Expressions.FormTables)) {
      const token = form.getFirstToken();
      const issue = Issue.atToken(file, token, this.getMessage(), this.getMetadata().key, this.conf.severity);
      ret.push(issue);
    }

    return ret;
  }

}