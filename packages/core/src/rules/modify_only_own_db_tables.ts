import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class ModifyOnlyOwnDBTablesConf extends BasicRuleConfig {
  public reportDynamic: boolean = true;
  /** Case insensitve regex for own tables */
  public ownTables: string = "^[yz]";
}

export class ModifyOnlyOwnDBTables extends ABAPRule {
  private conf = new ModifyOnlyOwnDBTablesConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "modify_only_own_db_tables",
      title: "Modify only own DB tables",
      shortDescription: `Modify only own DB tables`,
      extendedInformation: "https://docs.abapopenchecks.org/checks/26/",
      tags: [RuleTag.Security, RuleTag.SingleFile],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ModifyOnlyOwnDBTablesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const output: Issue[] = [];

    const struc = file.getStructure();
    if (struc === undefined) {
      return [];
    }

    const regExp = new RegExp(this.getConfig().ownTables, "i");

    for (const s of file.getStatements()) {
      const g = s.get();
      if (g instanceof Statements.DeleteDatabase
          || g instanceof Statements.UpdateDatabase
          || g instanceof Statements.InsertDatabase
          || g instanceof Statements.ModifyDatabase) {
        const databaseTable = s.findFirstExpression(Expressions.DatabaseTable);
        if (databaseTable === undefined) {
          continue;
        }

        if (s.get() instanceof Expressions.Dynamic) {
          if (this.getConfig().reportDynamic === true) {
            output.push(Issue.atStatement(file, s, this.getMetadata().title, this.getMetadata().key, this.getConfig().severity));
          }
          continue;
        }

        const concat = databaseTable.concatTokens().toUpperCase();
        if (regExp.test(concat) === false && concat !== "SCREEN") {
          output.push(Issue.atStatement(file, s, this.getMetadata().title, this.getMetadata().key, this.getConfig().severity));
        }
      }
    }

    return output;
  }

}
