import {Issue} from "../../issue";
import {ABAPRule} from "./../_abap_rule";
import {ABAPFile} from "../../files";
import {IRegistry} from "../../_iregistry";
import {IObject} from "../../objects/_iobject";
import * as Objects from "../../objects";
import {BasicRuleConfig} from "../_basic_rule_config";

/** Checks related to names of global classes. For the name pattern, see rule object_naming */
export class GlobalClassConf extends BasicRuleConfig {
}

export class GlobalClass extends ABAPRule {
  private conf = new GlobalClassConf();

  public getKey(): string {
    return "global_class";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: GlobalClassConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _reg: IRegistry, obj: IObject) {
    const output: Issue[] = [];

    for (const definition of file.getInfo().getClassDefinitions()) {
      if (definition.isLocal() && obj instanceof Objects.Class && file.getFilename().match(/\.clas\.abap$/)) {
        const issue = Issue.atIdentifier(definition, "Global classes must be global", this.getKey());
        output.push(issue);
      }

      if (definition.isGlobal() && obj instanceof Objects.Class && definition.getName().toUpperCase() !== obj.getName().toUpperCase()) {
        const issue = Issue.atIdentifier(definition, "Class name must match filename", this.getKey());
        output.push(issue);
      }

      if (definition.isGlobal() && !(obj instanceof Objects.Class)) {
        const issue = Issue.atIdentifier(definition, "Class must be local", this.getKey());
        output.push(issue);
      }
    }

    for (const impl of file.getInfo().getClassImplementations()) {
      if (file.getFilename().match(/\.clas\.abap$/)
          && obj instanceof Objects.Class
          && impl.getName().toUpperCase() !== obj.getName().toUpperCase()) {
        const issue = Issue.atIdentifier(impl, "Class name must match filename", this.getKey());
        output.push(issue);
      }
    }


    return output;
  }
}