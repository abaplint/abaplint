import * as Expressions from "../2_statements/expressions";
import * as Statements from "../2_statements/statements";
import * as Structures from "../3_structures/structures";
import {ExpressionNode, StatementNode, StructureNode} from "../nodes";
import {Dash, InstanceArrow} from "../1_lexer/tokens";
import {IdentifierMeta, TypedIdentifier} from "../types/_typed_identifier";
import {DataReference, ObjectReferenceType, StructureType, TableAccessType, TableKeyType, TableType, UnknownType, VoidType} from "../types/basic";
import {AbstractType} from "../types/basic/_abstract_type";
import {Position} from "../../position";
import {ObjectOriented} from "./_object_oriented";
import {CurrentScope} from "./_current_scope";
import {SyntaxInput, syntaxIssue} from "./_syntax_input";

type Binding = {
  /** the primary key components, or "line" when the key is the whole line */
  key: string[] | "line",
  reference: boolean,
  loop?: StatementNode,
  block?: StructureNode,
  iterationDepth?: number,
};

type Procedure = {
  filename: string,
  start: Position,
  exposedReferences?: Set<TypedIdentifier>,
  dynamicAddress?: boolean,
};

const repeatingStructures = new Set<object>([
  Structures.Do, Structures.While, Structures.Loop, Structures.LoopAtScreen, Structures.LoopExtract,
  Structures.Select, Structures.With, Structures.Provide, Structures.Try,
]);

/** The key components of the primary key of a sorted or hashed table line are write-protected,
 *  "write accesses to key fields using a field symbol or a data reference produce a syntax error if
 *  this is known statically, otherwise a runtime error", see the ABAP keyword documentation for LOOP AT itab
 *  and READ TABLE, result.
 *  Only conservative cases are handled: a field symbol or data reference local to the method, form or function
 *  module, bound by LOOP AT, READ TABLE or APPEND ... ASSIGNING / REFERENCE INTO a table named by a plain chain of
 *  names, components and attributes, and written by an assignment or CLEAR. LOOP bindings end with the LOOP.
 *  APPEND bindings stay in their block. A write inside a loop needs a binding made in that iteration. */
export class SortedKeyWrite {
  private readonly bindings = new Map<TypedIdentifier, Binding>();
  private readonly appends = new Map<TypedIdentifier, Binding>();
  private readonly appendBlocks = new Map<StructureNode, Set<TypedIdentifier>>();
  private readonly resumableTries = new Set<StructureNode>();
  private iterationDepth = 0;
  private procedure: Procedure | undefined = undefined;

  public enter(node: StructureNode, filename: string): void {
    if (SortedKeyWrite.isProcedure(node)) {
      this.bindings.clear();
      this.procedure = {filename, start: node.getFirstToken().getStart()};
    } else if (this.procedure && repeatingStructures.has(node.get().constructor)) {
      this.iterationDepth++;
      if (node.get() instanceof Structures.Try && node.findDirectStructures(Structures.Catch).some(handler =>
        handler.findDirectStatement(Statements.Catch)?.findDirectTokenByText("BEFORE") !== undefined)) {
        this.resumableTries.add(node);
      }
    }
  }

  public leave(node: StructureNode): void {
    if (SortedKeyWrite.isProcedure(node)) {
      this.bindings.clear();
      this.appends.clear();
      this.appendBlocks.clear();
      this.resumableTries.clear();
      this.iterationDepth = 0;
      this.procedure = undefined;
    } else if (this.bindings.size > 0 && node.get() instanceof Structures.Loop) {
      const loop = node.findDirectStatement(Statements.Loop);
      for (const [identifier, binding] of this.bindings) {
        if (binding.loop === loop) {
          this.bindings.delete(identifier);
        }
      }
    }
    if (this.procedure && repeatingStructures.has(node.get().constructor)) {
      this.iterationDepth--;
      this.resumableTries.delete(node);
    }
    const appends = this.appendBlocks.get(node);
    if (appends !== undefined) {
      for (const identifier of appends) {
        if (this.appends.get(identifier)?.block === node) {
          this.appends.delete(identifier);
        }
      }
      this.appendBlocks.delete(node);
    }
  }

