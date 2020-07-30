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
      const type = v.identifier.getType();
      if (this.containsUnknown(type)) {
        ret.push(Issue.atIdentifier(v.identifier, type.toText(0), this.getMetadata().key));
      }
    }

    for (const n of node.getChildren()) {
      ret = ret.concat(this.traverse(n));
    }

    return ret;
  }

  private containsUnknown(type: AbstractType): boolean {
    if (type instanceof BasicTypes.UnknownType) {
      return true;
    } else if (type instanceof BasicTypes.StructureType) {
      for (const c of type.getComponents()) {
        if (this.containsUnknown(c.type)) {
          return true;
        }
      }
    } else if (type instanceof BasicTypes.TableType) {
      return this.containsUnknown(type.getRowType());
    }
    return false;
  }

}