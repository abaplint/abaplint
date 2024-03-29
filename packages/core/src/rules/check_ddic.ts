import {IRule, RuleTag} from "./_irule";
import {Issue} from "../issue";
import * as Objects from "../objects";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Position} from "../position";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {UnknownType, StructureType, TableType} from "../abap/types/basic";
import {TypedIdentifier} from "../abap/types/_typed_identifier";

export class CheckDDICConf extends BasicRuleConfig {
// todo, add option to not allow any void types?
}

export class CheckDDIC implements IRule {
  private reg: IRegistry;
  private conf = new CheckDDICConf();

  public getMetadata() {
    return {
      key: "check_ddic",
      title: "Check DDIC",
      // eslint-disable-next-line max-len
      shortDescription: `Checks the types of DDIC objects can be resolved, the namespace of the development/errors can be configured in "errorNamespace" `,
      tags: [RuleTag.Syntax],
    };
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CheckDDICConf) {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    let found: AbstractType | undefined = undefined;
    if (obj instanceof Objects.DataElement
        || obj instanceof Objects.Domain
        || obj instanceof Objects.Table
        || obj instanceof Objects.View
        || obj instanceof Objects.AuthorizationCheckField
        || obj instanceof Objects.LockObject
        || obj instanceof Objects.MaintenanceAndTransportObject
        || obj instanceof Objects.TableType) {
      found = obj.parseType(this.reg);
    } else {
      return [];
    }

    return this.check(found, obj);
  }

  private check(found: AbstractType | undefined, obj: IObject): Issue[] {
    const ret: Issue[] = [];

    if (found instanceof UnknownType) {
      const position = new Position(1, 1);
      const message = "Unknown/un-resolveable type in " + obj.getName() + ": " + found.getError();
      ret.push(Issue.atPosition(obj.getFiles()[0], position, message, this.getMetadata().key, this.conf.severity));
    } else if (found instanceof StructureType) {
// assumption: no circular types
      for (const c of found.getComponents()) {
        ret.push(...this.check(c.type instanceof TypedIdentifier ? c.type.getType() : c.type, obj));
      }
    } else if (found instanceof TableType) {
      ret.push(...this.check(found.getRowType(), obj));
    }
// todo, reference types?

    return ret;
  }

}