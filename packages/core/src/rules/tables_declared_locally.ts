import {Issue} from "../issue";
import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class TablesDeclaredLocallyConf extends BasicRuleConfig {
}

export class TablesDeclaredLocally extends ABAPRule {
  private conf = new TablesDeclaredLocallyConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "tables_declared_locally",
      title: "Check for locally declared TABLES",
      shortDescription: `TABLES are always global, so declare them globally`,
      extendedInformation: `https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-us/abaptables.htm`,
      tags: [RuleTag.SingleFile],
      badExample: `FORM foo.
  TABLES t100.
ENDFORM.`,
      goodExample: `TABLES t000.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: TablesDeclaredLocallyConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const structure = file.getStructure();
    if (structure === undefined) {
      return issues;
    }

    const procedures = structure.findAllStructuresMulti([Structures.Form, Structures.FunctionModule]);
    for (const p of procedures) {
      const tablesStatement = p.findFirstStatement(Statements.Tables);
      if (tablesStatement) {
        const message = "Declare TABLES globaly";
        const issue = Issue.atStatement(file, tablesStatement, message, this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }


    return issues;
  }

}