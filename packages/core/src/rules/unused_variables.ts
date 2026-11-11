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
import {Comment, Unknown} from "../abap/2_statements/statements/_statement";
import {IReference, ReferenceType} from "../abap/5_syntax/_reference";
import {ABAPFile} from "../abap/abap_file";


export class UnusedVariablesConf extends BasicRuleConfig {
  /** skip specific names, case insensitive
   * @uniqueItems true
  */
  public skipNames?: string[] = [];
  /** skip parameters from abstract methods */
  public skipAbstract: boolean = false;
}

class WorkArea {
  // keyed by filename + start position, this equals Identifier.equals()
  private readonly workarea = new Map<string, {id: TypedIdentifier, count: number, required: number}>();

  public push(id: TypedIdentifier, count = 1) {
    const key = WorkArea.buildKey(id);
    if (this.workarea.has(key)) {
      return;
    }
    this.workarea.set(key, {id, count, required: count});
  }

  public removeIfExists(id: Identifier | undefined): void {
    if (id === undefined) {
      return;
    }
    const key = WorkArea.buildKey(id);
    const found = this.workarea.get(key);
    if (found !== undefined) {
      found.count--;
      if (found.count === 0) {
        this.workarea.delete(key);
      }
    }
  }

  /** removes the identifiers with enough references, counts include all objects, also the one the
   *  identifiers belong to, so it is compared to the required count and not the remaining count */
  public removeReferenced(counts: ReadonlyMap<string, number>): void {
    for (const [key, entry] of this.workarea) {
      if ((counts.get(key) ?? 0) >= entry.required) {
        this.workarea.delete(key);
      }
    }
  }

  public get() {
    return [...this.workarea.values()];
  }

  public count(): number {
    return this.workarea.size;
  }

  public static buildKey(id: Identifier): string {
    const start = id.getStart();
    return id.getFilename() + "," + start.getRow() + "," + start.getCol();
  }
}

export class UnusedVariables implements IRule {
  private conf = new UnusedVariablesConf();
  private reg: IRegistry;
  private workarea: WorkArea;
  /** read, write and type references per identifier key in all objects, built once per run when needed */
  private referenceCounts: Map<string, number> | undefined = undefined;

  public getMetadata(): IRuleMetadata {
    return {
      key: "unused_variables",
      title: "Unused variables",
      shortDescription: `Checks for unused variables and constants`,
      extendedInformation: `Skips event parameters.

Note that this currently does not work if the source code uses macros.

Unused variables are not reported if the object contains parser or syntax errors.

Errors found in INCLUDES are reported for the main program.`,
      tags: [RuleTag.Quickfix],
      pragma: "##NEEDED",
      pseudoComment: "EC NEEDED",
      badExample: `DATA: BEGIN OF blah1,
      test  TYPE string,
      test2 TYPE string,
    END OF blah1.`,
      goodExample: `DATA: BEGIN OF blah2 ##NEEDED,
      test  TYPE string,
      test2 TYPE string,
    END OF blah2.`,
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
    this.referenceCounts = undefined;
    return this;
  }

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    } else if (obj instanceof Interface) { // todo, how to handle interfaces?
      return [];
    }

    for (const file of obj.getABAPFiles()) {
      for (const statement of file.getStatements()) {
        if (statement.get() instanceof Unknown) {
          return []; // contains parser errors
        }
      }
    }

    // dont report unused variables when there are syntax errors
    const syntax = new SyntaxLogic(this.reg, obj).run();
    if (syntax.issues.length > 0) {
      return []; // contains syntax errors
    }

    this.workarea = new WorkArea();
    const top = syntax.spaghetti.getTop();
    this.buildWorkarea(top, obj);

    if (this.workarea.count() === 0) {
      return this.buildIssues(obj); // exit early if all variables are used
    }
    this.findUses(top);
    if (this.workarea.count() === 0) {
      return this.buildIssues(obj); // exit early if all variables are used
    }

    // uses in other objects, the counts are built once instead of searching all objects for each object
    this.workarea.removeReferenced(this.getReferenceCounts());

