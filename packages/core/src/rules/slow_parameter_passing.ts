import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {IRegistry} from "../_iregistry";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {ScopeType} from "../abap/5_syntax/_scope_type";
import {IdentifierMeta, TypedIdentifier} from "../abap/types/_typed_identifier";
import {Position} from "../position";
import {ReferenceType} from "../abap/5_syntax/_reference";

export class SlowParameterPassingConf extends BasicRuleConfig {
}

export class SlowParameterPassing implements IRule {
  private reg: IRegistry;
  private conf = new SlowParameterPassingConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "slow_parameter_passing",
      title: "Slow Parameter Passing",
      shortDescription: `Detects slow pass by value passing for methods where parameter is not changed`,
      extendedInformation: `Method parameters defined in interfaces is not checked`,
      tags: [RuleTag.Performance],
      badExample: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS bar IMPORTING VALUE(sdf) TYPE string.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD bar.
    WRITE sdf.
  ENDMETHOD.
ENDCLASS.`,
      goodExample: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS bar IMPORTING sdf TYPE string.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD bar.
    WRITE sdf.
  ENDMETHOD.
ENDCLASS.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SlowParameterPassingConf): void {
    this.conf = conf;
  }

  public initialize(reg: IRegistry): IRule {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): readonly Issue[] {
    const issues: Issue[] = [];

    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const top = new SyntaxLogic(this.reg, obj).run().spaghetti.getTop();
    const methods = this.listMethodNodes(top);

    for (const m of methods) {
      const vars = m.getData().vars;
      if (m.getIdentifier().sname.includes("~")) {
        // skip methods defined in interfaces
        // todo: checking for just "~" is not correct, there might be ALIASES
        continue;
      }
      for (const v in vars) {
        const id = vars[v];
        if (id.getMeta().includes(IdentifierMeta.PassByValue) === false) {
          continue;
        } else if (this.reg.isFileDependency(id.getFilename()) === true) {
          continue;
        }
        const writes = this.listWritePositions(m, id);
        if (writes.length === 0) {
          const message = "Parameter " + id.getName() + " passed by VALUE but not changed";

          issues.push(Issue.atIdentifier(id, message, this.getMetadata().key, this.getConfig().severity));
        }
      }
    }

    return issues;
  }

  private listWritePositions(node: ISpaghettiScopeNode, id: TypedIdentifier): Position[] {
    const ret: Position[] = [];

    for (const v of node.getData().references) {
      if (v.referenceType === ReferenceType.DataWriteReference
          && v.resolved?.getFilename() === id.getFilename()
          && v.resolved?.getStart().equals(id.getStart())) {
        ret.push(v.position.getStart());
      }
    }

    return ret;
  }

  private listMethodNodes(node: ISpaghettiScopeNode): ISpaghettiScopeNode[] {
    const ret: ISpaghettiScopeNode[] = [];

    if (node.getIdentifier().stype === ScopeType.Method) {
      ret.push(node);
    } else {
      for (const c of node.getChildren()) {
        ret.push(...this.listMethodNodes(c));
      }
    }

    return ret;
  }

}
