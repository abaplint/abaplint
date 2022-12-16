import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IRegistry} from "../_iregistry";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";

export class ModifyOnlyOwnDBTablesConf extends BasicRuleConfig {
  public reportDynamic: boolean = true;
  /** Case insensitve regex for own tables */
  public ownTables: string = "^[yz]";
}

export class ModifyOnlyOwnDBTables implements IRule {
  private conf = new ModifyOnlyOwnDBTablesConf();
  protected reg: IRegistry;

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

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

// const spaghetti = new SyntaxLogic(this.reg, obj).run().spaghetti;

  public run(obj: IObject): readonly Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const output: Issue[] = [];

    for (const file of obj.getABAPFiles()) {
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

          if (databaseTable.getFirstChild()?.get() instanceof Expressions.Dynamic) {
            if (this.getConfig().reportDynamic === true) {
              output.push(Issue.atStatement(file, s, this.getMetadata().title, this.getMetadata().key, this.getConfig().severity));
            }
            continue;
          }

          const concat = databaseTable.concatTokens().toUpperCase();
          if (regExp.test(concat) === false) {
          // must contain a ReferenceType.TableVoidReference

            output.push(Issue.atStatement(file, s, this.getMetadata().title, this.getMetadata().key, this.getConfig().severity));
          }
        }
      }
    }

    return output;
  }

}
