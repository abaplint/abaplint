import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class MethodImplementedTwiceConf extends BasicRuleConfig {
}

export class MethodImplementedTwice extends ABAPRule {

  private conf = new MethodImplementedTwiceConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "method_implemented_twice",
      title: "Method implemented twice",
      shortDescription: `Reports an error if a method is implemented or defined twice`,
      tags: [RuleTag.SingleFile, RuleTag.Syntax],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: MethodImplementedTwiceConf): void {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const classDef of file.getInfo().listClassImplementations()) {
      const names: {[index: string]: boolean} = {};
      for (const m of classDef.methods) {
        const name = m.getName().toUpperCase();
        if (names[name] === undefined) {
          names[name] = true;
        } else {
          const message = `Method ${name} implemented twice`;
          issues.push(Issue.atToken(file, m.getToken(), message, this.getMetadata().key, this.getConfig().severity));
        }
      }
    }

    for (const classDef of file.getInfo().listClassDefinitions()) {
      const names: {[index: string]: boolean} = {};
      for (const m of classDef.methods) {
        const name = m.name.toUpperCase();
        if (names[name] === undefined) {
          names[name] = true;
        } else {
          const message = `Method ${name} defined twice`;
          issues.push(Issue.atToken(file, m.identifier.getToken(), message, this.getMetadata().key, this.getConfig().severity));
        }
      }
    }

    for (const iDef of file.getInfo().listInterfaceDefinitions()) {
      const names: {[index: string]: boolean} = {};
      for (const m of iDef.methods) {
        const name = m.name.toUpperCase();
        if (names[name] === undefined) {
          names[name] = true;
        } else {
          const message = `Method ${name} implemented twice`;
          issues.push(Issue.atIdentifier(m.identifier, message, this.getMetadata().key, this.getConfig().severity));
        }
      }
    }

    return issues;
  }

}