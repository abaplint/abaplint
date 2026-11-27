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
  /** Also report READ TABLE, DELETE TABLE and MODIFY TABLE ... FROM wa, which address a row through the empty primary key */
  public tableKeyAccess: boolean = true;
}

export class SortEmptyKey implements IRule {
  private reg: IRegistry;
  private conf = new SortEmptyKeyConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "sort_empty_key",
      title: "Statement uses the empty primary key of a table",
      shortDescription: `SORT without BY, DELETE ADJACENT DUPLICATES without COMPARING and
READ TABLE, DELETE TABLE and MODIFY TABLE ... FROM wa on a table with an empty primary key`,
      extendedInformation: `Without BY or COMPARING, SORT and DELETE ADJACENT DUPLICATES use the primary key of the table. For a table
declared WITH EMPTY KEY there is nothing to sort or compare by, SORT does nothing.

READ TABLE itab FROM wa, DELETE TABLE itab FROM wa and MODIFY TABLE itab FROM wa search the row by the primary key.
With an empty key there is nothing to compare, the first row of the table is read, deleted or modified, whatever wa contains.
This part can be switched off with tableKeyAccess, there is no quick fix for it.

The syntax check warns: "ITAB is a table with an empty primary key. Check the semantics of the statement."
https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abenitab_empty_key.htm

Sorted and hashed tables, tables with a default or explicit key, and tables of unknown or generic type are not reported.

The quick fix adds BY table_line or COMPARING table_line, for tables with an elementary row type.`,
      tags: [RuleTag.SingleFile, RuleTag.Quickfix],
      badExample: `DATA result TYPE STANDARD TABLE OF string WITH EMPTY KEY.
SORT result.
DELETE ADJACENT DUPLICATES FROM result.
DELETE TABLE result FROM \`foo\`.`,
      goodExample: `DATA result TYPE STANDARD TABLE OF string WITH EMPTY KEY.
SORT result BY table_line.
DELETE ADJACENT DUPLICATES FROM result COMPARING table_line.
DELETE result WHERE table_line = \`foo\`.`,
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
        // the addition the quick fix adds, undefined for the access through the table key
        let addition: string | undefined = undefined;
        let verb: string;
        if (statement.get() instanceof Statements.Sort) {
          if (statement.findDirectTokenByText("BY") !== undefined) {
            continue;
          }
          addition = "BY";
          verb = "SORT without BY";
        } else if (this.conf.tableKeyAccess === true && this.isTableKeyAccess(statement)) {
          verb = statement.getFirstToken().getStr().toUpperCase() + " TABLE ... FROM";
        } else if (statement.get() instanceof Statements.DeleteInternal) {
          if (statement.findDirectTokenByText("ADJACENT") === undefined
              || statement.findDirectTokenByText("COMPARING") !== undefined
              || statement.findDirectTokenByText("USING") !== undefined) {
            continue;
          }
          addition = "COMPARING";
          verb = "DELETE ADJACENT DUPLICATES without COMPARING";
        } else {
          continue;
        }

        // the table is a Target, only in READ TABLE it is a source, the third child after READ and TABLE
        let target = statement.findDirectExpression(Expressions.Target);
        if (statement.get() instanceof Statements.ReadTable) {
          const source = statement.getChildren()[2];
          const chain = source instanceof ExpressionNode ? source.getFirstChild() : undefined;
          target = chain instanceof ExpressionNode
            && chain.get() instanceof Expressions.FieldChain
            && source.getChildren().length === 1 ? chain : undefined;
        }
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

        let message = `${verb} on "${target.concatTokens()}", a table with an empty primary key`;
        if (addition === undefined) {
          message += ", always finds the first row";
        }
        const fix = addition ? this.buildFix(file, statement, type.getRowType(), addition) : undefined;
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity, fix));
      }
    }

    return issues;
  }

////////////////

  /** READ TABLE itab FROM wa, DELETE TABLE itab FROM wa and MODIFY TABLE itab FROM wa, all three use the primary key */
  private isTableKeyAccess(statement: StatementNode): boolean {
    const get = statement.get();
    if (!(get instanceof Statements.ReadTable)
        && !(get instanceof Statements.DeleteInternal)
        && !(get instanceof Statements.ModifyInternal)) {
      return false;
    }
    // without TABLE, FROM is an index (DELETE itab FROM idx) or the row is found by index (MODIFY itab FROM wa)
    return statement.findDirectTokenByText("TABLE") !== undefined
      && statement.findDirectTokenByText("FROM") !== undefined
      && statement.findDirectTokenByText("INDEX") === undefined
      && statement.findDirectTokenByText("USING") === undefined;
  }

  /** The type of a target or field chain built from names, components and attributes only, else undefined */
  private findType(target: ExpressionNode, spaghetti: ISpaghettiScope, file: ABAPFile): AbstractType | undefined {
    let type: AbstractType | undefined = undefined;
    for (const child of target.getChildren()) {
      const get = child.get();
      if (get instanceof Expressions.TargetField
          || get instanceof Expressions.TargetFieldSymbol
          || get instanceof Expressions.SourceField
          || get instanceof Expressions.SourceFieldSymbol
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
