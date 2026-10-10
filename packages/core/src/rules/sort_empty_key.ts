import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {IRegistry} from "../_iregistry";
import {StructureType, TableAccessType, TableKeyType, TableType, UnknownType, VoidType} from "../abap/types/basic";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {ExpressionNode, StatementNode} from "../abap/nodes";
import {ABAPFile} from "../abap/abap_file";
import {ISpaghettiScope} from "../abap/5_syntax/_spaghetti_scope";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {Dash, InstanceArrow, Punctuation, StaticArrow} from "../abap/1_lexer/tokens";
import {Position} from "../position";
import {EditHelper, IEdit} from "../edit_helper";

export class SortEmptyKeyConf extends BasicRuleConfig {
}

export class SortEmptyKey implements IRule {
  private reg: IRegistry;
  private conf = new SortEmptyKeyConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "sort_empty_key",
      title: "SORT or DELETE ADJACENT DUPLICATES on a table with an empty key",
      shortDescription: `SORT without BY and DELETE ADJACENT DUPLICATES without COMPARING on a table with an empty primary key`,
      extendedInformation: `Without BY or COMPARING, both statements use the primary key of the table. For a table
declared WITH EMPTY KEY there is nothing to sort or compare by, SORT does nothing.

The syntax check warns: "ITAB is a table with an empty primary key. Check the semantics of the statement."

Sorted and hashed tables, tables with a default or explicit key, and tables of unknown or generic type are not reported.

The quick fix adds BY table_line or COMPARING table_line, for tables with an elementary row type.`,
      tags: [RuleTag.SingleFile, RuleTag.Quickfix],
      badExample: `DATA result TYPE STANDARD TABLE OF string WITH EMPTY KEY.
SORT result.
DELETE ADJACENT DUPLICATES FROM result.`,
      goodExample: `DATA result TYPE STANDARD TABLE OF string WITH EMPTY KEY.
SORT result BY table_line.
DELETE ADJACENT DUPLICATES FROM result COMPARING table_line.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public setConfig(conf: SortEmptyKeyConf): void {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof ABAPObject) || obj.getType() === "INTF") {
      return [];
    }

    const issues: Issue[] = [];
    let spaghetti: ISpaghettiScope | undefined = undefined;

    for (const file of obj.getABAPFiles()) {
      for (const statement of file.getStatements()) {
        let addition: string;
        if (statement.get() instanceof Statements.Sort) {
          if (statement.findDirectTokenByText("BY") !== undefined) {
            continue;
          }
          addition = "BY";
        } else if (statement.get() instanceof Statements.DeleteInternal) {
          if (statement.findDirectTokenByText("ADJACENT") === undefined
              || statement.findDirectTokenByText("COMPARING") !== undefined
              || statement.findDirectTokenByText("USING") !== undefined) {
            continue;
          }
          addition = "COMPARING";
        } else {
          continue;
        }

        const target = statement.findDirectExpression(Expressions.Target);
        if (target === undefined) {
          continue;
        }

        if (spaghetti === undefined) {
          spaghetti = new SyntaxLogic(this.reg, obj).run().spaghetti;
        }
        const type = this.findType(target, spaghetti, file);
        if (!(type instanceof TableType)
            || type.getOptions().keyType !== TableKeyType.empty
            || type.isGeneric()
            || (type.getAccessType() !== undefined && type.getAccessType() !== TableAccessType.standard)) {
          continue;
        }

        const verb = addition === "BY" ? "SORT without BY" : "DELETE ADJACENT DUPLICATES without COMPARING";
        const message = `${verb} on "${target.concatTokens()}", a table with an empty primary key`;
        const fix = this.buildFix(file, statement, type.getRowType(), addition);
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity, fix));
      }
    }

    return issues;
  }

////////////////

  /** The type of a target built from names, components and attributes only, else undefined */
  private findType(target: ExpressionNode, spaghetti: ISpaghettiScope, file: ABAPFile): AbstractType | undefined {
    let type: AbstractType | undefined = undefined;
    for (const child of target.getChildren()) {
      const get = child.get();
      if (get instanceof Expressions.TargetField
          || get instanceof Expressions.TargetFieldSymbol
          || get instanceof Expressions.AttributeName) {
        type = this.findReference(child.getFirstToken().getStart(), spaghetti, file)?.getType();
      } else if (get instanceof Expressions.ComponentName) {
        type = type instanceof StructureType ? type.getComponentByName(child.concatTokens()) : undefined;
      } else if (!(get instanceof Dash)
          && !(get instanceof InstanceArrow)
          && !(get instanceof StaticArrow)
          && !(get instanceof Expressions.ClassName)) {
        return undefined;
      }
      if (type === undefined && !(get instanceof Expressions.ClassName) && !(get instanceof StaticArrow)) {
        return undefined;
      }
    }
    return type;
  }

  private findReference(start: Position, spaghetti: ISpaghettiScope, file: ABAPFile) {
    const scope = spaghetti.lookupPosition(start, file.getFilename());
    for (const r of scope?.getData().references || []) {
      if (r.position.getStart().equals(start) && r.resolved instanceof TypedIdentifier) {
        return r.resolved;
      }
    }
    return undefined;
  }

  private buildFix(file: ABAPFile, statement: StatementNode, rowType: AbstractType, addition: string): IEdit | undefined {
    if (rowType instanceof StructureType
        || rowType instanceof TableType
        || rowType instanceof VoidType
        || rowType instanceof UnknownType
        || rowType.isGeneric()) {
      return undefined;
    }
    const tokens = statement.getTokens();
    let last = tokens[tokens.length - 1];
    if (last instanceof Punctuation) {
      last = tokens[tokens.length - 2];
    }
    return EditHelper.insertAt(file, last.getEnd(), ` ${addition} table_line`);
  }

}
