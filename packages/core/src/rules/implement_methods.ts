import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPObject} from "../objects/_abap_object";
import {Interface} from "../objects";
import {InfoClassImplementation, InfoClassDefinition, InfoInterfaceDefinition} from "../abap/4_file_information/_abap_file_information";
import {RuleTag} from "./_irule";

// todo: abstract methods from superclass parents(might be multiple), if class is not abstract

export class ImplementMethodsConf extends BasicRuleConfig {
}

export class ImplementMethods extends ABAPRule {
  private conf = new ImplementMethodsConf();

  public getMetadata() {
    return {
      key: "implement_methods",
      title: "Implement methods",
      shortDescription: `Checks for abstract methods and methods from interfaces which need implementing.`,
      tags: [RuleTag.Syntax],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ImplementMethodsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject) {
    let ret: Issue[] = [];

    if (file.getStructure() === undefined) {
      return [];
    }

    for (const classDefinition of file.getInfo().listClassDefinitions()) {
      let classImplementation = file.getInfo().getClassImplementationByName(classDefinition.name);

      if (classImplementation === undefined) {
        classImplementation = this.lookupInObject(classDefinition.name, obj);
      }

      if (classImplementation === undefined) {
        const message = "Class implementation for \"" + classDefinition.name + "\" not found";
        const issue = Issue.atIdentifier(classDefinition.identifier, message, this.getMetadata().key, this.conf.severity);
        ret.push(issue);
        continue;
      }

      ret = ret.concat(this.checkClass(classDefinition, classImplementation));
      ret = ret.concat(this.checkInterfaces(classDefinition, classImplementation, obj));
    }

    return ret;
  }

/////////////////////////////////

  private lookupInObject(name: string, obj: ABAPObject) {
    for (const sub of obj.getABAPFiles()) {
      const impl = sub.getInfo().getClassImplementationByName(name);
      if (impl !== undefined) {
        return impl;
      }
    }
    return undefined;
  }

  private checkClass(def: InfoClassDefinition, impl: InfoClassImplementation): Issue[] {
    const ret: Issue[] = [];

    for (const md of def.methods) {
      const found = impl.methods.find(m => m.getName().toUpperCase() === md.name.toUpperCase());

      if (md.isAbstract) {
        if (found !== undefined) {
          const issue = Issue.atIdentifier(found, "Do not implement abstract method \"" + md.name + "\"", this.getMetadata().key, this.conf.severity);
          ret.push(issue);
        }
        continue;
      }

      if (found === undefined) {
        const message = "Implement method \"" + md.name + "\"";
        const issue = Issue.atIdentifier(impl.identifier, message, this.getMetadata().key, this.conf.severity);
        ret.push(issue);
      }
    }

    return ret;
  }

  private checkInterfaces(def: InfoClassDefinition, impl: InfoClassImplementation, obj: ABAPObject): Issue[] {
    const ret: Issue[] = [];
    let idef: InfoInterfaceDefinition | undefined = undefined;

    for (const interfaceInfo of def.interfaces) {
      const intf = this.reg.getObject("INTF", interfaceInfo.name) as Interface | undefined;
      if (intf === undefined) {
        // lookup in localfiles
        for (const file of obj.getABAPFiles()) {
          const found = file.getInfo().getInterfaceDefinitionByName(interfaceInfo.name);
          if (found) {
            idef = found;
            break;
          }
        }
        if (idef === undefined) {
          const message = "Implemented interface \"" + interfaceInfo.name + "\" not found";
          const issue = Issue.atIdentifier(def.identifier, message, this.getMetadata().key, this.conf.severity);
          ret.push(issue);
          continue;
        }
      } else {
        idef = intf.getMainABAPFile()?.getInfo().listInterfaceDefinitions()[0];
      }

      if (idef === undefined || interfaceInfo.partial === true) {
        continue; // ignore parser errors in interface
      }

      for (const method of idef.methods) {
        if (interfaceInfo.abstractMethods.includes(method.name.toUpperCase())) {
          continue;
        }

        const name = interfaceInfo.name + "~" + method.name;
        let found = impl.methods.find(m => m.getName().toUpperCase() === name.toUpperCase());

        if (found === undefined) {
          // try looking for ALIASes
          for (const alias of def.aliases) {
            if (alias.component.toUpperCase() === name.toUpperCase()) {
              found = impl.methods.find(m => m.getName().toUpperCase() === alias.name.toUpperCase());
              break;
            }
          }
        }

        if (found === undefined) {
          const message = "Implement method \"" + method.name + "\" from interface \"" + interfaceInfo.name + "\"";
          const issue = Issue.atIdentifier(impl.identifier, message, this.getMetadata().key, this.conf.severity);
          ret.push(issue);
        }
      }
    }

    return ret;
  }
}