import {Issue} from "../../issue";
import {ABAPRule} from "./../_abap_rule";
import {ABAPFile} from "../../files";
import {Registry} from "../../registry";
import {IObject} from "../../objects/_iobject";
import * as Objects from "../../objects";
import {BasicRuleConfig} from "../_basic_rule_config";
import {ClassDefinition} from "../../abap/types";
import {Class} from "../../objects";

/** Checks that classes which are inherited from are not declared as FINAL. */
export class SuperclassFinalConf extends BasicRuleConfig {
}

export class SuperclassFinal extends ABAPRule {
  private conf = new SuperclassFinalConf();

  public getKey(): string {
    return "superclass_final";
  }

  private getDescription(): string {
    return "Superclasses cannot be FINAL";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SuperclassFinalConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, reg: Registry, obj: IObject) {
    const output: Issue[] = [];

    for (const definition of file.getClassDefinitions()) {
      const sup = definition.getSuperClass();
      if (sup === undefined) {
        continue;
      }
      let localLookup = true;
      if (obj instanceof Objects.Class && file.getFilename().match(/\.clas\.abap$/)) {
        localLookup = false;
      }
      let found: ClassDefinition | undefined = undefined;
      if (localLookup) {
// todo, this should look inside the object instead of the file?
        found = file.getClassDefinition(sup);
      }
      if (found === undefined) {
        const clas = reg.getObject("CLAS", sup) as Class;
        if (clas) {
          found = clas.getClassDefinition();
        }
      }
      if (found === undefined) {
        const message = "Super class \"" + sup + "\" not found";
        const issue = new Issue({file, message, key: this.getKey(), start: definition.getStart()});
        output.push(issue);
        continue;
      }
      if (found.isFinal()) {
        const issue = new Issue({file, message: this.getDescription(), key: this.getKey(), start: definition.getStart()});
        output.push(issue);
      }
    }

    return output;
  }
}