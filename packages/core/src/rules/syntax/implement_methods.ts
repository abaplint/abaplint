import {Issue} from "../../issue";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {IRegistry} from "../../_iregistry";
import {BasicRuleConfig} from "../_basic_rule_config";
import {ABAPObject} from "../../objects/_abap_object";
import {Interface} from "../../objects";
import {IClassDefinition} from "../../abap/types/_class_definition";
import {IInterfaceDefinition} from "../../abap/types/_interface_definition";
import {InfoClassImplementation} from "../../abap/4_object_information/_abap_file_information";

// todo: abstract methods from superclass parents(might be multiple), if class is not abstract

export class ImplementMethodsConf extends BasicRuleConfig {
}

export class ImplementMethods extends ABAPRule {
  private conf = new ImplementMethodsConf();

  public getMetadata() {
    return {
      key: "implement_methods",
      title: "Implement methods",
      quickfix: false,
      shortDescription: `Chekcs for abstract methods which need implementing.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ImplementMethodsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, reg: IRegistry, obj: ABAPObject) {
    let ret: Issue[] = [];

    if (file.getStructure() === undefined) {
      return [];
    }

    for (const def of file.getInfo().getClassDefinitions()) {
      let impl = file.getInfo().getClassImplementationByName(def.getName());

      if (impl === undefined) {
        impl = this.lookupInObject(def.getName(), obj);
      }

      if (impl === undefined) {
        const issue = Issue.atIdentifier(def, "Class implementation for \"" + def.getName() + "\" not found", this.getMetadata().key);
        ret.push(issue);
        continue;
      }

      ret = ret.concat(this.checkClass(def, impl));
      ret = ret.concat(this.checkInterfaces(def, impl, file, reg));
    }

    return ret;
  }

  private lookupInObject(name: string, obj: ABAPObject) {
    for (const sub of obj.getABAPFiles()) {
      const impl = sub.getInfo().getClassImplementationByName(name);
      if (impl !== undefined) {
        return impl;
      }
    }
    return undefined;
  }

  private checkClass(def: IClassDefinition, impl: InfoClassImplementation): Issue[] {
    const ret: Issue[] = [];

    for (const md of def.getMethodDefinitions().getAll()) {
      const found = impl.methods.find(m => m.getName().toUpperCase() === md.getName().toUpperCase());

      if (md.isAbstract()) {
        if (found !== undefined) {
          const issue = Issue.atIdentifier(found, "Do not implement abstract method \"" + md.getName() + "\"", this.getMetadata().key);
          ret.push(issue);
        }
        continue;
      }

      if (found === undefined) {
        const issue = Issue.atIdentifier(impl.name, "Implement method \"" + md.getName() + "\"", this.getMetadata().key);
        ret.push(issue);
      }
    }

    return ret;
  }

  private checkInterfaces(def: IClassDefinition, impl: InfoClassImplementation, file: ABAPFile, reg: IRegistry): Issue[] {
    const ret: Issue[] = [];
    let idef: IInterfaceDefinition | undefined = undefined;

    for (const interfaceName of def.getImplementing()) {
      const intf = reg.getObject("INTF", interfaceName.name) as Interface | undefined;
      if (intf === undefined) {
        idef = file.getInfo().getInterfaceDefinition(interfaceName.name);
        if (idef === undefined) {
          const issue = Issue.atIdentifier(def, "Implemented interface \"" + interfaceName.name + "\" not found", this.getMetadata().key);
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
        let found = impl.methods.find(m => m.getName().toUpperCase() === name.toUpperCase());

        if (found === undefined) {
          // try looking for ALIASes
          for (const alias of def.getAliases().getAll()) {
            if (alias.getComponent().toUpperCase() === name.toUpperCase()) {
              found = impl.methods.find(m => m.getName().toUpperCase() === alias.getName().toUpperCase());
              break;
            }
          }
        }

        if (found === undefined) {
          const message = "Implement method \"" + method.getName() + "\" from interface \"" + interfaceName.name + "\"";
          const issue = Issue.atIdentifier(impl.name, message, this.getMetadata().key);
          ret.push(issue);
        }
      }
    }

    return ret;
  }
}