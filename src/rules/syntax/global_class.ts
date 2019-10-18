import {Issue} from "../../issue";
import {ABAPRule} from "./../_abap_rule";
import {ABAPFile} from "../../files";
import {Registry} from "../../registry";
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

  public runParsed(file: ABAPFile, _reg: Registry, obj: IObject) {
    const output: Issue[] = [];

    for (const definition of file.getClassDefinitions()) {
      if (definition.isLocal() && obj instanceof Objects.Class && file.getFilename().match(/\.clas\.abap$/)) {
        const issue = new Issue({file, message: "Global classes must be global", key: this.getKey(), start: definition.getStart()});
        output.push(issue);
      }

      if (definition.isGlobal() && obj instanceof Objects.Class && definition.getName().toUpperCase() !== obj.getName().toUpperCase()) {
        const issue = new Issue({file, message: "Class name must match filename", key: this.getKey(), start: definition.getStart()});
        output.push(issue);
      }

      if (definition.isGlobal() && !(obj instanceof Objects.Class)) {
        const issue = new Issue({file, message: "Class must be local", key: this.getKey(), start: definition.getStart()});
        output.push(issue);
      }
    }

    for (const impl of file.getClassImplementations()) {
      if (file.getFilename().match(/\.clas\.abap$/)
          && obj instanceof Objects.Class
          && impl.getName().toUpperCase() !== obj.getName().toUpperCase()) {
        const issue = new Issue({file, message: "Class name must match filename", key: this.getKey(), start: impl.getStart()});
        output.push(issue);
      }
    }


    return output;
  }
}