import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {Comment} from "../abap/2_statements/statements/_statement";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {hasKeyCompare} from "../abap/5_syntax/_key_compare";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {IRegistry} from "../_iregistry";
import {DataReference, StructureType, TableAccessType, TableKeyType, TableType} from "../abap/types/basic";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {ExpressionNode, StatementNode, TokenNode} from "../abap/nodes";
import {ABAPFile} from "../abap/abap_file";
import {ISpaghettiScope} from "../abap/5_syntax/_spaghetti_scope";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {Dash, InstanceArrow, StaticArrow} from "../abap/1_lexer/tokens";
import {Position} from "../position";
import {Severity} from "../severity";

export class SequentialReadSortedConf extends BasicRuleConfig {
  public severity?: Severity = Severity.Warning;
}

export class SequentialReadSorted implements IRule {
  private reg: IRegistry;
  private conf = new SequentialReadSortedConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "sequential_read_sorted",
      title: "Sequential read on a sorted table",
      shortDescription: `A WHERE condition or a free key on a sorted table that does not use the primary key`,
      extendedInformation: `A sorted table is read with a binary search only when the condition fixes an initial part of
its key. When the first key component is not compared with = or EQ (or IS INITIAL) in a part of the condition joined
by AND, every line is read, like on a standard table. The SAP check "Low Performance Operations on Internal Tables"
reports this as "Possible sequential read on a sorted table".

Checked: LOOP AT ... WHERE, DELETE ... WHERE, MODIFY ... WHERE, READ TABLE ... WITH KEY and table expressions
itab[ comp = ... ], on a table whose type is statically known as SORTED with explicit key components, using the
primary key.

Not checked: standard, hashed, generic and unknown table types, tables with a default key, a dynamic WHERE or
dynamic components, WITH TABLE KEY, a named key (USING KEY, KEY ... COMPONENTS) other than primary_key,
READ TABLE ... BINARY SEARCH and access by index, including LOOP AT and DELETE with FROM or TO.

Fix: compare the first key component with =, change the key or the table type, or add a secondary key.
If the sequential read is intended, add the pseudo comment "#EC CI_SORTSEQ to the statement.`,
      tags: [RuleTag.SingleFile, RuleTag.Performance],
      pseudoComment: "EC CI_SORTSEQ",
      badExample: `DATA lt_nodes TYPE SORTED TABLE OF ty_node WITH UNIQUE KEY path name.
LOOP AT lt_nodes INTO ls_node WHERE name = lv_name.
ENDLOOP.
DELETE lt_nodes WHERE path CP lv_pattern.`,
      goodExample: `DATA lt_nodes TYPE SORTED TABLE OF ty_node WITH UNIQUE KEY path name.
LOOP AT lt_nodes INTO ls_node WHERE path = lv_path AND name = lv_name.
ENDLOOP.
DELETE lt_nodes WHERE path CP lv_pattern. "#EC CI_SORTSEQ`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public setConfig(conf: SequentialReadSortedConf): void {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof ABAPObject) || obj.getType() === "INTF") {
      return [];
    }

    const issues: Issue[] = [];
    let spaghetti: ISpaghettiScope | undefined = undefined;

    for (const file of obj.getABAPFiles()) {
      const statements = file.getStatements();
      const pseudoRows = this.findPseudoCommentRows(statements);

      for (const statement of statements) {
        const get = statement.get();
        if (get instanceof Comment) {
          continue;
        }
        const isWhere = get instanceof Statements.Loop
          || get instanceof Statements.DeleteInternal
          || get instanceof Statements.ModifyInternal;
        const isRead = get instanceof Statements.ReadTable;
        if (isWhere === false
            && isRead === false
            && statement.findFirstExpression(Expressions.TableExpression) === undefined) {
          continue;
        }

        if (this.hasPseudoComment(statement, pseudoRows)) {
          continue;
        }

        if (spaghetti === undefined) {
          spaghetti = new SyntaxLogic(this.reg, obj).run().spaghetti;
        }

        if (isWhere === true) {
          this.checkWhere(statement, spaghetti, file, issues);
        } else if (isRead === true) {
          this.checkReadTable(statement, spaghetti, file, issues);
        }
        this.checkTableExpressions(statement, statement, spaghetti, file, issues);
      }
    }

    return issues;
  }

