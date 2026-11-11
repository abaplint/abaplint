import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ABAPObject} from "../objects/_abap_object";
import {ScopeType} from "../abap/5_syntax/_scope_type";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {EditHelper, IEdit} from "../edit_helper";
import {ReferenceType} from "../abap/5_syntax/_reference";
import {Identifier} from "../abap/4_file_information/_identifier";
import {ABAPFile} from "../abap/abap_file";
import {StatementNode} from "../abap/nodes";
import {Comment, Unknown} from "../abap/2_statements/statements/_statement";
import {VirtualPosition} from "../virtual_position";

class WorkArea {
  // keyed by identifier position, insertion order is kept
  private readonly workarea = new Map<string, TypedIdentifier>();

  public push(id: TypedIdentifier) {
    const key = WorkArea.buildKey(id);
    if (this.workarea.has(key) === false) {
      this.workarea.set(key, id);
    }
  }

  public removeIfExists(id: Identifier) {
    this.workarea.delete(WorkArea.buildKey(id));
  }

  /** removes the identifiers referenced somewhere */
  public removeReferenced(referenced: ReadonlySet<string>) {
    for (const key of [...this.workarea.keys()]) {
      if (referenced.has(key)) {
        this.workarea.delete(key);
      }
    }
  }

  public get(): readonly TypedIdentifier[] {
    return [...this.workarea.values()];
  }

  public count(): number {
    return this.workarea.size;
  }

  /** identifiers from one macro call share the row and column, the virtual position tells them apart */
  public static buildKey(id: Identifier): string {
    const start = id.getStart();
    const key = id.getFilename() + "," + start.getRow() + "," + start.getCol();
    return start instanceof VirtualPosition ? key + "," + start.vrow + "," + start.vcol : key;
  }
}

export class UnusedTypesConf extends BasicRuleConfig {
  /** skip specific names, case insensitive
   * @uniqueItems true
   */
  public skipNames?: string[] = [];
}

export class UnusedTypes implements IRule {
  private conf = new UnusedTypesConf();
  private reg: IRegistry;
  private workarea: WorkArea;
  /** keys of the identifiers with a type reference in any object, built once per run when needed */
  private referenced: Set<string> | undefined = undefined;

  public getMetadata(): IRuleMetadata {
    return {
      key: "unused_types",
      title: "Unused types",
      shortDescription: `Checks for unused TYPE definitions`,
      extendedInformation: `Unused types are not reported if the object contains parser or syntax errors.`,
      tags: [RuleTag.Quickfix],
      pragma: "##NEEDED",
      pseudoComment: "EC NEEDED",
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UnusedTypesConf) {
    this.conf = conf;
    if (this.conf.skipNames === undefined) {
      this.conf.skipNames = [];
    }
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    this.referenced = undefined;
    return this;
  }

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof ABAPObject)) {
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
      return [];
    }

    this.workarea = new WorkArea();
    this.traverse(syntax.spaghetti.getTop(), obj, true);
    this.traverse(syntax.spaghetti.getTop(), obj, false);
    if (this.workarea.count() === 0) {
      return []; // exit early if all types are used in the current object
    }

    // uses in other objects, collected once instead of searching all objects for each object
    this.workarea.removeReferenced(this.getReferenced());
    if (this.workarea.count() === 0) {
      return []; // exit early if all types are used
    }

    // what is left is unused
    const ret: Issue[] = [];
    for (const t of this.workarea.get()) {
      const message = "Type \"" + t.getName() + "\" not used";

      const file = obj.getABAPFileByName(t.getFilename());
      if (file === undefined) {
        continue;
      }
      const statement = EditHelper.findStatement(t.getToken(), file);
      if (statement === undefined) {
        continue;
      }
      if (statement.getPragmas().some(t => t.getStr() === this.getMetadata().pragma)) {
        continue;
      } else if (this.suppressedbyPseudo(statement, file)) {
        continue;
      }

      const fix = this.buildFix(file, statement);
      ret.push(Issue.atIdentifier(t, message, this.getMetadata().key, this.conf.severity, fix));
    }
    return ret;
  }

  private suppressedbyPseudo(statement: StatementNode | undefined, file: ABAPFile): boolean {
    if (statement === undefined) {
      return false;
    }

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

////////////////////////////

  private getReferenced(): ReadonlySet<string> {
    if (this.referenced === undefined) {
      const referenced = new Set<string>();
      for (const o of this.reg.getObjects()) {
        if (!(o instanceof ABAPObject) || this.reg.isDependency(o)) {
          continue; // do not search in dependencies
        }
        const syntax = new SyntaxLogic(this.reg, o).run();
        this.collectReferenced(syntax.spaghetti.getTop(), referenced);
      }
      this.referenced = referenced;
    }
    return this.referenced;
  }

  /** same nodes and references as checkNode() with add = false */
  private collectReferenced(node: ISpaghettiScopeNode, referenced: Set<string>) {
    if (node.getIdentifier().stype !== ScopeType.BuiltIn) {
      for (const r of node.getData().references) {
        if (r.referenceType === ReferenceType.TypeReference && r.resolved) {
          referenced.add(WorkArea.buildKey(r.resolved));
        }
      }
    }

    for (const c of node.getChildren()) {
      this.collectReferenced(c, referenced);
    }
  }

  private traverse(node: ISpaghettiScopeNode, obj: ABAPObject, add: boolean) {

    if (node.getIdentifier().stype !== ScopeType.BuiltIn) {
      this.checkNode(node, obj, add);
    }

    for (const c of node.getChildren()) {
      this.traverse(c, obj, add);
    }

  }

  private checkNode(node: ISpaghettiScopeNode, obj: ABAPObject, add: boolean) {
    const ret: Issue[] = [];

    if (add === true) {
      const types = node.getData().types;
      for (const name in types) {
        const identifier = types[name];
        if (obj.containsFile(identifier.getFilename()) === false) {
          continue;
        } else if (this.conf.skipNames
            && this.conf.skipNames.length > 0
            && this.conf.skipNames.some((a) => a.toUpperCase() === name)) {
          continue;
        } else if (name !== identifier.getName().toUpperCase()) {
          continue; // may have aliases via interfaces
        }
        this.workarea.push(identifier);
      }
    }

    for (const r of node.getData().references) {
      if (r.referenceType === ReferenceType.TypeReference && r.resolved) {
        this.workarea.removeIfExists(r.resolved);
      }
    }

    return ret;
  }

  private buildFix(file: ABAPFile, statement: StatementNode): IEdit | undefined {
    if (statement.concatTokens().toUpperCase().includes("BEGIN OF")) {
      return undefined;
    }
    return EditHelper.deleteStatement(file, statement);
  }
}