import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPObject} from "../objects/_abap_object";
import {Class, Interface} from "../objects";
import {InfoClassImplementation, InfoClassDefinition, InfoInterfaceDefinition, InfoMethodDefinition} from "../abap/4_file_information/_abap_file_information";
import {RuleTag} from "./_irule";
import {Identifier} from "../abap/4_file_information/_identifier";
import {ABAPFile} from "../abap/abap_file";

// todo: abstract methods from superclass parents(might be multiple), if class is not abstract

export class ImplementMethodsConf extends BasicRuleConfig {
}

interface IMethod {
  objectName: string;
  method: InfoMethodDefinition;
}

export class ImplementMethods extends ABAPRule {
  private conf = new ImplementMethodsConf();
  private obj: ABAPObject;

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

    this.obj = obj;

    for (const classDefinition of file.getInfo().listClassDefinitions()) {
      const classImplementation = this.lookupImplementationInObject(classDefinition.name, obj);

      if (classImplementation === undefined) {
        const message = "Class implementation for \"" + classDefinition.name + "\" not found";
        const issue = Issue.atIdentifier(classDefinition.identifier, message, this.getMetadata().key, this.conf.severity);
        ret.push(issue);
        continue;
      }

      ret = ret.concat(this.checkClass(classDefinition, classImplementation));
      ret = ret.concat(this.checkInterfaces(classDefinition, classImplementation));
    }

    return ret;
  }

/////////////////////////////////

  private lookupImplementationInObject(name: string, obj: ABAPObject) {
    for (const sub of obj.getABAPFiles()) {
      const impl = sub.getInfo().getClassImplementationByName(name);
      if (impl !== undefined) {
        return impl;
      }
    }
    return undefined;
  }

  private lookupDefinitionInObject(name: string) {
    for (const sub of this.obj.getABAPFiles()) {
      const def = sub.getInfo().getClassDefinitionByName(name);
      if (def !== undefined) {
        return def;
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

  private findInterface(identifier: Identifier, name: string): InfoInterfaceDefinition | Issue | undefined {
    const idef = this.findInterfaceByName(name);

    if (idef === undefined) {
      const message = "Implemented interface \"" + name + "\" not found";
      const issue = Issue.atIdentifier(identifier, message, this.getMetadata().key, this.conf.severity);
      return issue;
    }

    return idef;
  }

  private findInterfaceByName(name: string): InfoInterfaceDefinition | undefined {
    let idef: InfoInterfaceDefinition | undefined = undefined;

    const intf = this.reg.getObject("INTF", name) as Interface | undefined;
    if (intf === undefined) {
      // lookup in localfiles
      for (const file of this.obj.getABAPFiles()) {
        const found = file.getInfo().getInterfaceDefinitionByName(name);
        if (found) {
          idef = found;
          break;
        }
      }
    } else {
      idef = intf.getMainABAPFile()?.getInfo().listInterfaceDefinitions()[0];
    }

    return idef;
  }

  /** including implemented super interfaces */
  private findInterfaceMethods(idef: InfoInterfaceDefinition): IMethod[] {
    const methods = idef.methods.map((m) => {
      return {objectName: idef.name, method: m};
    });
    for (const i of idef.interfaces) {
      const sup = this.findInterface(idef.identifier, i.name);
      if (sup !== undefined && !(sup instanceof Issue)) {
        sup.methods.forEach(m => {
          methods.push({objectName: sup.name, method: m});
        });
      }
    }
    return methods;
  }

  private findClass(name: string): {def: InfoClassDefinition, impl: InfoClassImplementation} | undefined {
    let def = this.lookupDefinitionInObject(name);
    let impl = this.lookupImplementationInObject(name, this.obj);
    if (def && impl) {
      return {def, impl};
    }

    const global = this.reg.getObject("CLAS", name) as Class | undefined;
    if (global) {
      def = global.getClassDefinition();
      impl = this.lookupImplementationInObject(name, global);
      if (def && impl) {
        return {def, impl};
      }
    }

    return undefined;
  }

  private checkInterfaces(def: InfoClassDefinition, impl: InfoClassImplementation): Issue[] {
    const ret: Issue[] = [];

    for (const interfaceInfo of def.interfaces) {
      const idef = this.findInterface(def.identifier, interfaceInfo.name);

      if (idef === undefined || interfaceInfo.partial === true || interfaceInfo.allAbstract === true) {
        continue; // ignore parser errors in interface
      } else if (idef instanceof Issue) {
        return [idef];
      }

      for (const m of this.findInterfaceMethods(idef)) {
        if (interfaceInfo.abstractMethods.includes(m.method.name.toUpperCase())) {
          continue;
        }

        if (this.isImplemented(m, def, impl) === false) {
          const message = "Implement method \"" + m.method.name + "\" from interface \"" + m.objectName + "\"";
          const issue = Issue.atIdentifier(impl.identifier, message, this.getMetadata().key, this.conf.severity);
          ret.push(issue);
        }
      }
    }

    return ret;
  }

  private isImplemented(m: IMethod, def: InfoClassDefinition, impl: InfoClassImplementation): boolean {
    const name = m.objectName + "~" + m.method.name;
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

    if (found === undefined && def.superClassName !== undefined) {
      const clas = this.findClass(def.superClassName);
      if (clas) {
        return this.isImplemented(m, clas?.def, clas?.impl);
      }
    }

    if (found === undefined) {
      for (const i of def.interfaces) {
        const idef = this.findInterfaceByName(i.name);
        if (idef === undefined) {
          continue;
        }
        const ali = this.viaAliasInInterface(m, idef, impl);
        if (ali) {
          return ali;
        }
      }
    }

    return found !== undefined;
  }

  private viaAliasInInterface(m: IMethod, intf: InfoInterfaceDefinition, impl: InfoClassImplementation): boolean {
    for (const a of intf.aliases) {
      if (a.component === m.objectName + "~" + m.method.name) {
        const name = intf.name + "~" + a.name;
        const found = impl.methods.find(m => m.getName().toUpperCase() === name.toUpperCase());
        if (found) {
          return true;
        }
      }
    }

    return false;
  }

}