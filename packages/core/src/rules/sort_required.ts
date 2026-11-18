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
import {ExpressionNode, StatementNode} from "../abap/nodes";
import {ABAPFile} from "../abap/abap_file";
import {ISpaghettiScope} from "../abap/5_syntax/_spaghetti_scope";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {Severity} from "../severity";

export class SortRequiredConf extends BasicRuleConfig {
  public severity?: Severity = Severity.Warning;
  /** Check READ TABLE ... WITH KEY ... BINARY SEARCH */
  public binarySearch: boolean = true;
  /** Check DELETE ADJACENT DUPLICATES ... COMPARING */
  public adjacentDuplicates: boolean = true;
}

type SortField = {name: string, descending: boolean};

/** what a statement that writes the table does to its order */
enum Fill {
  /** SELECT without ORDER BY, or APPEND, INSERT or COLLECT in such a SELECT loop: rows in no defined order */
  unordered,
  /** CLEAR, DELETE, MODIFY, SORT, and APPEND, INSERT or COLLECT elsewhere: the code can add the rows in order */
  none,
  /** anything else: the rows can come sorted from elsewhere */
  unknown,
}

export class SortRequired implements IRule {
  private reg: IRegistry;
  private conf = new SortRequiredConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "sort_required",
      title: "BINARY SEARCH or DELETE ADJACENT DUPLICATES without a matching SORT",
      shortDescription: `BINARY SEARCH or DELETE ADJACENT DUPLICATES ... COMPARING on a local table not sorted by those fields`,
      extendedInformation: `READ TABLE ... WITH KEY ... BINARY SEARCH only finds the row when the table is sorted ascending by
the key fields, in the order of the key. DELETE ADJACENT DUPLICATES ... COMPARING only removes all duplicates
when rows with equal values in the compared fields are next to each other. Neither statement checks the order:
on an unsorted table they give wrong results, without a dump.

Checked: a standard table declared with DATA in the method, form or function module, read with WITH KEY
and BINARY SEARCH, or with DELETE ADJACENT DUPLICATES ... COMPARING. Reported when
- the last SORT of the table before the statement is not by the key fields: for BINARY SEARCH they must be
  the first sort fields, in the same order and ascending; for COMPARING the first sort fields must be the
  compared fields, in any order. A SORT without BY uses the primary key.
- there is no SORT of the table before the statement, and it is filled by a SELECT without ORDER BY: the
  database returns the rows in no defined order.

Not reported: parameters, attributes, global and static variables, a table that can get its rows sorted
from elsewhere (an assignment, a method or function call, APPEND or INSERT LINES OF, SELECT ... ORDER BY)
after the SORT or, without a SORT, anywhere in the procedure, a table without SORT filled only by APPEND,
INSERT or COLLECT (the code can add the rows in order), sorted and hashed tables, SORT with STABLE or with
dynamic fields, a SORT later in a loop around the statement, a SORT without BY on a default key of a
structured row, WITH TABLE KEY, USING KEY, dynamic components and COMPARING ALL FIELDS.
See also sort_empty_key and sequential_read_sorted.`,
      tags: [RuleTag.SingleFile],
      badExample: `SORT lt_titles BY id.
DELETE ADJACENT DUPLICATES FROM lt_titles COMPARING spras id.
SELECT * FROM tadir INTO TABLE lt_tadir WHERE devclass = lv_package.
READ TABLE lt_tadir WITH KEY object = lv_type obj_name = lv_name BINARY SEARCH TRANSPORTING NO FIELDS.`,
      goodExample: `SORT lt_titles BY spras id.
DELETE ADJACENT DUPLICATES FROM lt_titles COMPARING spras id.
SELECT * FROM tadir INTO TABLE lt_tadir WHERE devclass = lv_package.
SORT lt_tadir BY object obj_name.
READ TABLE lt_tadir WITH KEY object = lv_type obj_name = lv_name BINARY SEARCH TRANSPORTING NO FIELDS.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public setConfig(conf: SortRequiredConf): void {
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
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        let table: ExpressionNode | undefined;
        let fields: string[] | undefined;
        let binary: boolean;
        if (statement.get() instanceof Statements.ReadTable && this.conf.binarySearch !== false) {
          binary = true;
          table = statement.getChildren().find(c => c instanceof ExpressionNode) as ExpressionNode | undefined;
          fields = this.readKey(statement);
        } else if (statement.get() instanceof Statements.DeleteInternal && this.conf.adjacentDuplicates !== false) {
          binary = false;
          table = statement.findDirectExpression(Expressions.Target);
          fields = this.comparing(statement);
        } else {
          continue;
        }
        if (table === undefined || fields === undefined || /^[\w/]+$/.test(table.concatTokens()) === false) {
          continue;
        }
        const name = table.concatTokens().toUpperCase();

        const start = this.procedureStart(i, statements);
        if (start === undefined) {
          continue;
        }
        const end = this.procedureEnd(i, statements);

        if (spaghetti === undefined) {
          spaghetti = new SyntaxLogic(this.reg, obj).run().spaghetti;
        }
        const id = this.findReference(table, spaghetti, file);
        const declaration = id === undefined ? undefined : this.findDeclaration(id, file, statements, start, i);
        const type = id?.getType();
        if (declaration === undefined || !(type instanceof TableType) || this.isStandard(type, declaration) === false) {
          continue;
        }

        const verb = binary ? "READ TABLE ... BINARY SEARCH" : "DELETE ADJACENT DUPLICATES ... COMPARING";
        const sortIndex = this.previousSort(name, statements, start, i);
        let message: string | undefined = undefined;
        if (sortIndex !== undefined) {
          const sortFields = this.sortFields(statements[sortIndex], type);
          if (sortFields !== undefined
              && this.matches(sortFields, fields, binary) === false
              && this.writtenUnknown(name, statements, sortIndex, i) === false) {
            const by = sortFields.map(f => f.name.toLowerCase() + (f.descending ? " DESCENDING" : "")).join(" ");
            message = `${verb} on ${table.concatTokens()} needs it sorted by ${fields.join(" ").toLowerCase()}, `
              + `the SORT before is by ${by}`;
          }
        } else if (this.sortedLaterInLoop(name, statements, start, i) === false
            && this.writtenUnknown(name, statements, start, end) === false
            && this.filledUnordered(name, statements, start, end) === true) {
          message = `${verb} on ${table.concatTokens()} needs it sorted by ${fields.join(" ").toLowerCase()}, `
            + `there is no SORT before`;
        }
        if (message !== undefined) {
          issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity));
        }
      }
    }

    return issues;
  }

////////////////

  /** the components of WITH KEY, for a READ TABLE ... BINARY SEARCH with a free key */
  private readKey(statement: StatementNode): string[] | undefined {
    if (statement.findDirectTokenByText("BINARY") === undefined
        || statement.findDirectTokenByText("USING") !== undefined
        || statement.findDirectTokenByText("COMPONENTS") !== undefined) {
      return undefined;
    }
    const tokens = statement.getTokens().map(t => t.getStr().toUpperCase());
    const withKey = tokens.findIndex((t, index) => t === "WITH" && tokens[index + 1] === "KEY");
    const compare = statement.findDirectExpression(Expressions.ComponentCompareSimple);
    if (withKey < 0 || compare === undefined || compare.findDirectExpression(Expressions.Dynamic) !== undefined) {
      return undefined;
    }
    return compare.findDirectExpressions(Expressions.ComponentChainSimple).map(c => c.concatTokens().toUpperCase());
  }

  /** the fields after COMPARING, for a DELETE ADJACENT DUPLICATES with static fields */
  private comparing(statement: StatementNode): string[] | undefined {
    if (statement.findDirectTokenByText("ADJACENT") === undefined
        || statement.findDirectTokenByText("USING") !== undefined
        || statement.findDirectTokenByText("ALL") !== undefined
        || statement.findDirectTokenByText("COMPARING") === undefined
        || statement.findDirectExpression(Expressions.Dynamic) !== undefined
        || statement.findDirectExpression(Expressions.FieldOffset) !== undefined
        || statement.findDirectExpression(Expressions.FieldLength) !== undefined) {
      return undefined;
    }
    return statement.findDirectExpressions(Expressions.SimpleFieldChain2).map(c => c.concatTokens().toUpperCase());
  }

  /** the sort fields of a SORT, undefined when not known */
  private sortFields(statement: StatementNode, type: TableType): SortField[] | undefined {
    if (statement.findDirectTokenByText("STABLE") !== undefined
        || statement.findDirectExpression(Expressions.Dynamic) !== undefined
        || statement.findDirectExpression(Expressions.SourceFieldSymbol) !== undefined) {
      return undefined;
    }
    const children = statement.getChildren();
    const by = children.findIndex(c => c.concatTokens().toUpperCase() === "BY");
    const descending = children.slice(0, by < 0 ? children.length : by)
      .some(c => c.concatTokens().toUpperCase() === "DESCENDING");

    if (by < 0) {
      return this.primaryKey(type)?.map(name => ({name, descending}));
    }

    const result: SortField[] = [];
    for (let j = by + 1; j < children.length; j++) {
      const child = children[j];
      const text = child.concatTokens().toUpperCase();
      if (child.get() instanceof Expressions.ComponentChain) {
        result.push({name: text, descending});
      } else if (text === "DESCENDING" && result.length > 0) {
        result[result.length - 1].descending = true;
      } else if (text === "ASCENDING" && result.length > 0) {
        result[result.length - 1].descending = false;
      }
    }
    return result;
  }

  /** the primary key components, undefined for a default key of a structured row or when not known */
  private primaryKey(type: TableType): string[] | undefined {
    const row = type.getRowType();
    if (row instanceof VoidType || row instanceof UnknownType || row.isGeneric()) {
      return undefined;
    }
    const keyType = type.getOptions().keyType;
    const fields = type.getOptions().primaryKey?.keyFields || [];
    if (keyType === TableKeyType.user && fields.length > 0) {
      return fields;
    } else if (keyType === TableKeyType.empty) {
      return [];
    }
    return row instanceof StructureType || row instanceof TableType ? undefined : ["TABLE_LINE"];
  }

  private matches(sortFields: SortField[], fields: string[], binary: boolean): boolean {
    if (sortFields.length < fields.length) {
      return false;
    }
    const first = sortFields.slice(0, fields.length);
    if (binary === true) {
      return first.every((f, index) => f.name === fields[index] && f.descending === false);
    }
    const names = first.map(f => f.name);
    return fields.every(f => names.includes(f));
  }

  /** index of the last SORT of the table before the statement, in the same procedure */
  private previousSort(name: string, statements: readonly StatementNode[], start: number, index: number): number | undefined {
    for (let i = index - 1; i > start; i--) {
      if (this.isSortOf(statements[i], name)) {
        return i;
      }
    }
    return undefined;
  }

  /** a SORT of the table after the statement but inside a loop around it runs before the next pass */
  private sortedLaterInLoop(name: string, statements: readonly StatementNode[], start: number, index: number): boolean {
    let outer: number | undefined = undefined;
    let depth = 0;
    for (let i = index - 1; i > start; i--) {
      if (this.endsLoop(statements[i])) {
        depth++;
      } else if (this.startsLoop(statements[i])) {
        if (depth === 0) {
          outer = i;
        } else {
          depth--;
        }
      }
    }
    if (outer === undefined) {
      return false;
    }
    depth = 0;
    for (let i = outer + 1; i < statements.length; i++) {
      const statement = statements[i];
      if (this.startsLoop(statement)) {
        depth++;
      } else if (this.endsLoop(statement)) {
        if (depth === 0) {
          return false;
        }
        depth--;
      } else if (i > index && this.isSortOf(statement, name)) {
        return true;
      }
    }
    return false;
  }

  private isSortOf(statement: StatementNode, name: string): boolean {
    return statement.get() instanceof Statements.Sort
      && statement.findDirectExpression(Expressions.Target)?.concatTokens().toUpperCase() === name;
  }

  /** true when a statement between from and to fills the table from a source that can be sorted */
  private writtenUnknown(name: string, statements: readonly StatementNode[], from: number, to: number): boolean {
    for (let i = from + 1; i < to; i++) {
      if (this.writes(statements[i], name) && this.fillKind(i, statements, name) === Fill.unknown) {
        return true;
      }
    }
    return false;
  }

  /** true when a statement in the procedure brings rows in no defined order */
  private filledUnordered(name: string, statements: readonly StatementNode[], start: number, end: number): boolean {
    for (let i = start + 1; i < end; i++) {
      if (this.writes(statements[i], name) && this.fillKind(i, statements, name) === Fill.unordered) {
        return true;
      }
    }
    return false;
  }

  private writes(statement: StatementNode, name: string): boolean {
    return statement.get() instanceof Statements.Data === false
      && statement.findAllExpressions(Expressions.Target).some(t => this.targetName(t) === name);
  }

  private targetName(target: ExpressionNode): string {
    const inline = target.findDirectExpression(Expressions.InlineData);
    if (inline !== undefined) {
      return inline.findDirectExpression(Expressions.TargetField)?.concatTokens().toUpperCase() || "";
    }
    return target.concatTokens().toUpperCase();
  }

  private fillKind(index: number, statements: readonly StatementNode[], name: string): Fill {
    const statement = statements[index];
    const s = statement.get();
    if (s instanceof Statements.Clear
        || s instanceof Statements.Refresh
        || s instanceof Statements.Free
        || s instanceof Statements.DeleteInternal
        || s instanceof Statements.ModifyInternal
        || s instanceof Statements.Sort) {
      return Fill.none;
    } else if (s instanceof Statements.Append || s instanceof Statements.InsertInternal || s instanceof Statements.Collect) {
      if (statement.findDirectTokenByText("LINES") !== undefined || statement.findDirectTokenByText("SORTED") !== undefined) {
        return Fill.unknown;
      }
      const loop = this.innermostLoop(index, statements);
      return loop !== undefined && this.selectsUnordered(loop) ? Fill.unordered : Fill.none;
    } else if (s instanceof Statements.Select || s instanceof Statements.SelectLoop) {
      const target = statement.findFirstExpression(Expressions.SQLIntoTable)?.findFirstExpression(Expressions.Target);
      return target !== undefined && this.targetName(target) === name && this.selectsUnordered(statement)
        ? Fill.unordered : Fill.unknown;
    }
    return Fill.unknown;
  }

  private selectsUnordered(statement: StatementNode): boolean {
    return (statement.get() instanceof Statements.Select || statement.get() instanceof Statements.SelectLoop)
      && statement.findFirstExpression(Expressions.SQLOrderBy) === undefined;
  }

  private innermostLoop(index: number, statements: readonly StatementNode[]): StatementNode | undefined {
    let depth = 0;
    for (let i = index - 1; i >= 0; i--) {
      if (this.endsLoop(statements[i])) {
        depth++;
      } else if (this.startsLoop(statements[i])) {
        if (depth === 0) {
          return statements[i];
        }
        depth--;
      }
    }
    return undefined;
  }

  /** the DATA statement or inline declaration of the table inside the procedure, before the statement;
   * parameters, attributes, globals and statics are declared elsewhere or with another statement */
  private findDeclaration(id: TypedIdentifier, file: ABAPFile, statements: readonly StatementNode[],
                          start: number, index: number): StatementNode | undefined {
    if (id.getFilename() !== file.getFilename()) {
      return undefined;
    }
    const position = id.getStart();
    for (let i = start + 1; i < index; i++) {
      const statement = statements[i];
      if (position.isBetween(statement.getStart(), statement.getEnd()) === false) {
        continue;
      }
      const inline = statement.findAllExpressions(Expressions.InlineData)
        .some(d => position.isBetween(d.getFirstToken().getStart(), d.getLastToken().getEnd()));
      return statement.get() instanceof Statements.Data || inline ? statement : undefined;
    }
    return undefined;
  }

  /** a standard table; the result of an inline SELECT has no access type set, it is a standard table */
  private isStandard(type: TableType, declaration: StatementNode): boolean {
    const access = type.getAccessType();
    if (access === undefined) {
      return declaration.get() instanceof Statements.Select || declaration.get() instanceof Statements.SelectLoop;
    }
    return access === TableAccessType.standard;
  }

  private findReference(node: ExpressionNode, spaghetti: ISpaghettiScope, file: ABAPFile): TypedIdentifier | undefined {
    const start = node.getFirstToken().getStart();
    const scope = spaghetti.lookupPosition(start, file.getFilename());
    for (const r of scope?.getData().references || []) {
      if (r.position.getStart().equals(start) && r.resolved instanceof TypedIdentifier) {
        return r.resolved;
      }
    }
    return undefined;
  }

  private procedureStart(index: number, statements: readonly StatementNode[]): number | undefined {
    for (let i = index - 1; i >= 0; i--) {
      const s = statements[i].get();
      if (s instanceof Statements.MethodImplementation
          || s instanceof Statements.Form
          || s instanceof Statements.FunctionModule
          || s instanceof Statements.Module) {
        return i;
      } else if (s instanceof Statements.EndMethod
          || s instanceof Statements.EndForm
          || s instanceof Statements.EndFunction
          || s instanceof Statements.EndModule) {
        return undefined;
      }
    }
    return undefined;
  }

  private procedureEnd(index: number, statements: readonly StatementNode[]): number {
    for (let i = index + 1; i < statements.length; i++) {
      const s = statements[i].get();
      if (s instanceof Statements.EndMethod
          || s instanceof Statements.EndForm
          || s instanceof Statements.EndFunction
          || s instanceof Statements.EndModule) {
        return i;
      }
    }
    return statements.length;
  }

  private startsLoop(statement: StatementNode): boolean {
    const s = statement.get();
    return s instanceof Statements.Loop
      || s instanceof Statements.Do
      || s instanceof Statements.While
      || s instanceof Statements.SelectLoop;
  }

  private endsLoop(statement: StatementNode): boolean {
    const s = statement.get();
    return s instanceof Statements.EndLoop
      || s instanceof Statements.EndDo
      || s instanceof Statements.EndWhile
      || s instanceof Statements.EndSelect;
  }

}
