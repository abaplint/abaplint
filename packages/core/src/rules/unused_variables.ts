import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ABAPObject} from "../objects/_abap_object";
import {ScopeType} from "../abap/5_syntax/_scope_type";
import {TypedIdentifier, IdentifierMeta} from "../abap/types/_typed_identifier";
import {Interface} from "../objects";
import {ISpaghettiScopeNode, IScopeVariable} from "../abap/5_syntax/_spaghetti_scope";
import {References} from "../lsp/references";
import {EditHelper, IEdit} from "../edit_helper";

export class UnusedVariablesConf extends BasicRuleConfig {
  /** skip specific names, case insensitive */
  public skipNames: string[] = [];
}

export class UnusedVariables implements IRule {
  private conf = new UnusedVariablesConf();
  private reg: IRegistry;

  public getMetadata(): IRuleMetadata {
    return {
      key: "unused_variables",
      title: "Unused variables",
      shortDescription: `Checks for unused variables and constants`,
      extendedInformation: `WARNING: slow

      Experimental, might give false positives. Skips event parameters.

      Note that this currently does not work if the source code uses macros.`,
      tags: [RuleTag.Experimental, RuleTag.Quickfix],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UnusedVariablesConf) {
    this.conf = conf;
    if (this.conf.skipNames === undefined) {
      this.conf.skipNames = [];
    }
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    } else if (obj instanceof Interface) { // todo, how to handle interfaces?
      return [];
    }

    // dont report unused variables when there are syntax errors
    const syntax = new SyntaxLogic(this.reg, obj).run();
    if (syntax.issues.length > 0) {
      return [];
    }

    const results = this.traverse(syntax.spaghetti.getTop(), obj);

    // remove duplicates, quick and dirty
    const deduplicated: Issue[] = [];
    for (const result of results) {
      let cont = false;
      for (const d of deduplicated) {
        if (result.getStart().equals(d.getStart())) {
          cont = true;
          break;
        }
      }
      if (cont === true) {
        continue;
      }
      deduplicated.push(result);
    }

    return deduplicated;
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
      if (this.conf.skipNames?.length > 0
          && this.conf.skipNames.some((a) => a.toUpperCase() === v.name.toUpperCase())) {
        continue;
      }
      if (v.name === "me"
          || v.name === "super"
          || v.identifier.getMeta().includes(IdentifierMeta.EventParameter)) {
        // todo, workaround for "me" and "super", these should somehow be typed to built-in
        continue;
      } else if ((obj.containsFile(v.identifier.getFilename())
            || node.getIdentifier().stype === ScopeType.Program
            || node.getIdentifier().stype === ScopeType.Form)
          && this.isUsed(v.identifier, node) === false) {
        const message = "Variable \"" + v.identifier.getName() + "\" not used";
        const fix = this.buildFix(v, obj);
        ret.push(Issue.atIdentifier(v.identifier, message, this.getMetadata().key, this.conf.severity, fix));
      }
    }

    return ret;
  }

  private isUsed(id: TypedIdentifier, node: ISpaghettiScopeNode): boolean {
    const found = new References(this.reg).search(id, node);
    return found.length > 1;
  }

  private buildFix(v: IScopeVariable, obj: ABAPObject): IEdit | undefined {
    const file = obj.getABAPFileByName(v.identifier.getFilename());
    if (file === undefined) {
      return undefined;
    }

    const statement = EditHelper.findStatement(v.identifier.getToken(), file);
    if (statement) {
      return EditHelper.deleteStatement(file, statement);
    }

    return undefined;
  }
}