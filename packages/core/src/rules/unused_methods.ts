import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {IRule, IRuleMetadata} from "./_irule";
import {IObject} from "../objects/_iobject";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ABAPObject} from "../objects/_abap_object";
import {ScopeType} from "../abap/5_syntax/_scope_type";
import {Class, Interface, Program} from "../objects";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {Identifier} from "../abap/4_file_information/_identifier";
import {ReferenceType} from "../abap/5_syntax/_reference";
import {Visibility} from "../abap/4_file_information/visibility";
import {InfoMethodDefinition} from "../abap/4_file_information/_abap_file_information";

export class UnusedMethodsConf extends BasicRuleConfig {
}

class WorkArea {
  private readonly list: InfoMethodDefinition[] = [];

  public constructor() {
    this.list = [];
  }

  public push(id: InfoMethodDefinition) {
    this.list.push(id);
  }

  public removeIfExists(id: Identifier) {
    for (let i = 0; i < this.list.length; i++) {
      if (id.equals(this.list[i].identifier)) {
        this.list.splice(i, 1);
        return;
      }
    }
  }

  public containsProteted(): boolean {
    for (const m of this.list) {
      if (m.visibility === Visibility.Protected) {
        return true;
      }
    }
    return false;
  }

  public getLength(): number {
    return this.list.length;
  }

  public get(): readonly InfoMethodDefinition[] {
    return this.list;
  }
}

// todo: add possibility to also search public methods
// todo: for protected methods, also search subclasses
export class UnusedMethods implements IRule {
  private conf = new UnusedMethodsConf();
  private reg: IRegistry;
  private wa: WorkArea;

  public getMetadata(): IRuleMetadata {
    return {
      key: "unused_methods",
      title: "Unused methods",
      shortDescription: `Checks for unused methods`,
      extendedInformation: `Checks private and protected methods.

Skips:
* methods FOR TESTING
* methods SETUP + TEARDOWN + CLASS_SETUP + CLASS_TEARDOWN in testclasses
* class_constructor + constructor methods
* event handlers
* methods that are redefined
* INCLUDEs
`,
      tags: [],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UnusedMethodsConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    } else if (obj instanceof Interface) { // todo, how to handle interfaces?
      return [];
    } else if (obj instanceof Program && obj.isInclude() === true) {
      return [];
    }

    // dont report anything when there are syntax errors
    const syntax = new SyntaxLogic(this.reg, obj).run();
    if (syntax.issues.length > 0) {
      return [];
    }

    this.wa = new WorkArea();

    for (const file of obj.getABAPFiles()) {
      for (const def of file.getInfo().listClassDefinitions()) {
        for (const method of def.methods) {
          if (method.isForTesting === true
              || method.isRedefinition === true
              || method.isEventHandler === true) {
            continue;
          } else if (def.isForTesting === true
              && (method.name.toUpperCase() === "SETUP"
              || method.name.toUpperCase() === "CLASS_SETUP"
              || method.name.toUpperCase() === "TEARDOWN"
              || method.name.toUpperCase() === "CLASS_TEARDOWN")) {
            continue;
          } else if (method.name.toUpperCase() === "CONSTRUCTOR"
              || method.name.toUpperCase() === "CLASS_CONSTRUCTOR") {
            continue;
          }

          if (method.visibility === Visibility.Private
              || method.visibility === Visibility.Protected) {
            this.wa.push(method);
          }
        }
      }
    }

    this.traverse(syntax.spaghetti.getTop());

    this.searchGlobalSubclasses(obj);

    const issues: Issue[] = [];
    for (const i of this.wa.get()) {
      const message = "Method \"" + i.identifier.getName() + "\" not used";
      issues.push(Issue.atIdentifier(i.identifier, message, this.getMetadata().key, this.conf.severity));
    }

    return issues;
  }

  private searchGlobalSubclasses(obj: ABAPObject) {
    if (this.wa.getLength() === 0
        || !(obj instanceof Class)
        || this.wa.containsProteted() === false) {
      return;
    }

    const sup = obj.getDefinition();
    if (sup === undefined) {
      return;
    }

    for (const r of this.reg.getObjects()) {
      if (r instanceof Class
          && r.getDefinition()?.getSuperClass()?.toUpperCase() === sup.getName().toUpperCase()) {
        const syntax = new SyntaxLogic(this.reg, r).run();
        this.traverse(syntax.spaghetti.getTop());
        // recurse to sub-sub-* classes
        this.searchGlobalSubclasses(r);
      }
    }

  }

  private traverse(node: ISpaghettiScopeNode) {
    if (node.getIdentifier().stype !== ScopeType.BuiltIn) {
      this.checkNode(node);
    }

    for (const c of node.getChildren()) {
      this.traverse(c);
    }
  }

  private checkNode(node: ISpaghettiScopeNode) {
    for (const v of node.getData().references) {
      if (v.referenceType === ReferenceType.MethodReference && v.resolved) {
        this.wa.removeIfExists(v.resolved);
      }
    }
  }

}