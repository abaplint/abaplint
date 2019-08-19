import {Issue} from "../../issue";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {Registry} from "../../registry";
import {BasicRuleConfig} from "../_basic_rule_config";
import {ClassDefinition, ClassImplementation} from "../../abap/types";
import {ABAPObject} from "../../objects/_abap_object";
import {Class} from "../../objects";

export class ImplementMethodsConf extends BasicRuleConfig {
}

export class ImplementMethods extends ABAPRule {
  private conf = new ImplementMethodsConf();

  public getKey(): string {
    return "implement_methods";
  }

  public getDescription(): string {
    return "Implement methods";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ImplementMethodsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _reg: Registry, obj: ABAPObject) {
    let ret: Issue[] = [];

    if (file.getStructure() === undefined) {
      return [];
    }

    for (const def of file.getClassDefinitions()) {
      let impl = file.getClassImplementation(def.getName());
      if (impl === undefined && obj instanceof Class && obj.getLocalsImpFile()) {
        impl = obj.getLocalsImpFile()!.getClassImplementation(def.getName());
      }
      if (impl === undefined) {
        ret.push(new Issue({file,
          message: "Class implementation for \"" + def.getName() + "\" not found",
          key: this.getKey(),
          start: def.getStart()}));
        continue;
      }

      ret = ret.concat(this.checkClass(def, impl, file));
    }

    return ret;
  }

  public checkClass(def: ClassDefinition, impl: ClassImplementation, file: ABAPFile): Issue[] {
    const ret: Issue[] = [];

    for (const md of def.getMethodDefinitions().getAll()) {
      const found = impl.getMethodImplementation(md.getName());

      if (md.isAbstract()) {
        if (found !== undefined) {
          ret.push(new Issue({file,
            message: "Do not implement abstract method \"" + md.getName() + "\"",
            key: this.getKey(),
            start: found.getStart()}));
        }
        continue;
      }

      if (found === undefined) {
        ret.push(new Issue({file,
          message: "Implement method \"" + md.getName() + "\"",
          key: this.getKey(),
          start: impl.getStart()}));
      }
    }

    return ret;
  }
}