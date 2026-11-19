import * as Expressions from "../2_statements/expressions";
import * as Statements from "../2_statements/statements";
import * as Structures from "../3_structures/structures";
import {ExpressionNode, StatementNode, StructureNode} from "../nodes";
import {Dash, InstanceArrow} from "../1_lexer/tokens";
import {TypedIdentifier} from "../types/_typed_identifier";
import {ObjectReferenceType, StructureType, TableAccessType, TableKeyType, TableType, UnknownType, VoidType} from "../types/basic";
import {AbstractType} from "../types/basic/_abstract_type";
import {Position} from "../../position";
import {ObjectOriented} from "./_object_oriented";
import {CurrentScope} from "./_current_scope";
import {SyntaxInput, syntaxIssue} from "./_syntax_input";

type Binding = {
  /** the primary key components, or "line" when the key is the whole line */
  key: string[] | "line",
  reference: boolean,
  /** the LOOP statement that assigned it, the binding ends with the LOOP */
  loop: StatementNode | undefined,
};

/** The key components of the primary key of a sorted or hashed table line are write-protected,
 *  "write accesses to key fields using a field symbol or a data reference produce a syntax error if
 *  this is known statically, otherwise a runtime error", see the ABAP keyword documentation for LOOP AT itab
 *  and READ TABLE, result.
 *  Only conservative cases are handled: a field symbol or data reference local to the method, form or function
 *  module, bound by LOOP AT or READ TABLE ... ASSIGNING / REFERENCE INTO a table named by a plain chain of
 *  names, components and attributes, and written by an assignment or CLEAR. The binding of a LOOP ends with the LOOP,
 *  any other assignment of the field symbol or reference ends it as well. */
export class SortedKeyWrite {
  private readonly bindings = new Map<TypedIdentifier, Binding>();
  private procedure: {filename: string, start: Position} | undefined = undefined;

  public enter(node: StructureNode, filename: string): void {
    if (SortedKeyWrite.isProcedure(node)) {
      this.bindings.clear();
      this.procedure = {filename, start: node.getFirstToken().getStart()};
    }
  }

  public leave(node: StructureNode): void {
    if (SortedKeyWrite.isProcedure(node)) {
      this.bindings.clear();
      this.procedure = undefined;
    } else if (node.get() instanceof Structures.Loop) {
      const loop = node.findDirectStatement(Statements.Loop);
      for (const [identifier, binding] of this.bindings) {
        if (binding.loop === loop) {
          this.bindings.delete(identifier);
        }
      }
    }
  }

  /** call before the statement is checked */
  public check(node: StatementNode, input: SyntaxInput): void {
    if (this.bindings.size === 0) {
      return;
    }
    const s = node.get();
    if (!(s instanceof Statements.Move) && !(s instanceof Statements.Clear)) {
      return;
    }

    for (const target of node.findDirectExpressions(Expressions.Target)) {
      const message = this.checkTarget(target, input.scope);
      if (message !== undefined) {
        input.issues.push(syntaxIssue(input, target.getFirstToken(), message));
        return;
      }
    }
  }

  /** call after the statement is checked, the inline declarations are then known */
  public update(node: StatementNode, input: SyntaxInput): void {
    if (this.procedure === undefined) {
      return;
    }

    // any assignment of a field symbol or reference ends its binding,
    // skipped when nothing is bound, this runs for every statement
    if (this.bindings.size > 0) {
      for (const fs of node.findAllExpressions(Expressions.FSTarget)) {
        this.unbind(fs.findFirstExpression(Expressions.TargetFieldSymbol), input.scope);
      }
      if (node.get() instanceof Statements.Unassign) {
        this.unbind(node.findDirectExpression(Expressions.TargetFieldSymbol), input.scope);
      }
      for (const target of node.findAllExpressions(Expressions.Target)) {
        if (target.getChildren().length === 1) {
          this.unbind(target.findDirectExpression(Expressions.TargetField), input.scope);
        }
      }
    }

    const s = node.get();
    let table: ExpressionNode | undefined = undefined;
    let result: ExpressionNode | undefined = undefined;
    if (s instanceof Statements.Loop && node.findDirectExpression(Expressions.LoopGroupBy) === undefined) {
      table = node.findDirectExpression(Expressions.LoopSource)?.findDirectExpression(Expressions.SimpleSource2)
        ?? node.findDirectExpression(Expressions.LoopSource)?.findDirectExpression(Expressions.Source);
      result = node.findDirectExpression(Expressions.LoopTarget);
    } else if (s instanceof Statements.ReadTable) {
      table = node.findDirectExpression(Expressions.SimpleSource2) ?? node.findDirectExpression(Expressions.Source);
      result = node.findDirectExpression(Expressions.ReadTableTarget);
    }
    if (table === undefined || result === undefined
        || result.findDirectTokenByText("CASTING") !== undefined
        || node.findDirectTokenByText("CASTING") !== undefined) {
      return;
    }

    let name: ExpressionNode | undefined = undefined;
    let reference = false;
    if (result.findDirectTokenByText("ASSIGNING") !== undefined) {
      name = result.findDirectExpression(Expressions.FSTarget)?.findFirstExpression(Expressions.TargetFieldSymbol);
    } else if (result.findDirectTokenByText("REFERENCE") !== undefined) {
      const target = result.findDirectExpression(Expressions.Target);
      if (target?.getChildren().length === 1) {
        name = target.findDirectExpression(Expressions.TargetField)
          ?? target.findDirectExpression(Expressions.InlineData)?.findDirectExpression(Expressions.TargetField);
      }
      reference = true;
    }
    const identifier = input.scope.findVariable(name?.concatTokens());
    if (identifier === undefined
        || identifier.getFilename() !== this.procedure.filename
        || identifier.getStart().isBefore(this.procedure.start)) {
      return;
    }

    const key = SortedKeyWrite.findKey(SortedKeyWrite.findType(table, input.scope));
    if (key !== undefined) {
      this.bindings.set(identifier, {key, reference, loop: s instanceof Statements.Loop ? node : undefined});
    }
  }

////////////////

