import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {Class, Interface} from "../objects";
import {IRule, IRuleMetadata} from "./_irule";
import {IObject} from "../objects/_iobject";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {ReferenceType} from "../abap/5_syntax/_reference";
import {DDIC} from "../ddic";

export class IntfReferencingClasConf extends BasicRuleConfig {
  /** List of classes allowed to be referenced, regex, case insensitive */
  public allow: string[] = [];
}

export class IntfReferencingClas implements IRule {
  private conf = new IntfReferencingClasConf();
  private reg: IRegistry;

  public getMetadata(): IRuleMetadata {
    return {
      key: "intf_referencing_clas",
      title: "INTF referencing CLAS",
      shortDescription: `Interface contains references to class`,
      extendedInformation: `Only global interfaces are checked.
      Only first level references are checked.
      Exception class references are ignored.
      Void references are ignored.`,
    };
  }

  public getConfig() {
    if (this.conf.allow === undefined) {
      this.conf.allow = [];
    }
    return this.conf;
  }

  public setConfig(conf: IntfReferencingClasConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry): IRule {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): readonly Issue[] {
    if (!(obj instanceof Interface)) {
      return [];
    }

    return this.traverse(new SyntaxLogic(this.reg, obj).run().spaghetti.getTop());
  }

////////////////

  private traverse(node: ISpaghettiScopeNode): readonly Issue[] {
    let ret: Issue[] = [];
    const message = "Referencing CLAS: ";

    const ddic = new DDIC(this.reg);

    for (const r of node.getData().references) {
      if (r.referenceType === ReferenceType.ObjectOrientedReference
          && r.extra?.ooType === "CLAS"
          && r.extra?.ooName !== undefined) {
        const found = this.reg.getObject("CLAS", r.extra.ooName) as Class || undefined;
        if (found && ddic.isException(found.getClassDefinition(), found)) {
          continue;
        } else if (this.getConfig().allow.some(reg => new RegExp(reg, "i").test(r.extra!.ooName!))) {
          continue;
        }
        ret.push(Issue.atIdentifier(r.position, message + r.extra.ooName, this.getMetadata().key, this.conf.severity));
      }
    }

    for (const c of node.getChildren()) {
      ret = ret.concat(this.traverse(c));
    }

    return ret;
  }
}