import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ABAPObject} from "../objects/_abap_object";
import {ScopeType} from "../abap/5_syntax/_scope_type";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {Interface} from "../objects";
import {ISpaghettiScopeNode, IScopeVariable} from "../abap/5_syntax/_spaghetti_scope";
import {References} from "../lsp/references";
import {Data} from "../abap/2_statements/statements";
import {EditHelper, IEdit} from "../edit_helper";

export class UnusedVariablesConf extends BasicRuleConfig {
}

export class UnusedVariables implements IRule {
  private conf = new UnusedVariablesConf();
  private reg: IRegistry;

  public getMetadata(): IRuleMetadata {
    return {
      key: "unused_variables",
      title: "Unused variables",
      shortDescription: `Checks for unused variables`,
      extendedInformation: `WARNING: slow!
Doesnt currently work for public attributes and class prefixed attribute usage`,
      tags: [RuleTag.Experimental, RuleTag.Quickfix],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UnusedVariablesConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    } else if (obj instanceof Interface) {
      return [];
    }

    return this.traverse(new SyntaxLogic(this.reg, obj).run().spaghetti.getTop(), obj);
  }

  private traverse(node: ISpaghettiScopeNode, obj: ABAPObject): Issue[] {
    let ret: Issue[] = [];

    if (node.getIdentifier().stype !== ScopeType.BuiltIn) {
      ret = ret.concat(this.checkNode(node, obj));
    }

    for (const c of node.getChildren()) {
      ret = ret.concat(this.traverse(c, obj));
    }

    return ret;
  }

  private checkNode(node: ISpaghettiScopeNode, obj: ABAPObject): Issue[] {
    const ret: Issue[] = [];

    for (const v of node.getData().vars) {
      if (v.name === "me" || v.name === "super") {
        continue; // todo, this is a workaround
      }
      if (this.isUsed(v.identifier) === false
          && obj.containsFile(v.identifier.getFilename())) {
        const message = "Variable \"" + v.identifier.getName() + "\" not used";
        const fix = this.buildFix(v, obj);
        ret.push(Issue.atIdentifier(v.identifier, message, this.getMetadata().key, fix));
      }
    }

    return ret;
  }

  private isUsed(id: TypedIdentifier): boolean {
    // todo, this is slow, but less false positives than the previous implementation
    const found = new References(this.reg).searchEverything(id);
    return found.length > 1;
  }

  private buildFix(v: IScopeVariable, obj: ABAPObject): IEdit | undefined {
    const file = obj.getABAPFileByName(v.identifier.getFilename());
    if (file === undefined) {
      return undefined;
    }

    for (const s of file.getStatements()) {
      if (s.get() instanceof Data && s.includesToken(v.identifier.getToken())) {
        return EditHelper.deleteRange(file, s.getFirstToken().getStart(), s.getLastToken().getEnd());
      }
    }

    return undefined;
  }
}