////////////////

  private findPseudoCommentRows(statements: readonly StatementNode[]): Set<number> {
    const rows = new Set<number>();
    for (const s of statements) {
      if (s.get() instanceof Comment && s.concatTokens().toUpperCase().includes(this.getMetadata().pseudoComment + "")) {
        rows.add(s.getStart().getRow());
      }
    }
    return rows;
  }

  /** the pseudo comment is accepted on any row of the statement */
  private hasPseudoComment(statement: StatementNode, pseudoRows: Set<number>): boolean {
    for (let row = statement.getStart().getRow(); row <= statement.getEnd().getRow(); row++) {
      if (pseudoRows.has(row)) {
        return true;
      }
    }
    return false;
  }

  /** LOOP AT, DELETE and MODIFY with a static WHERE condition */
  private checkWhere(statement: StatementNode, spaghetti: ISpaghettiScope, file: ABAPFile, issues: Issue[]) {
    const cond = statement.findDirectExpression(Expressions.ComponentCond);
    if (cond === undefined || this.usesPrimaryKey(statement) === false) {
      return;
    }

    let table: ExpressionNode | undefined;
    if (statement.get() instanceof Statements.Loop) {
      table = statement.findDirectExpression(Expressions.LoopSource)?.getFirstChild() as ExpressionNode | undefined;
    } else {
      table = statement.findDirectExpression(Expressions.Target);
    }
    if (table === undefined) {
      return;
    }
    if (!(statement.get() instanceof Statements.ModifyInternal)
        && (statement.findDirectTokenByText("FROM") !== undefined || statement.findDirectTokenByText("TO") !== undefined)) {
      // an index range
      return;
    }

    const first = this.firstKeyComponent(this.findType(table, spaghetti, file));
    if (first !== undefined && hasKeyCompare(cond, first) === false) {
      this.report(statement, table.concatTokens(), first, file, issues);
    }
  }

  private checkReadTable(statement: StatementNode, spaghetti: ISpaghettiScope, file: ABAPFile, issues: Issue[]) {
    if (statement.findTokenSequencePosition("WITH", "KEY") === undefined
        || statement.findDirectTokenByText("COMPONENTS") !== undefined
        || statement.findDirectTokenByText("BINARY") !== undefined) {
      return;
    }
    const compare = statement.findDirectExpression(Expressions.ComponentCompareSimple);
    const table = statement.findDirectExpression(Expressions.SimpleSource2) ?? statement.findDirectExpression(Expressions.Source);
    if (compare === undefined || table === undefined) {
      return;
    }

    const first = this.firstKeyComponent(this.findType(table, spaghetti, file));
    if (first !== undefined && this.hasFreeKeyComponent(compare, first) === false) {
      this.report(statement, table.concatTokens(), first, file, issues);
    }
  }

  /** table expressions with a free key, itab[ comp = ... ], anywhere in the statement */
  private checkTableExpressions(node: StatementNode | ExpressionNode, statement: StatementNode,
                                spaghetti: ISpaghettiScope, file: ABAPFile, issues: Issue[]) {
    const children = node.getChildren();
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child instanceof TokenNode) {
        continue;
      }
      if (child.get() instanceof Expressions.TableExpression
          && child instanceof ExpressionNode
          && (node.get() instanceof Expressions.FieldChain || node.get() instanceof Expressions.Target)
          && child.getChildren()[1]?.get() instanceof Expressions.ComponentChainSimple) {
        // a free key, not an index and not a named key: KEY name [COMPONENTS]
        const first = this.firstKeyComponent(this.findChainType(children.slice(0, i), spaghetti, file));
        if (first !== undefined && this.hasFreeKeyComponent(child, first) === false) {
          const name = children.slice(0, i).map(c => c.concatTokens()).join("");
          this.report(statement, name, first, file, issues);
        }
      }
      this.checkTableExpressions(child, statement, spaghetti, file, issues);
    }
  }

  private report(statement: StatementNode, name: string, first: string, file: ABAPFile, issues: Issue[]) {
    const message = `Sequential read on sorted table ${name}, the first key component ${first} is not compared with =, ` +
      `add it to the condition or "#EC CI_SORTSEQ`;
    issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity));
  }

  /** false if USING KEY names a key other than the primary key, or a dynamic one */
  private usesPrimaryKey(statement: StatementNode): boolean {
    if (statement.findDirectTokenByText("USING") === undefined) {
      return true;
    }
    const keyName = statement.findExpressionAfterToken("KEY");
    return keyName?.get() instanceof Expressions.SimpleName && keyName.concatTokens().toUpperCase() === "PRIMARY_KEY";
  }

  /** true if a free key, ComponentCompareSimple or the fields of a TableExpression, specifies the component;
   *  also true when a component is dynamic, as it cannot be decided */
  private hasFreeKeyComponent(node: ExpressionNode, component: string): boolean {
    if (node.findDirectExpression(Expressions.Dynamic) !== undefined) {
      return true;
    }
    return node.findDirectExpressions(Expressions.ComponentChainSimple)
      .some(c => c.concatTokens().toUpperCase().replace(/\s+/g, "") === component);
  }

  /** The first component of the primary key of a sorted table with explicit key components, else undefined */
  private firstKeyComponent(type: AbstractType | undefined): string | undefined {
    if (!(type instanceof TableType)
        || type.getAccessType() !== TableAccessType.sorted
        || type.getOptions().keyType !== TableKeyType.user
        || type.isGeneric()) {
      return undefined;
    }
    return type.getOptions().primaryKey?.keyFields[0]?.toUpperCase();
  }

  private findType(node: ExpressionNode, spaghetti: ISpaghettiScope, file: ABAPFile): AbstractType | undefined {
    if (!(node.get() instanceof Expressions.Target)) {
      const chain = node.getChildren().length === 1 ? node.findDirectExpression(Expressions.FieldChain) : undefined;
      if (chain === undefined) {
        return undefined;
      }
      node = chain;
    }
    return this.findChainType(node.getChildren(), spaghetti, file);
  }

  /** The type of a chain of names, components, attributes, dereferences and table expressions, else undefined */
  private findChainType(children: readonly (ExpressionNode | TokenNode)[],
                        spaghetti: ISpaghettiScope, file: ABAPFile): AbstractType | undefined {
    let type: AbstractType | undefined = undefined;
    for (const child of children) {
      const get = child.get();
      if (get instanceof Expressions.SourceField
          || get instanceof Expressions.SourceFieldSymbol
          || get instanceof Expressions.TargetField
          || get instanceof Expressions.TargetFieldSymbol
          || get instanceof Expressions.AttributeName) {
        type = this.findReference(child.getFirstToken().getStart(), spaghetti, file)?.getType();
      } else if (get instanceof Expressions.ComponentName) {
        type = type instanceof StructureType ? type.getComponentByName(child.concatTokens()) : undefined;
      } else if (get instanceof Expressions.Dereference) {
        type = type instanceof DataReference ? type.getType() : undefined;
      } else if (get instanceof Expressions.TableExpression) {
        type = type instanceof TableType ? type.getRowType() : undefined;
      } else if (get instanceof Expressions.ClassName || get instanceof StaticArrow) {
        continue;
      } else if (!(get instanceof Dash) && !(get instanceof InstanceArrow)) {
        return undefined;
      }
      if (type === undefined) {
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

}