  /** call before the statement is checked */
  public check(node: StatementNode, input: SyntaxInput): void {
    if (this.appends.size > 0 && node.get() instanceof Statements.AssignLocalCopy) {
      const name = node.findDirectExpression(Expressions.TargetFieldSymbol)?.concatTokens();
      const identifier = input.scope.findVariable(name);
      if (identifier !== undefined) {
        this.appends.delete(identifier);
      }
    }
    if (this.bindings.size > 0) {
      this.checkWrites(node, input, this.bindings);
    }
  }

  private checkWrites(node: StatementNode, input: SyntaxInput, bindings: ReadonlyMap<TypedIdentifier, Binding>): void {
    const s = node.get();
    if (!(s instanceof Statements.Move) && !(s instanceof Statements.Clear)) {
      return;
    }

    const directTargets = node.findDirectExpressions(Expressions.Target);
    const chained = bindings === this.appends && directTargets.length > 1;
    // A chained assignment can replace the reference before a target to its left uses it.
    const targets = chained ? [...directTargets].reverse() : directTargets;
    for (const target of targets) {
      const first = target.getChildren()[0];
      if (!(first?.get() instanceof Expressions.TargetFieldSymbol) && !(first?.get() instanceof Expressions.TargetField)) {
        continue;
      }
      const identifier = input.scope.findVariable(first.concatTokens());
      const binding = identifier === undefined ? undefined : bindings.get(identifier);
      if (identifier === undefined || binding === undefined
          || (binding.iterationDepth !== undefined && binding.iterationDepth !== this.iterationDepth)) {
        continue;
      }
      if (chained && binding.reference && target.getChildren().length === 1) {
        this.appends.delete(identifier);
        continue;
      }
      const message = this.checkTarget(target, binding);
      if (message !== undefined) {
        const issue = syntaxIssue(input, target.getFirstToken(), message);
        const procedure = this.procedure;
        if (binding.reference && binding.iterationDepth !== undefined && binding.iterationDepth > 0 && procedure !== undefined) {
          // An address taken later in the body can survive into the next iteration.
          input.deferred.push(() => {
            if (procedure.dynamicAddress !== true && procedure.exposedReferences?.has(identifier) !== true) {
              input.issues.push(issue);
            }
          });
        } else {
          input.issues.push(issue);
        }
        return;
      }
    }
  }

  /** call after the statement is checked, the inline declarations are then known */
  public update(node: StatementNode, input: SyntaxInput, block: StructureNode, valid: boolean): void {
    const procedure = this.procedure;
    if (procedure === undefined) {
      return;
    }
    const s = node.get();
    if (valid && this.appends.size > 0) {
      this.checkWrites(node, input, this.appends);
    }

    // any assignment of a field symbol or reference ends its binding,
    // skipped when nothing is bound, this runs for every statement
    if (this.bindings.size > 0 || this.appends.size > 0) {
      for (const fs of node.findAllExpressions(Expressions.FSTarget)) {
        this.unbind(fs.findFirstExpression(Expressions.TargetFieldSymbol), input.scope);
      }
      if (s instanceof Statements.Unassign) {
        this.unbind(node.findDirectExpression(Expressions.TargetFieldSymbol), input.scope);
      }
      for (const target of node.findAllExpressions(Expressions.Target)) {
        if (target.getChildren().length === 1) {
          this.unbind(target.findDirectExpression(Expressions.TargetField), input.scope, !(s instanceof Statements.Perform));
        }
      }
    }

    let table: ExpressionNode | undefined = undefined;
    let result: ExpressionNode | StatementNode | undefined = undefined;
    if (s instanceof Statements.Loop && node.findDirectExpression(Expressions.LoopGroupBy) === undefined) {
      table = node.findDirectExpression(Expressions.LoopSource)?.findDirectExpression(Expressions.SimpleSource2)
        ?? node.findDirectExpression(Expressions.LoopSource)?.findDirectExpression(Expressions.Source);
      result = node.findDirectExpression(Expressions.LoopTarget);
    } else if (s instanceof Statements.ReadTable) {
      table = node.findDirectExpression(Expressions.SimpleSource2) ?? node.findDirectExpression(Expressions.Source);
      result = node.findDirectExpression(Expressions.ReadTableTarget);
    } else if (s instanceof Statements.Append && valid && this.resumableTries.size === 0
        && node.findDirectTokenByText("TO") !== undefined
        && node.findDirectTokenByText("LINES") === undefined) {
      table = node.findDirectExpression(Expressions.Target);
      result = node;
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
      const target = result.findExpressionAfterToken("INTO");
      if (target?.getChildren().length === 1) {
        name = target.findDirectExpression(Expressions.TargetField)
          ?? target.findDirectExpression(Expressions.InlineData)?.findDirectExpression(Expressions.TargetField);
      }
      reference = true;
    }
    const identifier = input.scope.findVariable(name?.concatTokens());
    if (identifier === undefined
        || identifier.getFilename() !== procedure.filename
        || identifier.getStart().isBefore(procedure.start)) {
      return;
    }

    const key = SortedKeyWrite.findKey(SortedKeyWrite.findType(table, input.scope));
    if (key === undefined) {
      return;
    }
    if (s instanceof Statements.Append) {
      const meta = identifier.getMeta();
      if (reference && (!(identifier.getType() instanceof DataReference)
          || procedure.dynamicAddress || procedure.exposedReferences?.has(identifier)
          || (!meta.includes(IdentifierMeta.PassByValue) && (meta.includes(IdentifierMeta.FormParameter)
            || meta.includes(IdentifierMeta.FunctionModuleExporting) || meta.includes(IdentifierMeta.FunctionModuleChanging)
            || meta.includes(IdentifierMeta.MethodChanging) || meta.includes(IdentifierMeta.MethodExporting))))) {
        return;
      }
      this.appends.set(identifier, {key, reference, block, iterationDepth: this.iterationDepth});
      let appends = this.appendBlocks.get(block);
      if (appends === undefined) {
        appends = new Set();
        this.appendBlocks.set(block, appends);
      }
      appends.add(identifier);
    } else {
      this.bindings.set(identifier, {key, reference, loop: s instanceof Statements.Loop ? node : undefined});
    }
  }

////////////////

