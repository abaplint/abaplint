import {ABAPFile, Issue} from "..";
import {InfoMethodDefinition} from "../abap/4_file_information/_abap_file_information";
import {BuiltIn} from "../abap/5_syntax/_builtin";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";

export class MethodOverwritesBuiltInConf extends BasicRuleConfig {
}

export class MethodOverwritesBuiltIn extends ABAPRule {

  private conf = new MethodOverwritesBuiltInConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "method_overwrites_builtin",
      title: "Method name overwrites builtin function",
      shortDescription: `Checks Method names that overwrite builtin SAP functions`,
      extendedInformation: `https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-us/abenbuilt_in_functions_overview.htm

https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#avoid-obscuring-built-in-functions

Interface method names are ignored`,
      tags: [RuleTag.Naming, RuleTag.SingleFile, RuleTag.Styleguide],
      badExample: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS matches.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD matches.
  ENDMETHOD.
ENDCLASS.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: MethodOverwritesBuiltInConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    let methods: InfoMethodDefinition[] = [];

    for (const classDef of file.getInfo().listClassDefinitions()) {
      methods = methods.concat(classDef.methods);
    }

    const builtIn = new BuiltIn();
    for (const method of methods) {
      if (builtIn.searchBuiltin(method.name.toUpperCase())) {
        const message = `Method name "${method.name}" overwrites built-in SAP function name`;
        issues.push(Issue.atIdentifier(method.identifier, message, this.getMetadata().key));
      }
    }

    return issues;
  }
}