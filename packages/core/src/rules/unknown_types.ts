import {IRegistry} from "../_iregistry";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {Issue} from "../issue";
import {UnknownType} from "../abap/types/basic";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";

export class UnknownTypesConf extends BasicRuleConfig {
}

export class UnknownTypes {

  private conf = new UnknownTypesConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "unknown_types",
      title: "Unknown types",
      shortDescription: `Enables check for unknown data types, respects errorNamespace`,
      tags: [RuleTag.Experimental, RuleTag.Syntax],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UnknownTypesConf) {
    this.conf = conf;
  }

  public run(obj: IObject, reg: IRegistry): Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const spaghetti = new SyntaxLogic(reg, obj).run().spaghetti;

    return this.traverse(spaghetti.getTop(), reg);
  }

  private traverse(node: ISpaghettiScopeNode, reg: IRegistry): Issue[] {
    let ret: Issue[] = [];

    for (const v of node.getData().vars) {
      const type = v.identifier.getType();
      if (type instanceof UnknownType) {
        ret.push(Issue.atIdentifier(v.identifier, type.toText(), this.getMetadata().key));
      }
    }

    for (const n of node.getChildren()) {
      ret = ret.concat(this.traverse(n, reg));
    }

    return ret;
  }

}