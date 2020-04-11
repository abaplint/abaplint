import {Issue} from "../../issue";
import {ABAPRule} from "./../_abap_rule";
import {ABAPFile} from "../../files";
import {IRegistry} from "../../_iregistry";
import {IObject} from "../../objects/_iobject";
import * as Objects from "../../objects";
import {BasicRuleConfig} from "../_basic_rule_config";
import {IClassDefinition} from "../../abap/types/_class_definition";
import {Class} from "../../objects";

/** Checks that classes which are inherited from are not declared as FINAL. */
export class SuperclassFinalConf extends BasicRuleConfig {
}

export class SuperclassFinal extends ABAPRule {
  private conf = new SuperclassFinalConf();

  public getKey(): string {
    return "superclass_final";
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

  public runParsed(file: ABAPFile, reg: IRegistry, obj: IObject) {
    const output: Issue[] = [];

    for (const definition of file.getInfo().getClassDefinitions()) {
      const sup = definition.getSuperClass();
      if (sup === undefined) {
        continue;
      }
      let localLookup = true;
      if (obj instanceof Objects.Class && file.getFilename().match(/\.clas\.abap$/)) {
        localLookup = false;
      }
      let found: IClassDefinition | undefined = undefined;
      if (localLookup) {
// todo, this should look inside the object instead of the file?
        found = file.getInfo().getClassDefinition(sup);
      }
      if (found === undefined) {
        const clas = reg.getObject("CLAS", sup) as Class;
        if (clas) {
          found = clas.getClassDefinition();
        }
      }
      if (found === undefined) {
        const message = "Super class \"" + sup + "\" not found";
        const issue = Issue.atIdentifier(definition, message, this.getKey());
        output.push(issue);
        continue;
      }
      if (found.isFinal()) {
        const issue = Issue.atIdentifier(definition, this.getMessage(), this.getKey());
        output.push(issue);
      }
    }

    return output;
  }
}