  public readonly referenceMayChange = (operand: ExpressionNode | undefined, scope: CurrentScope, addressEscapes = true): void => {
    const procedure = this.procedure;
    if (procedure === undefined) {
      return;
    }
    if (operand?.get() instanceof Expressions.Dynamic) {
      procedure.dynamicAddress = true;
      for (const [identifier, binding] of this.appends) {
        if (binding.reference) {
          this.appends.delete(identifier);
        }
      }
      return;
    }
    if (operand?.getChildren().length !== 1) {
      return;
    }
    const target = operand.findDirectExpression(Expressions.TargetField)
      ?? operand.findDirectExpression(Expressions.InlineData)?.findDirectExpression(Expressions.TargetField);
    const chain = operand.findDirectExpression(Expressions.FieldChain);
    const name = target?.concatTokens()
      ?? (chain?.getChildren().length === 1 ? chain.findDirectExpression(Expressions.SourceField)?.concatTokens() : undefined);
    const identifier = scope.findVariable(name);
    if (identifier?.getType() instanceof DataReference) {
      if (addressEscapes) {
        (procedure.exposedReferences ??= new Set()).add(identifier);
      }
      this.appends.delete(identifier);
    }
  };

  public markStatic(identifier: TypedIdentifier | undefined): void {
    if (this.procedure !== undefined && identifier?.getType() instanceof DataReference) {
      (this.procedure.exposedReferences ??= new Set()).add(identifier);
    }
  }

  private unbind(node: ExpressionNode | undefined, scope: CurrentScope, append = true): void {
    const found = node ? scope.findVariable(node.concatTokens()) : undefined;
    if (found !== undefined) {
      this.bindings.delete(found);
      if (append) {
        this.appends.delete(found);
      }
    }
  }

  private checkTarget(target: ExpressionNode, binding: Binding): string | undefined {
    const children = target.getChildren();

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
    const chain = node.get() instanceof Expressions.Target ? node
      : node.getChildren().length === 1 ? node.findDirectExpression(Expressions.FieldChain) : undefined;
    const children = chain?.getChildren() || [];
    const first = children[0];
    if (!(first?.get() instanceof Expressions.SourceField) && !(first?.get() instanceof Expressions.SourceFieldSymbol)
        && !(first?.get() instanceof Expressions.TargetField) && !(first?.get() instanceof Expressions.TargetFieldSymbol)) {
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
