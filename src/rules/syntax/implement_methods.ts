import {Issue} from "../../issue";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {Registry} from "../../registry";
import {BasicRuleConfig} from "../_basic_rule_config";
import {ClassDefinition, ClassImplementation, InterfaceDefinition} from "../../abap/types";
import {ABAPObject} from "../../objects/_abap_object";
import {Interface} from "../../objects";

// todo: abstract methods from superclass parents(might be multiple), if class is not abstract

/** Chekcs for abstract methods which need implementing. */
export class ImplementMethodsConf extends BasicRuleConfig {
}

export class ImplementMethods extends ABAPRule {
  private conf = new ImplementMethodsConf();

  public getKey(): string {
    return "implement_methods";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ImplementMethodsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, reg: Registry, obj: ABAPObject) {
    let ret: Issue[] = [];

    if (file.getStructure() === undefined) {
      return [];
    }

    for (const def of file.getClassDefinitions()) {
      let impl = file.getClassImplementation(def.getName());
      if (impl === undefined) {
        impl = obj.getClassImplementation(def.getName());
      }
      if (impl === undefined) {
        const issue = Issue.atIdentifier(def, "Class implementation for \"" + def.getName() + "\" not found", this.getKey());
        ret.push(issue);
        continue;
      }

      ret = ret.concat(this.checkClass(def, impl));
      ret = ret.concat(this.checkInterfaces(def, impl, file, reg));
    }

    return ret;
  }

  private checkClass(def: ClassDefinition, impl: ClassImplementation): Issue[] {
    const ret: Issue[] = [];

    for (const md of def.getMethodDefinitions().getAll()) {
      const found = impl.getMethodImplementation(md.getName());

      if (md.isAbstract()) {
        if (found !== undefined) {
          const issue = Issue.atIdentifier(found, "Do not implement abstract method \"" + md.getName() + "\"", this.getKey());
          ret.push(issue);
        }
        continue;
      }

      if (found === undefined) {
        const issue = Issue.atIdentifier(impl, "Implement method \"" + md.getName() + "\"", this.getKey());
        ret.push(issue);
      }
    }

    return ret;
  }

  private checkInterfaces(def: ClassDefinition, impl: ClassImplementation, file: ABAPFile, reg: Registry): Issue[] {
    const ret: Issue[] = [];
    let idef: InterfaceDefinition | undefined = undefined;

    for (const interfaceName of def.getImplementing()) {
      const intf = reg.getObject("INTF", interfaceName.name) as Interface | undefined;
      if (intf === undefined) {
        idef = file.getInterfaceDefinition(interfaceName.name);
        if (idef === undefined) {
          const issue = Issue.atIdentifier(def, "Implemented interface \"" + interfaceName.name + "\" not found", this.getKey());
          ret.push(issue);
          continue;
        }
      } else {
        idef = intf.getDefinition();
      }

      if (idef === undefined || interfaceName.partial === true) {
        continue; // ignore parser errors in interface
      }

      for (const method of idef.getMethodDefinitions()) {
        const name = interfaceName.name + "~" + method.getName();
        let found = impl.getMethodImplementation(name);

        if (found === undefined) {
          // try looking for ALIASes
          for (const alias of def.getAliases().getAll()) {
            if (alias.getComponent().toUpperCase() === name.toUpperCase()) {
              found = impl.getMethodImplementation(alias.getName());
              break;
            }
          }
        }

        if (found === undefined) {
          const message = "Implement method \"" + method.getName() + "\" from interface \"" + interfaceName.name + "\"";
          const issue = Issue.atIdentifier(impl, message, this.getKey());
          ret.push(issue);
        }
      }
    }

    return ret;
  }
}