  private unbind(node: ExpressionNode | undefined, scope: CurrentScope): void {
    const found = node ? scope.findVariable(node.concatTokens()) : undefined;
    if (found !== undefined) {
      this.bindings.delete(found);
    }
  }

  private checkTarget(target: ExpressionNode, scope: CurrentScope): string | undefined {
    const children = target.getChildren();
    const first = children[0];
    if (!(first?.get() instanceof Expressions.TargetFieldSymbol) && !(first?.get() instanceof Expressions.TargetField)) {
      return undefined;
    }
    const found = scope.findVariable(first.concatTokens());
    const binding = found ? this.bindings.get(found) : undefined;
    if (binding === undefined) {
      return undefined;
    }

    let i = 1;
    const path: string[] = [];
    if (binding.reference === true) {
      if (children[i]?.get() instanceof InstanceArrow && children[i + 1]?.get() instanceof Expressions.AttributeName) {
        path.push(children[i + 1].concatTokens().toUpperCase());
        i = i + 2;
      } else if (children[i]?.get() instanceof Expressions.Dereference) {
        i = i + 1;
      } else {
        // the reference itself
        return undefined;
      }
    }
    for (; i < children.length; i++) {
      const get = children[i].get();
      if (get instanceof Dash && children[i + 1]?.get() instanceof Expressions.ComponentName) {
        path.push(children[i + 1].concatTokens().toUpperCase());
        i++;
      } else if (!(get instanceof Expressions.FieldOffset) && !(get instanceof Expressions.FieldLength)) {
        return undefined;
      }
    }

    if (binding.key === "line") {
      return "The line of a sorted or hashed table cannot be changed, it is the table key";
    }
    const name = path.join("-");
    if (name !== "" && binding.key.some(k => k === name || k.startsWith(name + "-") || name.startsWith(k + "-"))) {
      return `Key component "${name}" of a sorted or hashed table line cannot be changed`;
    }
    return undefined;
  }

  /** the primary key components of a sorted or hashed table, "line" when it is the whole line, else undefined */
  private static findKey(type: AbstractType | undefined): string[] | "line" | undefined {
    if (!(type instanceof TableType)
        || (type.getAccessType() !== TableAccessType.sorted && type.getAccessType() !== TableAccessType.hashed)) {
      return undefined;
    }
    const row = type.getRowType();
    if (row instanceof VoidType || row instanceof UnknownType || row.isGeneric()) {
      return undefined;
    }
    const keyType = type.getOptions().keyType;
    const fields = type.getOptions().primaryKey?.keyFields || [];
    if (keyType === TableKeyType.default) {
      // the default key of a structured line is not resolved
      return row instanceof StructureType ? undefined : "line";
    } else if (keyType !== TableKeyType.user || fields.length === 0) {
      return undefined;
    } else if (fields.includes("TABLE_LINE")) {
      return "line";
    }
    return fields;
  }

  /** the type of a table given by a plain chain of names, components and attributes, else undefined */
  private static findType(node: ExpressionNode, scope: CurrentScope): AbstractType | undefined {
    const chain = node.getChildren().length === 1 ? node.findDirectExpression(Expressions.FieldChain) : undefined;
    const children = chain?.getChildren() || [];
    const first = children[0];
    if (!(first?.get() instanceof Expressions.SourceField) && !(first?.get() instanceof Expressions.SourceFieldSymbol)) {
      return undefined;
    }

    let type = scope.findVariable(first.concatTokens())?.getType();
    for (let i = 1; i < children.length && type !== undefined; i++) {
      const get = children[i].get();
      const next = children[i + 1];
      if (get instanceof Dash && next?.get() instanceof Expressions.ComponentName) {
        type = type instanceof StructureType ? type.getComponentByName(next.concatTokens()) : undefined;
        i++;
      } else if (get instanceof InstanceArrow && next?.get() instanceof Expressions.AttributeName) {
        const def = type instanceof ObjectReferenceType ? scope.findObjectDefinition(type.getIdentifierName()) : undefined;
        type = new ObjectOriented(scope).searchAttributeName(def, next.concatTokens())?.getType();
        i++;
      } else if (!(get instanceof Expressions.TableBody) || i !== children.length - 1) {
        return undefined;
      }
    }
    return type;
  }

  private static isProcedure(node: StructureNode): boolean {
    const get = node.get();
    return get instanceof Structures.Method || get instanceof Structures.Form || get instanceof Structures.FunctionModule;
  }
}
