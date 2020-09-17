import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {ABAPObject} from "../objects/_abap_object";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {VoidType} from "../abap/types/basic/void_type";
import {ScopeType} from "../abap/5_syntax/_scope_type";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {StructureType} from "../abap/types/basic";
import {IRuleMetadata, IRule} from "./_irule";

export class ForbiddenVoidTypeConf extends BasicRuleConfig {
  /** List of forbidden void types, array of string regex, case in-sensitive */
  public check: string[] = [];
}

export class ForbiddenVoidType implements IRule {
  private reg: IRegistry;
  private conf = new ForbiddenVoidTypeConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "forbidden_void_type",
      title: "Forbidden Void Types",
      shortDescription: `Avoid usage of specified void types.`,
      extendedInformation: `Inspiration:
BOOLEAN, BOOLE_D, CHAR01, CHAR1, CHAR10, CHAR12, CHAR128, CHAR2, CHAR20, CHAR4, CHAR70,
DATS, TIMS, DATUM, FLAG, INT4, NUMC3, NUMC4, SAP_BOOL, TEXT25, TEXT80, X255, XFELD`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ForbiddenVoidTypeConf): void {
    this.conf = conf;
    if (this.conf.check === undefined) {
      this.conf.check = [];
    }
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): readonly Issue[] {
    if (!(obj instanceof ABAPObject) || this.conf.check.length === 0) {
      return [];
    }

    return this.traverse(new SyntaxLogic(this.reg, obj).run().spaghetti.getTop());
  }

///////////////

  private traverse(node: ISpaghettiScopeNode): readonly Issue[] {
    let ret: Issue[] = [];
    const message = "Forbidden void type: ";

    if (node.getIdentifier().stype !== ScopeType.BuiltIn) {
      for (const t of node.getData().types) {
        const typ = t.identifier.getType();
        if (this.isForbidden(typ)) {
          ret.push(Issue.atIdentifier(t.identifier, message + typ.toText(0), this.getMetadata().key, this.conf.severity));
        }
      }
      for (const v of node.getData().vars) {
        const typ = v.identifier.getType();
        if (this.isForbidden(typ)) {
          ret.push(Issue.atIdentifier(v.identifier, message + typ.toText(0), this.getMetadata().key, this.conf.severity));
        }
      }
    }

    for (const c of node.getChildren()) {
      ret = ret.concat(this.traverse(c));
    }

    return ret;
  }

  private isForbidden(type: AbstractType): boolean {
    if (type instanceof StructureType) {
      return type.getComponents().some(c => this.isForbidden(c.type));
    } else if (!(type instanceof VoidType)) {
      return false;
    }

    const name = type.getVoided();
    if (name === undefined) {
      return false;
    }

    for (const c of this.conf.check) {
      const reg = new RegExp(c, "i");
      const match = reg.test(name);
      if (match === true) {
        return true;
      }
    }
    return false;
  }

}
