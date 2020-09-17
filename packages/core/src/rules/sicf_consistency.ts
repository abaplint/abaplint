import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {ICFService, Class} from "../objects";
import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {Position} from "../position";
import {InfoClassDefinition, InfoImplementing} from "../abap/4_file_information/_abap_file_information";

export class SICFConsistencyConf extends BasicRuleConfig {
}

export class SICFConsistency implements IRule {
  private reg: IRegistry;
  private conf = new SICFConsistencyConf();

  public getMetadata() {
    return {
      key: "sicf_consistency",
      title: "SICF consistency",
      shortDescription: `Checks the validity of ICF services:

* Class defined in handler must exist
* Class must not have any syntax errors
* Class must implement interface IF_HTTP_EXTENSION`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SICFConsistencyConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): Issue[] {
    const issues: Issue[] = [];

    if (!(obj instanceof ICFService)) {
      return [];
    }

    const handlers = obj.getHandlerList();
    if (handlers === undefined) {
      return [];
    }

    for (const h of handlers) {
      const clas = this.reg.getObject("CLAS", h) as Class | undefined;
      if (clas === undefined) {
        const pattern = new RegExp(this.reg.getConfig().getSyntaxSetttings().errorNamespace, "i");
        if (pattern.test(h) === true) {
          const message = "Handler class " + h + " not found";
          const issue = Issue.atPosition(obj.getFiles()[0], new Position(1, 1), message, this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }
        continue;
      }

      const def = clas.getClassDefinition();
      if (def === undefined) {
        const message = "Syntax error in class " + h;
        const issue = Issue.atPosition(obj.getFiles()[0], new Position(1, 1), message, this.getMetadata().key, this.conf.severity);
        issues.push(issue);
        continue;
      }

      const implementing = this.findImplementing(def);
      if (implementing.findIndex((i) => { return i.name.toUpperCase() === "IF_HTTP_EXTENSION"; }) < 0) {
        const message = "Handler class " + h + " must implement IF_HTTP_EXTENSION";
        const issue = Issue.atPosition(obj.getFiles()[0], new Position(1, 1), message, this.getMetadata().key, this.conf.severity);
        issues.push(issue);
        continue;
      }
    }

    return issues;
  }

///////////////////////////

  private findImplementing(def: InfoClassDefinition): readonly InfoImplementing[] {
    let ret = def.interfaces;

    let superName = def.superClassName;
    while (superName !== undefined) {
      const clas = this.reg.getObject("CLAS", superName) as Class | undefined;
      if (clas === undefined) {
        break;
      }
      const superDef = clas.getClassDefinition();
      if (superDef === undefined) {
        break;
      }
      ret = ret.concat(superDef.interfaces);
      superName = superDef.superClassName;
    }

    return ret;
  }
}