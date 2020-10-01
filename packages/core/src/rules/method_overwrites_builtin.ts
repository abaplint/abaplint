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
      shortDescription: `Method name overwrites builtin function`,
      extendedInformation: ``,
      tags: [RuleTag.Styleguide],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: MethodOverwritesBuiltInConf) {
    this.conf = conf;
  }

  private getDescription(): string {
    return `Method name overwrites built-in SAP function name`;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    let methods: InfoMethodDefinition[] = [];
    for (const classDef of file.getInfo().listClassDefinitions()){
      methods = methods.concat(classDef.methods);
    }
    for (const intfDef of file.getInfo().listClassDefinitions()){
      methods = methods.concat(intfDef.methods);
    }

    const builtIn = new BuiltIn();
    for(const method of methods){
      if (builtIn.searchBuiltin(method.name.toUpperCase())){
        issues.push(Issue.atIdentifier(method.identifier, this.getDescription(), this.getMetadata().key));
      }
    }

    return issues;
  }
}