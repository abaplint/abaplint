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
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {References} from "../lsp/references";
import {EditHelper, IEdit} from "../edit_helper";
import {StatementNode} from "../abap/nodes/statement_node";
import {Comment} from "../abap/2_statements/statements/_statement";

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

      Note that this currently does not work if the source code uses macros.

      Unused variables are not reported if the object contains syntax errors.`,
      tags: [RuleTag.Quickfix],
      pragma: "##NEEDED",
      pseudoComment: "EC NEEDED",
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
    const ret: Issue[] = [];

    if (node.getIdentifier().stype === ScopeType.OpenSQL) {
      return [];
    }

    if (node.getIdentifier().stype !== ScopeType.BuiltIn) {
      ret.push(...this.checkNode(node, obj));
    }

    for (const c of node.getChildren()) {
      ret.push(...this.traverse(c, obj));
    }

    return ret;
  }

  private checkNode(node: ISpaghettiScopeNode, obj: ABAPObject): Issue[] {
    const ret: Issue[] = [];

    const vars = node.getData().vars;
    for (const name in vars) {
      if (this.conf.skipNames?.length > 0
          && this.conf.skipNames.some((a) => a.toUpperCase() === name)) {
        continue;
      }
      if (name === "ME"
          || name === "SUPER"
          || vars[name].getMeta().includes(IdentifierMeta.EventParameter)) {
        // todo, workaround for "me" and "super", these should somehow be typed to built-in
        continue;
      } else if ((obj.containsFile(vars[name].getFilename())
            || node.getIdentifier().stype === ScopeType.Program
            || node.getIdentifier().stype === ScopeType.Form)
          && this.isUsed(vars[name], node) === false) {
        const message = "Variable \"" + vars[name].getName() + "\" not used";

        const statement = this.findStatement(vars[name]);
        if (statement?.getPragmas().map(t => t.getStr()).includes(this.getMetadata().pragma + "")) {
          continue;
        } else if (this.suppressedbyPseudo(statement, vars[name], obj)) {
          continue;
        }

        const fix = this.buildFix(vars[name], obj);
        ret.push(Issue.atIdentifier(vars[name], message, this.getMetadata().key, this.conf.severity, fix));
      }
    }

    return ret;
  }

  private suppressedbyPseudo(statement: StatementNode | undefined, v: TypedIdentifier, obj: ABAPObject): boolean {
    if (statement === undefined) {
      return false;
    }

    const file = obj.getABAPFileByName(v.getFilename());
    if (file === undefined) {
      return false;
    }

    let next = false;
    for (const s of file.getStatements()) {
      if (next === true && s.get() instanceof Comment) {
        return s.concatTokens().includes(this.getMetadata().pseudoComment + "");
      }
      if (s === statement) {
        next = true;
      }
    }

    return false;
  }

  private isUsed(id: TypedIdentifier, node: ISpaghettiScopeNode): boolean {
    const isInline = id.getMeta().includes(IdentifierMeta.InlineDefinition);
    const found = new References(this.reg).search(id, node, true, isInline === false);
    if (isInline === true) {
      return found.length > 2; // inline definitions are always written to
    } else {
      return found.length > 1;
    }
  }

  private findStatement(v: TypedIdentifier): StatementNode | undefined {
    const file = this.reg.getFileByName(v.getFilename());
    if (file === undefined) {
      return undefined;
    }
    const object = this.reg.findObjectForFile(file);
    if (!(object instanceof ABAPObject)) {
      return undefined;
    }
    const abapfile = object.getABAPFileByName(v.getFilename());
    if (abapfile === undefined) {
      return undefined;
    }

    const statement = EditHelper.findStatement(v.getToken(), abapfile);
    return statement;
  }

  private buildFix(v: TypedIdentifier, obj: ABAPObject): IEdit | undefined {
    const file = obj.getABAPFileByName(v.getFilename());
    if (file === undefined) {
      return undefined;
    }

    const statement = EditHelper.findStatement(v.getToken(), file);
    if (statement) {
      return EditHelper.deleteStatement(file, statement);
    }

    return undefined;
  }
}