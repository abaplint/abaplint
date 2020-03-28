import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {ICFService, Class} from "../objects";
import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {Position} from "../position";

/** Checks the validity of ICF services */
export class SICFConsistencyConf extends BasicRuleConfig {
}

export class SICFConsistency implements IRule {
  private conf = new SICFConsistencyConf();

  public getKey(): string {
    return "sicf_consistency";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SICFConsistencyConf) {
    this.conf = conf;
  }

  public run(obj: IObject, reg: IRegistry): Issue[] {
    const issues: Issue[] = [];

    if (!(obj instanceof ICFService)) {
      return [];
    }

    const handlers = obj.getHandlerList();
    if (handlers === undefined) {
      return [];
    }

    for (const h of handlers) {
      const clas = reg.getObject("CLAS", h) as Class | undefined;
      if (clas === undefined) {
        const pattern = new RegExp(reg.getConfig().getSyntaxSetttings().errorNamespace, "i");
        if (pattern.test(h) === true) {
          const message = "Handler class " + h + " not found";
          const issue = Issue.atPosition(obj.getFiles()[0], new Position(1, 1), message, this.getKey());
          issues.push(issue);
        }
        continue;
      }

      const def = clas.getClassDefinition();
      if (def === undefined) {
        const message = "Syntax error in class " + h;
        const issue = Issue.atPosition(obj.getFiles()[0], new Position(1, 1), message, this.getKey());
        issues.push(issue);
        continue;
      }

      const implementing = def.getImplementing();
      if (implementing.findIndex((i) => { return i.name === "IF_HTTP_EXTENSION"; }) < 0) {
        const message = "Handler class " + h + " must implement IF_HTTP_EXTENSION";
        const issue = Issue.atPosition(obj.getFiles()[0], new Position(1, 1), message, this.getKey());
        issues.push(issue);
        continue;
      }
    }

    return issues;
  }
}