    return this.buildIssues(obj);
  }

  private getReferenceCounts(): ReadonlyMap<string, number> {
    if (this.referenceCounts === undefined) {
      const counts = new Map<string, number>();
      for (const o of this.reg.getObjects()) {
        if (!(o instanceof ABAPObject) || this.reg.isDependency(o)) {
          continue; // do not search in dependencies
        }
        const syntax = new SyntaxLogic(this.reg, o).run();
        this.countUses(syntax.spaghetti.getTop(), counts);
      }
      this.referenceCounts = counts;
    }
    return this.referenceCounts;
  }

  private static isUse(r: IReference): boolean {
    return r.referenceType === ReferenceType.DataReadReference
      || r.referenceType === ReferenceType.DataWriteReference
      || r.referenceType === ReferenceType.TypeReference;
  }

  private findUses(node: ISpaghettiScopeNode): void {
    for (const r of node.getData().references) {
      if (UnusedVariables.isUse(r)) {
        this.workarea.removeIfExists(r.resolved);
      }
    }

    for (const c of node.getChildren()) {
      this.findUses(c);
    }
  }

  private countUses(node: ISpaghettiScopeNode, counts: Map<string, number>): void {
    for (const r of node.getData().references) {
      if (r.resolved !== undefined && UnusedVariables.isUse(r)) {
        const key = WorkArea.buildKey(r.resolved);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }

    for (const c of node.getChildren()) {
      this.countUses(c, counts);
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
        } else if (this.conf.skipAbstract === true && meta.includes(IdentifierMeta.Abstract)) {
          continue;
        } else if (name === "ME"
            || name === "SUPER"
            || meta.includes(IdentifierMeta.SelectionScreenTab)
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
    const metadata = this.getMetadata();
    const pragma = metadata.pragma + "";
    const files = new Map<string, ABAPFile | undefined>();

    for (const w of this.workarea.get()) {
      const filename = w.id.getFilename();
      if (this.reg.isFileDependency(filename) === true) {
        continue;
      } else if (obj instanceof Program === false && obj.containsFile(filename) === false) {
        continue;
      }

      if (files.has(filename) === false) {
        files.set(filename, this.findFile(filename));
      }
      const file = files.get(filename);

      let statement: StatementNode | undefined = undefined;
      let statementIndex = -1;
      if (file !== undefined) {
        const statements = file.getStatements();
        const token = w.id.getToken();
        for (let i = 0; i < statements.length; i++) {
          if (statements[i].includesToken(token)) {
            statement = statements[i];
            statementIndex = i;
            break;
          }
        }
      }

      if (statement !== undefined && file !== undefined) {
        if (statement.getPragmas().some(t => t.getStr() === pragma)) {
          continue;
        } else if (this.suppressedbyPseudo(file, statementIndex, w.id, obj)) {
          continue;
        }
      }

      const name = w.id.getName();
      const message = "Variable \"" + name.toLowerCase() + "\" not used";

      const fix = this.buildFix(w.id, obj, statement);
      ret.push(Issue.atIdentifier(w.id, message, metadata.key, this.conf.severity, fix));
    }

    return ret;
  }

  private suppressedbyPseudo(file: ABAPFile, statementIndex: number, v: TypedIdentifier, obj: ABAPObject): boolean {
    // pseudo comments are only found in files belonging to the object itself, not in eg. includes
    if (obj.getABAPFileByName(v.getFilename()) === undefined) {
      return false;
    }

    const statements = file.getStatements();
    const next = statements[statementIndex + 1];
    return next?.get() instanceof Comment
      && next.concatTokens().includes(this.getMetadata().pseudoComment + "");

    return false;
  }

  private findFile(filename: string): ABAPFile | undefined {
    const file = this.reg.getFileByName(filename);
    if (file === undefined) {
      return undefined;
    }
    const object = this.reg.findObjectForFile(file);
    if (!(object instanceof ABAPObject)) {
      return undefined;
    }
    return object.getABAPFileByName(filename);
  }

  private buildFix(v: TypedIdentifier, obj: ABAPObject, statement: StatementNode | undefined): IEdit | undefined {
    if (statement === undefined || !(statement.get() instanceof Statements.Data)) {
      return undefined;
    }

    const file = obj.getABAPFileByName(v.getFilename());
    if (file === undefined) {
      return undefined;
    }
    return EditHelper.deleteStatement(file, statement);
  }
}