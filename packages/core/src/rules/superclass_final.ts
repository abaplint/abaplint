import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {IObject} from "../objects/_iobject";
import * as Objects from "../objects";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Class} from "../objects";
import {InfoClassDefinition} from "../abap/4_file_information/_abap_file_information";
import {RuleTag} from "./_irule";

export class SuperclassFinalConf extends BasicRuleConfig {
}

export class SuperclassFinal extends ABAPRule {
  private conf = new SuperclassFinalConf();

  public getMetadata() {
    return {
      key: "superclass_final",
      title: "Super class final",
      shortDescription: `Checks that classes which are inherited from are not declared as FINAL.`,
      tags: [RuleTag.Syntax],
    };
  }

  private getMessage(): string {
    return "Superclasses cannot be FINAL";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SuperclassFinalConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: IObject) {
    const output: Issue[] = [];

    for (const definition of file.getInfo().listClassDefinitions()) {
      const sup = definition.superClassName;
      if (sup === undefined) {
        continue;
      }
      let localLookup = true;
      if (obj instanceof Objects.Class && file.getFilename().match(/\.clas\.abap$/)) {
        localLookup = false;
      }
      let found: InfoClassDefinition | undefined = undefined;
      if (localLookup) {
// todo, this should look inside the object instead of the file?
        found = file.getInfo().getClassDefinitionByName(sup);
      }
      if (found === undefined) {
        const clas = this.reg.getObject("CLAS", sup) as Class;
        if (clas) {
          found = clas.getClassDefinition();
        }
      }
      if (found === undefined) {
        const message = "Super class \"" + sup + "\" not found";
        const issue = Issue.atIdentifier(definition.identifier, message, this.getMetadata().key, this.conf.severity);
        output.push(issue);
        continue;
      }
      if (found.isFinal === true) {
        const issue = Issue.atIdentifier(definition.identifier, this.getMessage(), this.getMetadata().key, this.conf.severity);
        output.push(issue);
      }
    }

    return output;
  }
}