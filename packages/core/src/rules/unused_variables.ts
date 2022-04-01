import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ABAPObject} from "../objects/_abap_object";
import {ScopeType} from "../abap/5_syntax/_scope_type";
import {TypedIdentifier, IdentifierMeta} from "../abap/types/_typed_identifier";
import {Interface, Program} from "../objects";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {Identifier} from "../abap/4_file_information/_identifier";
import {EditHelper, IEdit} from "../edit_helper";
import {StatementNode} from "../abap/nodes/statement_node";
import * as Statements from "../abap/2_statements/statements";
import {Comment} from "../abap/2_statements/statements/_statement";
import {ReferenceType} from "../abap/5_syntax/_reference";


export class UnusedVariablesConf extends BasicRuleConfig {
  /** skip specific names, case insensitive
   * @uniqueItems true
  */
  public skipNames?: string[] = [];
}

class WorkArea {
  private readonly workarea: {id: TypedIdentifier, count: number}[] = [];

  public push(id: TypedIdentifier, count = 1) {
    for (const w of this.workarea) {
      if (id.equals(w.id)) {
        return;
      }
    }
    this.workarea.push({id, count});
  }

  public removeIfExists(id: Identifier | undefined): void {
    if (id === undefined) {
      return;
    }
    for (let i = 0; i < this.workarea.length; i++) {
      if (id.equals(this.workarea[i].id)) {
        this.workarea[i].count--;
        if (this.workarea[i].count === 0) {
          this.workarea.splice(i, 1);
        }
        return;
      }
    }
  }

  public get() {
    return this.workarea;
  }

  public count(): number {
    return this.workarea.length;
  }
}

export class UnusedVariables implements IRule {
  private conf = new UnusedVariablesConf();
  private reg: IRegistry;
  private workarea: WorkArea;

  public getMetadata(): IRuleMetadata {
    return {
      key: "unused_variables",
      title: "Unused variables",
      shortDescription: `Checks for unused variables and constants`,
      extendedInformation: `WARNING: slow

Skips event parameters.

Note that this currently does not work if the source code uses macros.

Unused variables are not reported if the object contains syntax errors. Errors found in INCLUDES are reported for the main program.`,
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

    this.workarea = new WorkArea();
    const top = syntax.spaghetti.getTop();
    this.buildWorkarea(top, obj);

    if (this.workarea.count() === 0) {
      return this.buildIssues(obj); // exit early if all types are used
    }
    this.findUses(top, obj);

    for (const o of this.reg.getObjects()) {
      if (o === obj) {
        continue;
      } else if (o instanceof ABAPObject) {
        if (this.reg.isDependency(o)) {
          continue; // do not search in dependencies
        }
        const syntax = new SyntaxLogic(this.reg, o).run();
        this.findUses(syntax.spaghetti.getTop(), o);
        if (this.workarea.count() === 0) {
          return this.buildIssues(obj); // exit early if all types are used
        }
      }
    }

    return this.buildIssues(obj);
  }

  private findUses(node: ISpaghettiScopeNode, obj: ABAPObject): void {

    for (const r of node.getData().references) {
      if (r.referenceType === ReferenceType.DataReadReference
          || r.referenceType === ReferenceType.DataWriteReference
          || r.referenceType === ReferenceType.TypeReference) {
        this.workarea.removeIfExists(r.resolved);
      }
    }

    for (const c of node.getChildren()) {
      this.findUses(c, obj);
    }
  }

  private buildWorkarea(node: ISpaghettiScopeNode, obj: ABAPObject): void {
    const stype = node.getIdentifier().stype;

    if (stype === ScopeType.OpenSQL) {
      return;
    }

    for (const c of node.getChildren()) {
      this.buildWorkarea(c, obj);
    }

    if (stype !== ScopeType.BuiltIn) {
      const vars = node.getData().vars;
      for (const name in vars) {
        const meta = vars[name].getMeta();
        if (this.conf.skipNames
            && this.conf.skipNames.length > 0
            && this.conf.skipNames.some((a) => a.toUpperCase() === name)) {
          continue;
        } else if (name === "ME"
            || name === "SUPER"
            || meta.includes(IdentifierMeta.EventParameter)) {
          // todo, workaround for "me" and "super", these should somehow be typed to built-in
          continue;
        }
        const isInline = meta.includes(IdentifierMeta.InlineDefinition);
        this.workarea.push(vars[name], isInline ? 2 : 1);
      }
    }
  }

  private buildIssues(obj: ABAPObject): Issue[] {
    const ret: Issue[] = [];

    for (const w of this.workarea.get()) {
      const filename = w.id.getFilename();
      if (this.reg.isFileDependency(filename) === true) {
        continue;
      } else if (obj instanceof Program === false && obj.containsFile(filename) === false) {
        continue;
      }

      const statement = this.findStatement(w.id);
      if (statement?.getPragmas().map(t => t.getStr()).includes(this.getMetadata().pragma + "")) {
        continue;
      } else if (this.suppressedbyPseudo(statement, w.id, obj)) {
        continue;
      }

      const name = w.id.getName();
      const message = "Variable \"" + name.toLowerCase() + "\" not used";

      const fix = this.buildFix(w.id, obj);
      ret.push(Issue.atIdentifier(w.id, message, this.getMetadata().key, this.conf.severity, fix));
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
    if (statement === undefined) {
      return undefined;
    } else if (statement.get() instanceof Statements.Data) {
      return EditHelper.deleteStatement(file, statement);
    }
    return undefined;
  }
}