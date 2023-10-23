import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPObject} from "../objects/_abap_object";
import {Class, Interface, Program} from "../objects";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {InfoClassImplementation, InfoClassDefinition, InfoInterfaceDefinition, InfoMethodDefinition, InfoImplementing} from "../abap/4_file_information/_abap_file_information";
import {IRuleMetadata, RuleTag} from "./_irule";
import {Identifier} from "../abap/4_file_information/_identifier";
import {ABAPFile} from "../abap/abap_file";
import {EditHelper, IEdit} from "../edit_helper";

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

  public getMetadata(): IRuleMetadata {
    return {
      key: "implement_methods",
      title: "Implement methods",
      shortDescription: `Checks for abstract methods and methods from interfaces which need implementing.`,
      extendedInformation: `INCLUDE programs are only checked in connection with their main programs.`,
      tags: [RuleTag.Syntax, RuleTag.Quickfix],
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
    } else if (obj instanceof Program && obj.isInclude() === true) {
      return [];
    }

    this.obj = obj;

    for (const classDefinition of file.getInfo().listClassDefinitions()) {
      const classImplementation = this.lookupImplementationInObject(classDefinition.name, obj);

      ret = ret.concat(this.checkClass(classDefinition, classImplementation));
      ret = ret.concat(this.checkInterfaces(classDefinition, classImplementation));
      ret = ret.concat(this.checkMissingAliases(classDefinition, classImplementation));
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

  private checkClass(def: InfoClassDefinition, impl: InfoClassImplementation | undefined): Issue[] {
    const ret: Issue[] = [];

    for (const md of def.methods) {
      const found = impl?.methods.find(m => m.getName().toUpperCase() === md.name.toUpperCase());

      if (md.isAbstract === true) {
        if (found !== undefined) {
          const issue = Issue.atIdentifier(found, "Do not implement abstract method \"" + md.name + "\"", this.getMetadata().key, this.conf.severity);
          ret.push(issue);
        }
        continue;
      }

      if (impl === undefined) {
        const message = "Class implementation for \"" + def.name + "\" not found";
        const issue = Issue.atIdentifier(def.identifier, message, this.getMetadata().key, this.conf.severity);
        ret.push(issue);
      } else if (found === undefined) {
        const message = "Implement method \"" + md.name + "\"";
        const fix = this.buildFix(impl, md.name);
        const issue = Issue.atIdentifier(impl.identifier, message, this.getMetadata().key, this.conf.severity, fix);
        ret.push(issue);
      }
    }

    return ret;
  }

  private buildFix(impl: InfoClassImplementation, methodName: string): IEdit | undefined {
    const file = this.obj.getABAPFileByName(impl.identifier.getFilename());
    if (file === undefined) {
      return undefined;
    }

    for (const i of file.getStructure()?.findAllStatements(Statements.ClassImplementation) || []) {
      const name = i.findFirstExpression(Expressions.ClassName)?.getFirstToken().getStr().toUpperCase();
      if (name === impl.identifier.getName().toUpperCase()) {
        return EditHelper.insertAt(file, i.getLastToken().getEnd(), `
  METHOD ${methodName.toLowerCase()}.
    RETURN. " todo, implement method
  ENDMETHOD.`);
      }
    }

    return undefined;
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

  private findInterfaceSymbolNames(def: InfoClassDefinition): string[]{
    const findInterface = (i: InfoImplementing)=> {
      const idef = this.findInterfaceByName(i.name);
      return idef ? [idef] : [];
    };
    const interfaceNames = (idef: InfoInterfaceDefinition): string[] => {
      const methods = idef.methods.map(m=>m.name);
      const datas = idef.attributes.map(a=>a.name);
      const constants = idef.constants.map(c=>c.name);
      const aliases = idef.aliases.map(a => a.name);
      const children = idef.interfaces.flatMap(findInterface).flatMap(interfaceNames);
      return [...methods, ...datas, ...constants, ...aliases, ...children];
    };
    return def.interfaces.flatMap(findInterface).flatMap(interfaceNames);
  }

  private checkMissingAliases(def: InfoClassDefinition, impl: InfoClassImplementation | undefined): Issue[] {
    const ret: Issue[] = [];
    if(!def.aliases.length){ return ret;}
    const known = new Set( this.findInterfaceSymbolNames(def).map(n=>n.toUpperCase()));
    const notknown = def.aliases.filter(a => !known.has(a.component.replace(/.*~/, "").toUpperCase()));// already processed elsewhere
    if(!notknown.length){ return ret;}
    const methodnames = new Set(impl?.methods.map(m=>m.getName().toUpperCase()));
    for (const alias of notknown) {
      if(!methodnames.has(alias.component.toUpperCase()) && !methodnames.has(alias.name.toUpperCase())){
        const message = "Implement method \"" + alias.name + "\" from interface \"" + alias.component.replace(/~.*/, "") + "\"";
        if (impl) {
          const fix = this.buildFix(impl, alias.component);
          const issue = Issue.atIdentifier(impl.identifier, message, this.getMetadata().key, this.conf.severity, fix);
          ret.push(issue);
        } else {
          const issue = Issue.atIdentifier(def.identifier, message, this.getMetadata().key, this.conf.severity);
          ret.push(issue);
        }

      }
    }
    return ret;
  }

  private checkInterfaces(def: InfoClassDefinition, impl: InfoClassImplementation | undefined): Issue[] {
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
          if (impl) {
            const fix = this.buildFix(impl, m.objectName + "~" + m.method.name);
            const issue = Issue.atIdentifier(impl.identifier, message, this.getMetadata().key, this.conf.severity, fix);
            ret.push(issue);
          } else {
            const issue = Issue.atIdentifier(def.identifier, message, this.getMetadata().key, this.conf.severity);
            ret.push(issue);
          }
        }
      }
    }

    return ret;
  }

  private isImplemented(m: IMethod, def: InfoClassDefinition, impl: InfoClassImplementation | undefined): boolean {
    if (impl === undefined) {
      return false;
    }

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
      if (a.component.toUpperCase() === m.objectName.toUpperCase() + "~" + m.method.name.toUpperCase()) {
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