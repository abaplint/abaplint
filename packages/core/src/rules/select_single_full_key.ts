import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {ABAPObject, IObject, IRegistry, Statements, SyntaxLogic} from "..";

export class SelectSingleFullKeyConf extends BasicRuleConfig {
}

export class SelectSingleFullKey implements IRule {
  private reg: IRegistry;
  private conf = new SelectSingleFullKeyConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "select_single_full_key",
      title: "Detect SELECT SINGLE which are possibily not unique",
      shortDescription: `Detect SELECT SINGLE which are possibily not unique`,
      extendedInformation: `Table definitions must be known, ie. inside the errorNamespace`,
      pseudoComment: "EC CI_NOORDER",
      tags: [RuleTag.Experimental],
    };
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SelectSingleFullKeyConf) {
    this.conf = conf;
  }

  public run(obj: IObject): readonly Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const syntax = new SyntaxLogic(this.reg, obj).run();
    if (syntax.issues.length > 0) {
      return [];
    }

//    const top = syntax.spaghetti.getTop();
    const issues: Issue[] = [];

    for (const file of obj.getABAPFiles()) {
      for (const s of file.getStatements()) {
        if (!(s.get() instanceof Statements.Select)) {
          continue;
        }
// todo
      }
    }

    return issues;
  }

}
