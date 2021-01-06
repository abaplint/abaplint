import {IRegistry} from "../_iregistry";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {Issue} from "../issue";
import * as BasicTypes from "../abap/types/basic";
import {IRuleMetadata, RuleTag, IRule} from "./_irule";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {IInterfaceDefinition} from "../abap/types/_interface_definition";
import {Identifier} from "../abap/4_file_information/_identifier";

export class UnknownTypesConf extends BasicRuleConfig {
}

export class UnknownTypes implements IRule {
  private reg: IRegistry;
  private conf = new UnknownTypesConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "unknown_types",
      title: "Unknown types",
      shortDescription: `Enables check for unknown data types, respects errorNamespace`,
      tags: [RuleTag.Experimental, RuleTag.Syntax],
    };
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UnknownTypesConf) {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const spaghetti = new SyntaxLogic(this.reg, obj).run().spaghetti;

    return this.traverse(spaghetti.getTop());
  }

/////////////////////

  private traverse(node: ISpaghettiScopeNode): Issue[] {
    let ret: Issue[] = [];

    for (const v of node.getData().vars) {
      const found = this.containsUnknown(v.identifier.getType());
      if (found) {
        const message = "Type of \"" + v.name + "\" contains unknown: " + found;
        ret.push(Issue.atIdentifier(v.identifier, message, this.getMetadata().key, this.conf.severity));
      }
    }

    for (const v of node.getData().types) {
      const found = this.containsUnknown(v.identifier.getType());
      if (found) {
        const message = "Type of \"" + v.name + "\" contains unknown: " + found;
        ret.push(Issue.atIdentifier(v.identifier, message, this.getMetadata().key, this.conf.severity));
      }
    }

    for (const v of node.getData().idefs) {
      const found = this.checkInterface(v);
      if (found) {
        const message = "Contains unknown, " + found.found;
        ret.push(Issue.atIdentifier(found.id, message, this.getMetadata().key, this.conf.severity));
      }
    }

    for (const n of node.getChildren()) {
      ret = ret.concat(this.traverse(n));
    }

    return ret;
  }

  private checkInterface(idef: IInterfaceDefinition): {id: Identifier, found: string} | undefined {
    for (const m of idef.getMethodDefinitions()?.getAll() || []) {
      for (const p of m.getParameters().getAll()) {
        const found = this.containsUnknown(p.getType());
        if (found) {
          return {id: p, found};
        }
      }
    }
    return undefined;
  }

  private containsUnknown(type: AbstractType): string | undefined {
    if (type instanceof BasicTypes.UnknownType) {
      return type.getError();
    } else if (type instanceof BasicTypes.StructureType) {
      for (const c of type.getComponents()) {
        const found = this.containsUnknown(c.type instanceof TypedIdentifier ? c.type.getType() : c.type);
        if (found) {
          return found;
        }
      }
    } else if (type instanceof BasicTypes.TableType) {
      return this.containsUnknown(type.getRowType());
    }
    return undefined;
  }

}