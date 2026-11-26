import {Issue} from "../issue";
import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class DefinitionsInModuleConf extends BasicRuleConfig {
}

export class DefinitionsInModule extends ABAPRule {

  private conf = new DefinitionsInModuleConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "definitions_in_module",
      title: "Definitions inside MODULE",
      shortDescription: `Checks that DATA, TYPES and CONSTANTS are not defined inside MODULE ... ENDMODULE, the definitions are global to the program`,
      extendedInformation: `Definitions inside MODULE blocks are part of the global program scope, not local to the module.`,
      tags: [RuleTag.SingleFile],
      badExample: `MODULE init_2000 OUTPUT.
  DATA: lt_field_cat TYPE lvc_t_fcat.
ENDMODULE.`,
      goodExample: `DATA: lt_field_cat TYPE lvc_t_fcat.

MODULE init_2000 OUTPUT.
  WRITE 'hello'.
ENDMODULE.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: DefinitionsInModuleConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return [];
    }

    const definitions = [Statements.Data, Statements.Type, Statements.Constant];
    for (const mod of stru.findAllStructures(Structures.Module)) {
      for (const statement of mod.findAllStatementNodes()) {
        if (definitions.some(d => statement.get() instanceof d)) {
          issues.push(Issue.atStatement(file, statement, "Definitions inside MODULE are global, move them outside the module", this.getMetadata().key, this.getConfig().severity));
        }
      }
    }

    return issues;
  }

}
