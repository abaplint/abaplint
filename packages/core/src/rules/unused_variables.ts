import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {SyntaxLogic} from "../abap/syntax/syntax";
import {ABAPObject} from "../objects/_abap_object";
import {SpaghettiScopeNode} from "../abap/syntax/spaghetti_scope";
import {ScopeType} from "../abap/syntax/_scope_type";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {Interface} from "../objects";

/** Checks for unused variables */
export class UnusedVariablesConf extends BasicRuleConfig {
}

export class UnusedVariables implements IRule {
  private conf = new UnusedVariablesConf();

  public getKey(): string {
    return "unused_variables";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UnusedVariablesConf) {
    this.conf = conf;
  }

  public run(obj: IObject, reg: IRegistry): Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    } else if (obj instanceof Interface) {
      return [];
    }

    return this.traverse(new SyntaxLogic(reg, obj).run().spaghetti.getTop(), obj);
  }

  private traverse(node: SpaghettiScopeNode, obj: ABAPObject): Issue[] {
    let ret: Issue[] = [];

    if (node.getIdentifier().stype !== ScopeType.BuiltIn) {
      ret = ret.concat(this.checkNode(node, obj));
    }

    for (const c of node.getChildren()) {
      ret = ret.concat(this.traverse(c, obj));
    }

    return ret;
  }

  private checkNode(node: SpaghettiScopeNode, obj: ABAPObject): Issue[] {
    const ret: Issue[] = [];

    for (const v of node.getData().vars) {
      if (v.name === "me" || v.name === "super") {
        continue; // todo, this is a workaround
      }
      if (this.isUsed(node, v.identifier) === false
          && obj.containsFile(v.identifier.getFilename())) {
        const message = "Variable \"" + v.identifier.getName() + "\" not used";
        ret.push(Issue.atIdentifier(v.identifier, message, this.getKey()));
      }
    }

    return ret;
  }

  private isUsed(node: SpaghettiScopeNode, id: TypedIdentifier): boolean {
    const usages = node.getData().reads.concat(node.getData().writes);

    for (const u of usages) {
      if (u.resolved.getFilename() === id.getFilename()
          && u.resolved.getStart().getCol() === id.getStart().getCol()
          && u.resolved.getStart().getRow() === id.getStart().getRow()) {
        return true;
      }
    }

    for (const c of node.getChildren()) {
      const res = this.isUsed(c, id);
      if (res === true) {
        return true;
      }
    }

    return false;
  }
}