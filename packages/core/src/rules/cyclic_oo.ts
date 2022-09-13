import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {Class, Interface} from "../objects";
import {IRule, IRuleMetadata} from "./_irule";
import {IObject} from "../objects/_iobject";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {ReferenceType} from "../abap/5_syntax/_reference";
import {BuiltIn} from "../abap/5_syntax/_builtin";
import {ABAPObject} from "../objects/_abap_object";

export class CyclicOOConf extends BasicRuleConfig {
  /** List of object names to skip, must be full upper case name
   * @uniqueItems true
  */
  public skip: string[] = [];
  /** Skips shared memory enabled classes*/
  public skipSharedMemory: boolean = true;
}

export class CyclicOO implements IRule {
  private conf = new CyclicOOConf();
  private reg: IRegistry;
  private edges: { [from: string]: string[] } = {};

  public getMetadata(): IRuleMetadata {
    return {
      key: "cyclic_oo",
      title: "Cyclic OO",
      shortDescription: `Finds cyclic OO references`,
      extendedInformation: `Runs for global INTF + CLAS objects

Objects must be without syntax errors for this rule to take effect`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CyclicOOConf) {
    this.conf = conf;
    if (this.conf.skip === undefined) {
      this.conf.skip = [];
    }
  }

  public initialize(reg: IRegistry): IRule {
    this.reg = reg;
    this.edges = {};
    for (const obj of this.reg.getObjectsByType("CLAS")) {
      if (this.reg.isDependency(obj)) {
        continue;
      }
      const name = obj.getName().toUpperCase();
      if (!(obj instanceof Class)) {
        continue;
      } else if (this.conf.skip.indexOf(name) >= 0) {
        continue;
      } else if (this.conf.skipSharedMemory === true && obj.getClassDefinition()?.isSharedMemory === true) {
        continue;
      }
      const run = new SyntaxLogic(this.reg, obj).run();
      if (run.issues.length > 0) {
        continue;
      }
      this.buildEdges(name, run.spaghetti.getTop());
    }
    for (const obj of this.reg.getObjectsByType("INTF")) {
      if (this.reg.isDependency(obj)) {
        continue;
      }
      const name = obj.getName().toUpperCase();
      if (!(obj instanceof ABAPObject)) {
        continue;
      } else if (this.conf.skip.indexOf(name) >= 0) {
        continue;
      }
      const run = new SyntaxLogic(this.reg, obj).run();
      if (run.issues.length > 0) {
        continue;
      }
      this.buildEdges(name, run.spaghetti.getTop());
    }
    return this;
  }

  public run(obj: IObject): readonly Issue[] {
    if (!(obj instanceof Interface) && !(obj instanceof Class)) {
      return [];
    }

    const id = obj.getIdentifier();
    if (id === undefined) {
      return [];
    }

    const previous: { [key: string]: boolean } = {};
    previous[obj.getName()] = true;
    const path = this.findCycle(obj.getName(), obj.getName(), previous);
    if (path) {
      const message = "Cyclic definition/usage: " + path;
      return [Issue.atIdentifier(id, message, this.getMetadata().key, this.conf.severity)];
    }

    return [];
  }

/////////////////////////////

  private findCycle(source: string, current: string, previous: { [key: string]: boolean }): string | undefined {
    if (this.edges[current] === undefined) {
      return undefined;
    }

    for (const e of this.edges[current]) {
      if (e === source) {
        return Object.keys(previous).join(" -> ") + " -> " + source;
      }
      if (previous[e] === undefined) { // dont revisit vertices
        previous[e] = true;
        const found = this.findCycle(source, e, previous);
        if (found) {
          return found;
        }
      }
    }

    return undefined;
  }

  private buildEdges(from: string, node: ISpaghettiScopeNode): void {
    for (const r of node.getData().references) {
      if (r.resolved === undefined
          || node.getIdentifier().filename === r.resolved.getFilename()
          || r.resolved.getFilename() === BuiltIn.filename) {
        continue;
      }
      if (r.referenceType === ReferenceType.ObjectOrientedReference
          && r.extra?.ooName) {
        if (this.edges[from] === undefined) {
          this.edges[from] = [];
        }
        const name = r.extra.ooName.toUpperCase();
        if (name !== from && this.edges[from].indexOf(name) < 0) {
          this.edges[from].push(name);
        }
      }
    }

    for (const c of node.getChildren()) {
      this.buildEdges(from, c);
    }
  }
}