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

class WorkArea {
  private readonly workarea: TypedIdentifier[] = [];

  public push(id: TypedIdentifier) {
    for (const w of this.workarea) {
      if (id.equals(w)) {
        return;
      }
    }
    this.workarea.push(id);
  }

  public removeIfExists(id: Identifier) {
    for (let i = 0; i < this.workarea.length; i++) {
      if (id.equals(this.workarea[i])) {
        this.workarea.splice(i, 1);
        return;
      }
    }
  }

  public get(): readonly TypedIdentifier[] {
    return this.workarea;
  }

  public count(): number {
    return this.workarea.length;
  }
}

function removeDuplicates(list: readonly TypedIdentifier[]): readonly TypedIdentifier[] {
  const deduplicated: TypedIdentifier[] = [];
  for (const result of list) {
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

export class UnusedTypesConf extends BasicRuleConfig {
  /** skip specific names, case insensitive */
  public skipNames: string[] = [];
}

export class UnusedTypes implements IRule {
  private conf = new UnusedTypesConf();
  private reg: IRegistry;
  private workarea: WorkArea;

  public getMetadata(): IRuleMetadata {
    return {
      key: "unused_types",
      title: "Unused types",
      shortDescription: `Checks for unused TYPE definitions`,
      tags: [RuleTag.Quickfix],
      pragma: "##NEEDED",
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
    return this;
  }

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
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

    for (const o of this.reg.getObjects()) {
      if (o instanceof ABAPObject) {
        if (this.reg.isDependency(o)) {
          continue; // do not search in dependencies
        }
        const syntax = new SyntaxLogic(this.reg, o).run();
        this.traverse(syntax.spaghetti.getTop(), o, false);
      }
      if (this.workarea.count() === 0) {
        return []; // exit early if all types are used
      }
    }

    // what is left is unused
    const ret: Issue[] = [];
    for (const t of removeDuplicates(this.workarea.get())) {
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
      }

      const fix = this.buildFix(file, statement);
      ret.push(Issue.atIdentifier(t, message, this.getMetadata().key, this.conf.severity, fix));
    }
    return ret;
  }

////////////////////////////

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
        } else if (this.conf.skipNames?.length > 0
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