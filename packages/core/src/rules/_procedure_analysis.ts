import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {MacroCall, MacroContent, MacroRecursion, NativeSQL, Unknown} from "../abap/2_statements/statements/_statement";
import {IStatement} from "../abap/2_statements/statements/_statement";
import {IStructure} from "../abap/3_structures/structures/_structure";
import {AbstractToken} from "../abap/1_lexer/tokens/abstract_token";
import {Dash, Identifier as IdentifierToken} from "../abap/1_lexer/tokens";
import {IReference, ReferenceType} from "../abap/5_syntax/_reference";
import {ISpaghettiScope, ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ExpressionNode, StatementNode, StructureNode, TokenNode} from "../abap/nodes";
import {Identifier} from "../abap/4_file_information/_identifier";
import {IdentifierMeta, TypedIdentifier} from "../abap/types/_typed_identifier";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {CharacterType, DataReference, ObjectReferenceType, StructureType, TableType, UnknownType, VoidType} from "../abap/types/basic";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject} from "../objects/_abap_object";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {EditHelper, IEdit, ITextEdit} from "../edit_helper";
import {Position} from "../position";

// Shared analysis for the rules that remove redundant code around local variables:
// clear_after_declaration, unnecessary_copy, constant_condition, copy_chain, copy_of_initial_variable,
// bound_check_after_create, boolean_flag_via_if, alias_never_reassigned, single_use_expression_temp
// and try_cast_empty_catch.
//
// Everything is derived from the syntax tree and the resolved references of the syntax check,
// statements are never matched as text.

export enum OccurrenceKind {
  /** the value is read, or only used to reach a referenced object (ref->attr, ref->*) */
  Read = "read",
  /** the variable itself is changed */
  Write = "write",
  /** address taken, field symbol binding, USING/TABLES, dynamic, type reference, or a statement
   * that is not known to only read its operands */
  Escape = "escape",
}

export interface IOccurrence {
  readonly token: AbstractToken;
  readonly statement: StatementNode;
  readonly index: number;
  readonly kind: OccurrenceKind;
}

export class Variable {
  public readonly identifier: TypedIdentifier;
  /** declaring statement in the procedure: DATA, or the statement containing the inline declaration */
  public readonly declaration: StatementNode | undefined;
  /** the declaration is DATA(name) */
  public readonly inline: boolean;
  /** references in the procedure, in source order, without the inline declaration itself */
  public readonly occurrences: readonly IOccurrence[];
  /** all tokens in the procedure with the variable name are known references or the declaration */
  public readonly complete: boolean;

  public constructor(identifier: TypedIdentifier, declaration: StatementNode | undefined, inline: boolean,
                     occurrences: IOccurrence[], complete: boolean) {
    this.identifier = identifier;
    this.declaration = declaration;
    this.inline = inline;
    this.occurrences = occurrences;
    this.complete = complete;
  }

  /** declared by DATA, or inline, in the procedure; not a parameter, attribute or STATICS */
  public isLocal(): boolean {
    return this.declaration !== undefined;
  }

  public reads(): IOccurrence[] {
    return this.occurrences.filter(o => o.kind === OccurrenceKind.Read);
  }

  public writes(): IOccurrence[] {
    return this.occurrences.filter(o => o.kind === OccurrenceKind.Write);
  }

  public escapes(): boolean {
    return this.occurrences.some(o => o.kind === OccurrenceKind.Escape);
  }
}

interface IStatementInfo {
  index: number;
  /** the Body structure the statement belongs to, for IF/ENDIF etc. the Body around the IF structure */
  block: StructureNode | undefined;
  /** Body structures from the procedure body down to block */
  blockPath: readonly StructureNode[];
  /** innermost structure that can execute the statement repeatedly */
  loop: StructureNode | undefined;
  /** the statement is a direct child of a Normal structure, ie. not the header or footer of a block */
  simple: boolean;
}

/** References of one object, after a successful syntax check */
export class ObjectAnalysis {
  public readonly obj: ABAPObject;
  public readonly spaghetti: ISpaghettiScope;
  public readonly procedures: Procedure[] = [];
  private readonly byResolved = new Map<string, IReference[]>();
  private readonly byPosition = new Map<string, IReference[]>();

  /** returns undefined if the object is not supported, or has syntax errors */
  public static run(reg: IRegistry, obj: IObject): ObjectAnalysis | undefined {
    if (!(obj instanceof ABAPObject)) {
      return undefined;
    }
    // Neither macro expansion nor unknown statements have reliable references.
    for (const file of obj.getABAPFiles()) {
      for (const statement of file.getStatements()) {
        const type = statement.get();
        if (type instanceof Unknown || type instanceof Statements.Define
            || type instanceof MacroCall || type instanceof MacroContent || type instanceof MacroRecursion) {
          return undefined;
        }
      }
    }
    const syntax = new SyntaxLogic(reg, obj).run();
    if (syntax.issues.length > 0) {
      return undefined;
    }
    return new ObjectAnalysis(obj, syntax.spaghetti);
  }

  private constructor(obj: ABAPObject, spaghetti: ISpaghettiScope) {
    this.obj = obj;
    this.spaghetti = spaghetti;
    const stack: ISpaghettiScopeNode[] = [spaghetti.getTop()];
    while (stack.length > 0) {
      const node = stack.pop()!;
      for (const reference of node.getData().references) {
        const position = ObjectAnalysis.key(reference.position);
        const atPosition = this.byPosition.get(position) || [];
        atPosition.push(reference);
        this.byPosition.set(position, atPosition);
        if (reference.resolved !== undefined) {
          const resolved = ObjectAnalysis.key(reference.resolved);
          const list = this.byResolved.get(resolved) || [];
          list.push(reference);
          this.byResolved.set(resolved, list);
        }
      }
      stack.push(...node.getChildren());
    }

    for (const file of obj.getABAPFiles()) {
      const structure = file.getStructure();
      if (structure === undefined) {
        continue;
      }
      for (const procedure of findStructures(structure, [Structures.Method, Structures.Form, Structures.FunctionModule])) {
        this.procedures.push(new Procedure(this, file, procedure));
      }
    }
  }

  public static key(identifier: Identifier): string {
    const start = identifier.getStart();
    return identifier.getFilename() + "," + start.getRow() + "," + start.getCol();
  }

  public static tokenKey(filename: string, token: AbstractToken): string {
    return filename + "," + token.getRow() + "," + token.getCol();
  }

  public referencesTo(identifier: Identifier): readonly IReference[] {
    return this.byResolved.get(ObjectAnalysis.key(identifier)) || [];
  }

  public referencesAt(filename: string, token: AbstractToken): readonly IReference[] {
    return this.byPosition.get(ObjectAnalysis.tokenKey(filename, token)) || [];
  }

  /** all resolved identifiers, with the positions of their references */
  public allReferences(): IterableIterator<[string, IReference[]]> {
    return this.byResolved.entries();
  }
}

const LOOPS: (new () => IStructure)[] = [Structures.Loop, Structures.Do, Structures.While, Structures.Select,
  Structures.Provide, Structures.LoopAtScreen, Structures.LoopExtract, Structures.With];

/** Statements whose data read references are known to only read the value */
const READING: (new () => IStatement)[] = [Statements.Move, Statements.Call, Statements.If, Statements.ElseIf,
  Statements.Case, Statements.When, Statements.While, Statements.Check, Statements.Assert, Statements.Append,
  Statements.InsertInternal, Statements.ModifyInternal, Statements.DeleteInternal, Statements.ReadTable,
  Statements.Loop, Statements.CreateObject, Statements.Raise, Statements.Message, Statements.Concatenate,
  Statements.Split, Statements.Condense, Statements.Translate, Statements.Replace, Statements.Find,
  Statements.Select, Statements.SelectLoop, Statements.Do, Statements.Write, Statements.Collect,
  Statements.Describe, Statements.Shift, Statements.Return, Statements.Clear, Statements.Sort,
  Statements.InsertDatabase, Statements.ModifyDatabase, Statements.UpdateDatabase, Statements.DeleteDatabase];

/** Statements which cannot run other ABAP code, unless they contain a method call or NEW */
const CALL_FREE: (new () => IStatement)[] = [Statements.Move, Statements.Data, Statements.Clear, Statements.Free,
  Statements.Append, Statements.InsertInternal, Statements.ModifyInternal, Statements.DeleteInternal,
  Statements.ReadTable, Statements.Sort, Statements.Concatenate, Statements.Condense, Statements.Split,
  Statements.Translate, Statements.Replace, Statements.Find, Statements.Shift, Statements.Collect,
  Statements.Describe, Statements.FieldSymbol, Statements.Constant, Statements.Type, Statements.Unassign,
  Statements.If, Statements.ElseIf, Statements.Else, Statements.EndIf, Statements.Case, Statements.When,
  Statements.WhenOthers, Statements.EndCase, Statements.Do, Statements.EndDo, Statements.While, Statements.EndWhile,
  Statements.Loop, Statements.EndLoop, Statements.Check, Statements.Exit, Statements.Continue, Statements.Return,
  Statements.Try, Statements.Catch, Statements.Cleanup, Statements.EndTry];

/** A METHOD, FORM or FUNCTION implementation */
export class Procedure {
  public readonly analysis: ObjectAnalysis;
  public readonly file: ABAPFile;
  public readonly structure: StructureNode;
  /** all statements, including METHOD and ENDMETHOD */
  public readonly statements: StatementNode[] = [];
  /** false if the procedure contains dynamic parts, includes, test seams, enhancements or native SQL */
  public readonly supported: boolean;
  private readonly info = new Map<StatementNode, IStatementInfo>();
  private readonly parents = new Map<StructureNode | StatementNode, StructureNode>();
  private readonly names = new Map<string, Set<string>>();
  private readonly declarations = new Map<string, StatementNode>();
  private readonly variables = new Map<string, Variable | undefined>();
  private own: [Identifier, IReference[]][] | undefined = undefined;

  public constructor(analysis: ObjectAnalysis, file: ABAPFile, structure: StructureNode) {
    this.analysis = analysis;
    this.file = file;
    this.structure = structure;
    this.walk(structure, [], undefined, false);
    this.supported = this.isSupported();
    if (this.supported === false) {
      return;
    }

    for (const statement of this.statements) {
      const tokens = statement.getTokens();
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const previous = tokens[i - 1];
        if (!(token instanceof IdentifierToken)
            || (previous !== undefined && (previous.getStr() === "->" || previous.getStr() === "=>"
            || previous.getStr() === "~" || previous instanceof Dash))) {
          continue;
        }
        const name = token.getStr().toLowerCase();
        const set = this.names.get(name) || new Set<string>();
        set.add(this.tokenKey(token));
        this.names.set(name, set);
      }

      const type = statement.get();
      if (type instanceof Statements.Data && this.isSimple(statement)) {
        const name = statement.findDirectExpression(Expressions.DataDefinition)
          ?.findDirectExpression(Expressions.DefinitionName)?.getFirstToken();
        if (name !== undefined) {
          this.declarations.set(this.tokenKey(name), statement);
        }
      }
      if (!(type instanceof Statements.Form)) {
        for (const inline of statement.findAllExpressionsRecursive(Expressions.InlineData)) {
          const name = inline.findDirectExpression(Expressions.TargetField)?.getFirstToken();
          if (name !== undefined) {
            this.declarations.set(this.tokenKey(name), statement);
          }
        }
      }
    }
  }

  public getStart(): Position {
    return this.structure.getFirstToken().getStart();
  }

  public getEnd(): Position {
    return this.structure.getLastToken().getEnd();
  }

  public contains(identifier: Identifier): boolean {
    return identifier.getFilename() === this.file.getFilename()
      && !identifier.getStart().isBefore(this.getStart())
      && !identifier.getStart().isAfter(this.getEnd());
  }

  public tokenKey(token: AbstractToken): string {
    return ObjectAnalysis.tokenKey(this.file.getFilename(), token);
  }

  public index(statement: StatementNode): number {
    return this.info.get(statement)?.index ?? -1;
  }

  public block(statement: StatementNode): StructureNode | undefined {
    return this.info.get(statement)?.block;
  }

  public loop(statement: StatementNode): StructureNode | undefined {
    return this.info.get(statement)?.loop;
  }

  /** a direct statement of its block, not the start, middle or end of a nested structure */
  public isSimple(statement: StatementNode): boolean {
    return this.info.get(statement)?.simple === true;
  }

  /** first executes before second, on every path that reaches second within one iteration:
   * the block of first contains second, and first is before second */
  public dominates(first: StatementNode, second: StatementNode): boolean {
    const a = this.info.get(first);
    const b = this.info.get(second);
    return a !== undefined && b !== undefined && a.block !== undefined
      && a.index < b.index && b.blockPath.includes(a.block);
  }

  public sameLoop(first: StatementNode, second: StatementNode): boolean {
    return this.loop(first) === this.loop(second);
  }

  /** statements strictly between two statements of the same block,
   * undefined if any of them is not a direct statement of that block */
  public straightBetween(first: StatementNode, second: StatementNode): StatementNode[] | undefined {
    const a = this.info.get(first);
    const b = this.info.get(second);
    if (a === undefined || b === undefined || a.block === undefined || a.block !== b.block || a.index >= b.index) {
      return undefined;
    }
    const between = this.statements.slice(a.index + 1, b.index);
    for (const statement of between) {
      if (this.block(statement) !== a.block || this.isSimple(statement) === false) {
        return undefined;
      }
    }
    return between;
  }

  /** the IF structure of an IF or ELSEIF statement */
  public ifStructure(statement: StatementNode): StructureNode | undefined {
    let parent = this.parents.get(statement);
    if (statement.get() instanceof Statements.ElseIf && parent !== undefined) {
      parent = this.parents.get(parent);
    }
    return parent?.get() instanceof Structures.If ? parent : undefined;
  }

  /** the variable for an identifier referenced in this procedure,
   * undefined for identifiers without data references, e.g. types or methods */
  public variable(identifier: Identifier | undefined): Variable | undefined {
    if (!(identifier instanceof TypedIdentifier)) {
      return undefined;
    }
    const key = ObjectAnalysis.key(identifier);
    if (this.variables.has(key)) {
      return this.variables.get(key);
    }

    const declaration = this.contains(identifier) ? this.declarations.get(key) : undefined;
    const inline = declaration !== undefined && !(declaration.get() instanceof Statements.Data);
    const occurrences: IOccurrence[] = [];
    const known = new Set<string>([key]);
    for (const reference of this.analysis.referencesTo(identifier)) {
      if (!this.contains(reference.position)) {
        continue;
      }
      const token = reference.position.getToken();
      known.add(this.tokenKey(token));
      if (inline && reference.position.getStart().equals(identifier.getStart())
          && reference.referenceType === ReferenceType.DataWriteReference) {
        continue;
      }
      const statement = this.statementOf(token);
      if (statement === undefined) {
        this.variables.set(key, undefined);
        return undefined;
      }
      occurrences.push({token, statement, index: this.index(statement), kind: this.classify(reference, statement)});
    }
    // several references at the same position, e.g. read and write in LOOP AT itab ASSIGNING
    occurrences.sort((a, b) => a.token.getStart().isBefore(b.token.getStart()) ? -1
      : a.token.getStart().equals(b.token.getStart()) ? 0 : 1);
    const merged: IOccurrence[] = [];
    for (const occurrence of occurrences) {
      const last = merged[merged.length - 1];
      if (last !== undefined && last.token.getStart().equals(occurrence.token.getStart())) {
        if (last.kind !== occurrence.kind) {
          merged[merged.length - 1] = {...last, kind: rank(last.kind) > rank(occurrence.kind) ? last.kind : occurrence.kind};
        }
        continue;
      }
      merged.push(occurrence);
    }

    let complete = true;
    for (const position of this.names.get(identifier.getName().toLowerCase()) || []) {
      if (!known.has(position)) {
        complete = false;
      }
    }
    const variable = new Variable(identifier, declaration, inline, merged, complete);
    this.variables.set(key, variable);
    return variable;
  }

  /** local variable, declared in the procedure by DATA or inline, and with all its references understood */
  public local(identifier: Identifier | undefined): Variable | undefined {
    const variable = this.variable(identifier);
    if (variable === undefined || variable.isLocal() === false || variable.complete === false
        || variable.identifier.getMeta().includes(IdentifierMeta.Static)) {
      return undefined;
    }
    return variable;
  }

  /** all local variables declared in the procedure */
  public locals(): Variable[] {
    const ret: Variable[] = [];
    for (const statement of this.statements) {
      for (const token of this.declaredIn(statement)) {
        const variable = this.local(this.identifierAt(token) ?? this.declaredIdentifier(token));
        if (variable !== undefined) {
          ret.push(variable);
        }
      }
    }
    return ret;
  }

  /** the resolved identifier of the data reference at the token, if any */
  public identifierAt(token: AbstractToken): Identifier | undefined {
    for (const reference of this.analysis.referencesAt(this.file.getFilename(), token)) {
      if (reference.referenceType === ReferenceType.DataReadReference
          || reference.referenceType === ReferenceType.DataWriteReference) {
        return reference.resolved;
      }
    }
    return undefined;
  }

  /** the identifier declared at the token, also when it is never referenced */
  public declaredIdentifier(token: AbstractToken): TypedIdentifier | undefined {
    const found = this.analysis.spaghetti.lookupPosition(token.getStart(), this.file.getFilename())
      ?.findVariable(token.getStr());
    return found !== undefined && found.getFilename() === this.file.getFilename()
      && found.getStart().equals(token.getStart()) ? found : undefined;
  }

  /** identifiers declared in the procedure, with all their references */
  public ownReferences(): [Identifier, IReference[]][] {
    if (this.own === undefined) {
      this.own = [];
      for (const [, references] of this.analysis.allReferences()) {
        const resolved = references[0].resolved;
        if (resolved !== undefined && this.contains(resolved)) {
          this.own.push([resolved, references]);
        }
      }
    }
    return this.own;
  }

  public statementOf(token: AbstractToken): StatementNode | undefined {
    // statement ends are increasing, also for chained statements which share their first tokens
    let low = 0;
    let high = this.statements.length;
    const start = token.getStart();
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (this.statements[middle].getEnd().isBefore(start)) {
        low = middle + 1;
      } else {
        high = middle;
      }
    }
    for (let i = low; i < this.statements.length && !start.isBefore(this.statements[i].getStart()); i++) {
      if (this.statements[i].includesToken(token)) {
        return this.statements[i];
      }
    }
    return undefined;
  }

  /** the statement cannot run other ABAP code: no method, function or form call, no constructor, no event */
  public isCallFree(statement: StatementNode): boolean {
    const type = statement.get();
    if (!CALL_FREE.some(t => type instanceof t)) {
      return false;
    }
    for (const call of statement.findAllExpressionsRecursive(Expressions.MethodCall)) {
      const name = call.findDirectExpression(Expressions.MethodName)?.getFirstToken();
      if (name === undefined) {
        return false;
      }
      const references = this.analysis.referencesAt(this.file.getFilename(), name);
      if (references.length === 0 || references.some(r => r.referenceType !== ReferenceType.BuiltinMethodReference)) {
        return false;
      }
    }
    return statement.findFirstExpression(Expressions.NewObject) === undefined;
  }

  /** every data write in the statement goes to a local variable, a pass-by-value parameter or the
   * RETURNING parameter, ie. memory that no other data object, field symbol or reference can share */
  public writesOnlyPrivate(statement: StatementNode): boolean {
    const tokens = statement.getTokens();
    for (let i = 0; i < tokens.length; i++) {
      for (const reference of this.analysis.referencesAt(this.file.getFilename(), tokens[i])) {
        if (reference.referenceType !== ReferenceType.DataWriteReference) {
          continue;
        }
        if (tokens[i + 1]?.getStr() === "->") {
          return false;
        }
        const variable = this.variable(reference.resolved);
        if (variable === undefined || variable.escapes()) {
          return false;
        }
        const meta = variable.identifier.getMeta();
        if (!variable.isLocal() && !meta.includes(IdentifierMeta.MethodReturning)
            && !meta.includes(IdentifierMeta.PassByValue)) {
          return false;
        }
      }
    }
    // writes without any reference, e.g. to field symbols assigned dynamically, are not expected after the
    // syntax check, but field symbol targets are excluded explicitly
    return statement.findFirstExpression(Expressions.TargetFieldSymbol) === undefined
      && statement.findFirstExpression(Expressions.Dereference) === undefined;
  }

  /** declaration name tokens in the statement */
  private declaredIn(statement: StatementNode): AbstractToken[] {
    const ret: AbstractToken[] = [];
    for (const token of statement.getTokens()) {
      if (this.declarations.get(this.tokenKey(token)) === statement) {
        ret.push(token);
      }
    }
    return ret;
  }

  private classify(reference: IReference, statement: StatementNode): OccurrenceKind {
    if (reference.referenceType !== ReferenceType.DataReadReference
        && reference.referenceType !== ReferenceType.DataWriteReference) {
      return OccurrenceKind.Escape;
    }
    const token = reference.position.getToken();
    const tokens = statement.getTokens();
    const index = tokens.findIndex(t => t.getStart().equals(token.getStart()));
    if (index < 0) {
      return OccurrenceKind.Escape;
    }
    const path = expressionPath(statement, token);
    if (path.some(e => e.get() instanceof Expressions.Dynamic)) {
      return OccurrenceKind.Escape;
    }
    if (tokens[index + 1]?.getStr() === "->") {
      // the reference itself is not changed, nor exposed, only the object or data it points to
      return OccurrenceKind.Read;
    }
    if (reference.referenceType === ReferenceType.DataWriteReference) {
      return OccurrenceKind.Write;
    }
    const type = statement.get();
    if (!READING.some(t => type instanceof t)
        || statement.findFirstExpression(Expressions.FSTarget) !== undefined
        || statement.findTokenSequencePosition("REFERENCE", "INTO") !== undefined
        || path.some(e => e.get() instanceof Expressions.Source && isRefConstructor(e))) {
      return OccurrenceKind.Escape;
    }
    return OccurrenceKind.Read;
  }

  private isSupported(): boolean {
    for (const statement of this.statements) {
      const type = statement.get();
      if (type instanceof Statements.Include || type instanceof NativeSQL
          || type instanceof Statements.TestSeam || type instanceof Statements.TestInjection
          || type instanceof Statements.Enhancement || type instanceof Statements.EnhancementSection
          || type instanceof Statements.ExecSQL
          || statement.findFirstExpression(Expressions.Dynamic) !== undefined) {
        return false;
      }
    }
    return true;
  }

  private walk(node: StructureNode, blockPath: StructureNode[], loop: StructureNode | undefined, simple: boolean) {
    const type = node.get();
    if (type instanceof Structures.Body) {
      blockPath = [...blockPath, node];
    } else if (LOOPS.some(l => type instanceof l) || (type instanceof Structures.Try && retries(node))) {
      loop = node;
    }
    for (const child of node.getChildren()) {
      this.parents.set(child as StructureNode | StatementNode, node);
      if (child instanceof StructureNode) {
        this.walk(child, blockPath, loop, child.get() instanceof Structures.Normal);
      } else if (child instanceof StatementNode) {
        this.info.set(child, {
          index: this.statements.length,
          block: blockPath[blockPath.length - 1],
          blockPath,
          loop,
          simple: simple && type instanceof Structures.Normal,
        });
        this.statements.push(child);
      }
    }
  }
}

function rank(kind: OccurrenceKind): number {
  return kind === OccurrenceKind.Escape ? 2 : kind === OccurrenceKind.Write ? 1 : 0;
}

/** RETRY and RESUME jump back into the TRY block, as does a CATCH BEFORE UNWIND handler */
function retries(node: StructureNode): boolean {
  return node.findAllStatements(Statements.Retry).length > 0
    || node.findAllStatements(Statements.Resume).length > 0
    || node.findAllStatements(Statements.Catch).some(c => c.findDirectTokenByText("UNWIND") !== undefined);
}

function isRefConstructor(source: ExpressionNode): boolean {
  const first = source.getChildren()[0];
  return first instanceof TokenNode && first.getFirstToken().getStr().toUpperCase() === "REF"
    && source.findDirectExpression(Expressions.TypeNameOrInfer) !== undefined;
}

export function findStructures(node: StructureNode, types: (new () => IStructure)[]): StructureNode[] {
  if (types.some(t => node.get() instanceof t)) {
    return [node];
  }
  const ret: StructureNode[] = [];
  for (const child of node.getChildren()) {
    if (child instanceof StructureNode) {
      ret.push(...findStructures(child, types));
    }
  }
  return ret;
}

/** expression nodes from the statement down to the token */
export function expressionPath(statement: StatementNode, token: AbstractToken): ExpressionNode[] {
  const ret: ExpressionNode[] = [];
  let children = statement.getChildren();
  for (;;) {
    let next: ExpressionNode | undefined = undefined;
    for (const child of children) {
      if (child instanceof ExpressionNode
          && !token.getStart().isBefore(child.getFirstToken().getStart())
          && !child.getLastToken().getStart().isBefore(token.getStart())
          && child.getTokens().some(t => t.getStart().equals(token.getStart()))) {
        next = child;
        break;
      }
    }
    if (next === undefined) {
      return ret;
    }
    ret.push(next);
    children = next.getChildren();
  }
}

////////////////////////////////////////
// statement shapes

export interface IPlainMove {
  target: ExpressionNode;
  source: ExpressionNode;
  /** "=" or "?=" */
  operator: string;
}

/** target = source. or target ?= source. without chaining, pragmas or MOVE */
export function plainMove(statement: StatementNode): IPlainMove | undefined {
  if (!(statement.get() instanceof Statements.Move) || statement.getColon() !== undefined
      || statement.getPragmas().length > 0) {
    return undefined;
  }
  const target = statement.findDirectExpression(Expressions.Target);
  const source = statement.findDirectExpression(Expressions.Source);
  const tokens = statement.getTokens();
  if (target === undefined || source === undefined
      || tokens.length !== target.countTokens() + source.countTokens() + 2) {
    return undefined;
  }
  const operator = tokens[target.countTokens()].getStr();
  if (operator !== "=" && operator !== "?=") {
    return undefined;
  }
  return {target, source, operator};
}

/** the source is a single field, ie. one token */
export function singleField(source: ExpressionNode): AbstractToken | undefined {
  if (source.getChildren().length !== 1 || source.countTokens() !== 1) {
    return undefined;
  }
  const field = source.findDirectExpression(Expressions.FieldChain)?.findDirectExpression(Expressions.SourceField);
  return field?.getFirstToken();
}

/** the target is a single field, ie. one token, not an inline declaration */
export function singleTarget(target: ExpressionNode): AbstractToken | undefined {
  if (target.countTokens() !== 1 || target.findDirectExpression(Expressions.TargetField) === undefined) {
    return undefined;
  }
  return target.getFirstToken();
}

/** CLEAR name. without chaining or WITH */
export function plainClear(statement: StatementNode): AbstractToken | undefined {
  if (!(statement.get() instanceof Statements.Clear) || statement.getPragmas().length > 0) {
    return undefined;
  }
  const targets = statement.findDirectExpressions(Expressions.Target);
  const tokens = statement.getTokens();
  if (targets.length !== 1 || tokens.length !== 3 || tokens[0].getStr().toUpperCase() !== "CLEAR") {
    return undefined;
  }
  return singleTarget(targets[0]);
}

/** DATA name TYPE/LIKE ... without VALUE, without chaining */
export function plainData(statement: StatementNode): boolean {
  return statement.get() instanceof Statements.Data
    && statement.findDirectExpression(Expressions.DataDefinition)?.findDirectExpression(Expressions.Value) === undefined;
}

/** constants of the class or program, builtin constants like abap_true, and me: never change */
export function isImmutable(identifier: Identifier | undefined): boolean {
  if (!(identifier instanceof TypedIdentifier)) {
    return false;
  }
  const meta = identifier.getMeta();
  if (identifier.getName().toLowerCase() === "me" && identifier.getType() instanceof ObjectReferenceType) {
    return true;
  }
  return meta.includes(IdentifierMeta.ReadOnly)
    && (meta.includes(IdentifierMeta.Static) || (meta.includes(IdentifierMeta.BuiltIn) && identifier.getValue() !== undefined));
}

export function isReferenceType(type: AbstractType): boolean {
  return type instanceof ObjectReferenceType || type instanceof DataReference;
}

/** same runtime type, so assignments between the two never convert */
export function identicalTypes(first: AbstractType, second: AbstractType): boolean {
  if (first instanceof UnknownType || second instanceof UnknownType
      || first instanceof VoidType || second instanceof VoidType
      || first.isGeneric() || second.isGeneric()
      || first.constructor !== second.constructor) {
    return false;
  }
  if (first instanceof StructureType || first instanceof TableType) {
    const firstName = first.getQualifiedName()?.toUpperCase();
    return firstName !== undefined && firstName === second.getQualifiedName()?.toUpperCase();
  }
  if (isReferenceType(first)) {
    return first.toABAP().toUpperCase() === second.toABAP().toUpperCase();
  }
  return first.toABAP() === second.toABAP();
}

////////////////////////////////////////
// conditions

export enum PredicateKind {
  Equal = "equal",
  Initial = "initial",
  Bound = "bound",
}

export interface IPredicate {
  kind: PredicateKind;
  /** the operand of IS INITIAL / IS BOUND, the left operand of = */
  left: ExpressionNode;
  /** the right operand of = */
  right?: ExpressionNode;
  /** NOT, IS NOT, <> or NE */
  negated: boolean;
}

/** the condition of IF or ELSEIF is one comparison: a = b, a EQ b, a <> b, a NE b,
 * a IS [NOT] INITIAL, a IS [NOT] BOUND, optionally prefixed with NOT */
export function simplePredicate(statement: StatementNode): IPredicate | undefined {
  if (!(statement.get() instanceof Statements.If || statement.get() instanceof Statements.ElseIf)
      || statement.getColon() !== undefined) {
    return undefined;
  }
  const cond = statement.findDirectExpression(Expressions.Cond);
  if (cond === undefined || cond.getChildren().length !== 1) {
    return undefined;
  }
  const compare = cond.findDirectExpression(Expressions.Compare);
  if (compare === undefined) {
    return undefined;
  }
  const children = compare.getChildren();
  let negated = false;
  let i = 0;
  if (children[0] instanceof TokenNode && children[0].getFirstToken().getStr().toUpperCase() === "NOT") {
    negated = true;
    i = 1;
  }
  const left = children[i];
  if (!(left instanceof ExpressionNode) || !(left.get() instanceof Expressions.Source)) {
    return undefined;
  }
  const rest = children.slice(i + 1);
  const words = rest.map(c => c instanceof TokenNode ? c.getFirstToken().getStr().toUpperCase() : "");
  if (rest.length === 2 && rest[0].get() instanceof Expressions.CompareOperator
      && rest[1] instanceof ExpressionNode && rest[1].get() instanceof Expressions.Source) {
    const operator = rest[0].getFirstToken().getStr().toUpperCase();
    if (rest[0].countTokens() !== 1 || !["=", "EQ", "<>", "NE"].includes(operator)) {
      return undefined;
    }
    return {kind: PredicateKind.Equal, left, right: rest[1], negated: negated !== (operator === "<>" || operator === "NE")};
  } else if (words.join(" ") === "IS INITIAL" || words.join(" ") === "IS NOT INITIAL") {
    return {kind: PredicateKind.Initial, left, negated: negated !== (words.length === 3)};
  } else if (words.join(" ") === "IS BOUND" || words.join(" ") === "IS NOT BOUND") {
    return {kind: PredicateKind.Bound, left, negated: negated !== (words.length === 3)};
  }
  return undefined;
}

/** value of a character literal 'abc', or of a character constant like abap_true, undefined otherwise */
export function characterConstant(procedure: Procedure, source: ExpressionNode): string | undefined {
  if (source.getChildren().length !== 1) {
    return undefined;
  }
  const literal = source.findDirectExpression(Expressions.Constant)?.findDirectExpression(Expressions.ConstantString);
  if (literal !== undefined) {
    return literal.countTokens() === 1 ? textLiteral(literal.getFirstToken().getStr()) : undefined;
  }
  const field = singleField(source);
  const identifier = field === undefined ? undefined : procedure.identifierAt(field);
  if (identifier instanceof TypedIdentifier && isImmutable(identifier)
      && identifier.getType() instanceof CharacterType) {
    const value = identifier.getValue();
    return typeof value === "string" ? textLiteral(value) : undefined;
  }
  return undefined;
}

function textLiteral(text: string): string | undefined {
  if (text.length < 2 || !text.startsWith("'") || !text.endsWith("'")) {
    return undefined;
  }
  return text.substring(1, text.length - 1).replace(/''/g, "'");
}

/** character values compare after padding the shorter one with blanks */
export function sameCharacters(first: string, second: string): boolean {
  return first.replace(/ +$/, "") === second.replace(/ +$/, "");
}

////////////////////////////////////////
// data sources

export enum SourceKind {
  /** constants and me, never change */
  Immutable = "immutable",
  /** a local variable, or a component of it, changes only by references to the variable */
  Local = "local",
  /** attributes, parameters, globals, anything reached via a reference: may change by other code */
  Volatile = "volatile",
}

export interface IDataSource {
  readonly text: string;
  readonly kind: SourceKind;
  /** the local variable the chain starts with */
  readonly base: Variable | undefined;
  readonly type: AbstractType;
}

/** a plain data object: field, constant, attribute or component chain without calls, offsets, table
 * expressions, field symbols or dereferencing with ->* */
export function dataSource(procedure: Procedure, source: ExpressionNode): IDataSource | undefined {
  if (source.getChildren().length !== 1) {
    return undefined;
  }
  const chain = source.findDirectExpression(Expressions.FieldChain);
  if (chain === undefined) {
    return undefined;
  }
  const children = chain.getChildren();
  let first: Identifier | undefined;
  let next: number;
  if (children[0] instanceof ExpressionNode && children[0].get() instanceof Expressions.SourceField) {
    first = procedure.identifierAt(children[0].getFirstToken());
    next = 1;
  } else if (children[0] instanceof ExpressionNode && children[0].get() instanceof Expressions.ClassName
      && children[1]?.getFirstToken().getStr() === "=>" && children[2] instanceof ExpressionNode
      && children[2].get() instanceof Expressions.AttributeName) {
    first = procedure.identifierAt(children[2].getFirstToken());
    next = 3;
  } else {
    return undefined;
  }
  if (!(first instanceof TypedIdentifier)) {
    return undefined;
  }

  let type: AbstractType | undefined = first.getType();
  let deref = false;
  for (let i = next; i < children.length; i += 2) {
    const separator = children[i];
    const name = children[i + 1];
    if (!(separator instanceof TokenNode) || !(name instanceof ExpressionNode) || type === undefined) {
      return undefined;
    }
    if (type instanceof TableType && type.isWithHeader()) {
      return undefined;
    } else if (separator.getFirstToken().getStr() === "->" && name.get() instanceof Expressions.AttributeName) {
      const attribute = procedure.identifierAt(name.getFirstToken());
      type = attribute instanceof TypedIdentifier ? attribute.getType() : undefined;
      deref = true;
    } else if (separator.getFirstToken().getStr() === "-" && name.get() instanceof Expressions.ComponentName
        && type instanceof StructureType) {
      type = type.getComponentByName(name.getFirstToken().getStr());
    } else {
      return undefined;
    }
  }
  if (type === undefined || type.isGeneric() || (type instanceof TableType && type.isWithHeader())) {
    return undefined;
  }

  const local = next === 1 ? procedure.local(first) : undefined;
  let kind = SourceKind.Volatile;
  if (deref === false && isImmutable(first)) {
    kind = SourceKind.Immutable;
  } else if (deref === false && local !== undefined) {
    kind = SourceKind.Local;
  }
  return {text: nodeText(procedure.file, source), kind, base: local, type};
}

/**
 * The data source has the same value at the end of statement "to" as at the end of statement "from".
 * When "read" is given, it is the token in statement "to" that reads the value; writes of statement "to"
 * after its sources are evaluated, ie. the target of a MOVE or the call after evaluating its receiver, do not count.
 */
export function unchangedBetween(procedure: Procedure, source: IDataSource, from: StatementNode, to: StatementNode,
                                 read?: AbstractToken): boolean {
  if (source.kind === SourceKind.Immutable) {
    return true;
  }
  const start = procedure.index(from);
  const end = procedure.index(to);
  if (start < 0 || end < start) {
    return false;
  }
  if (source.base !== undefined && (source.base.escapes()
      || source.base.writes().some(w => w.index > start && w.index <= end))) {
    return false;
  }
  if (source.kind === SourceKind.Local) {
    return source.base !== undefined;
  }
  for (let index = start + 1; index <= end; index++) {
    const statement = procedure.statements[index];
    if (index === end && read !== undefined) {
      if (isReceiver(statement, read)
          || (statement.get() instanceof Statements.Move && procedure.isCallFree(statement))) {
        continue;
      }
    }
    if (!procedure.isCallFree(statement) || !procedure.writesOnlyPrivate(statement)) {
      return false;
    }
  }
  return true;
}

/** the token is the receiver of the method call chain of the statement: a->m( ). or x = a->m( ).
 * The receiver is evaluated before the arguments and the call */
function isReceiver(statement: StatementNode, token: AbstractToken): boolean {
  let chain: ExpressionNode | undefined;
  if (statement.get() instanceof Statements.Call) {
    chain = statement.findDirectExpression(Expressions.MethodCallChain);
  } else if (plainMove(statement)?.source.getChildren().length === 1) {
    chain = plainMove(statement)!.source.findDirectExpression(Expressions.MethodCallChain);
  }
  const receiver = chain?.getChildren()[0];
  return receiver instanceof ExpressionNode && receiver.get() instanceof Expressions.FieldChain
    && receiver.countTokens() === 1 && receiver.getFirstToken().getStart().equals(token.getStart())
    && chain?.getChildren()[1]?.getFirstToken().getStr() === "->";
}

////////////////////////////////////////
// edits

/** edits of one fix, sorted so that applying them one after the other keeps the positions valid */
export function mergeEdits(file: ABAPFile, edits: IEdit[]): IEdit {
  const list: ITextEdit[] = [];
  for (const edit of edits) {
    list.push(...edit[file.getFilename()] || []);
  }
  list.sort((a, b) => {
    if (a.range.start.equals(b.range.start)) {
      return 0;
    }
    return a.range.start.isAfter(b.range.start) ? -1 : 1;
  });
  return {[file.getFilename()]: list};
}

/** deletes the statements from first to last, the full lines if nothing else is on them */
export function deleteRegion(file: ABAPFile, first: StatementNode, last: StatementNode): IEdit {
  if (first === last && first.getColon() !== undefined) {
    return EditHelper.deleteStatement(file, first);
  }
  const rows = file.getRawRows();
  const start = first.getStart();
  const end = last.getEnd();
  const before = rows[start.getRow() - 1].substring(0, start.getCol() - 1);
  const after = rows[end.getRow() - 1].substring(end.getCol() - 1);
  if (before.trim() === "" && after.trim() === "" && end.getRow() < rows.length) {
    return EditHelper.deleteRange(file, new Position(start.getRow(), 1), new Position(end.getRow() + 1, 1));
  }
  return EditHelper.deleteRange(file, start, end);
}

export function deleteStatement(file: ABAPFile, statement: StatementNode): IEdit {
  return deleteRegion(file, statement, statement);
}

/** the source code between two positions, as written */
export function rawText(file: ABAPFile, start: Position, end: Position): string {
  const rows = file.getRawRows();
  if (start.getRow() === end.getRow()) {
    return rows[start.getRow() - 1].substring(start.getCol() - 1, end.getCol() - 1);
  }
  const ret = [rows[start.getRow() - 1].substring(start.getCol() - 1)];
  for (let row = start.getRow() + 1; row < end.getRow(); row++) {
    ret.push(rows[row - 1]);
  }
  ret.push(rows[end.getRow() - 1].substring(0, end.getCol() - 1));
  return ret.join("\n");
}

export function nodeText(file: ABAPFile, node: ExpressionNode): string {
  return rawText(file, node.getFirstToken().getStart(), node.getLastToken().getEnd());
}

////////////////////////////////////////
// IF with a condition known at compile time

interface IBranch {
  statement: StatementNode;
  body: StructureNode | undefined;
}

/** the IF, ELSEIF and ELSE branches of an IF structure */
export function ifBranches(structure: StructureNode): IBranch[] | undefined {
  const branches: IBranch[] = [];
  for (const child of structure.getChildren()) {
    if (child instanceof StatementNode) {
      if (child.get() instanceof Statements.If) {
        branches.push({statement: child, body: undefined});
      }
    } else if (child.get() instanceof Structures.Body) {
      if (branches.length !== 1) {
        return undefined;
      }
      branches[0].body = child;
    } else if (child.get() instanceof Structures.ElseIf || child.get() instanceof Structures.Else) {
      const statement = child.getFirstStatement();
      if (statement === undefined) {
        return undefined;
      }
      branches.push({statement, body: child.findDirectStructure(Structures.Body)});
    }
  }
  return branches.length > 0 ? branches : undefined;
}

/** a region of statements can be deleted if nothing declared in it is used outside of it */
export function selfContained(procedure: Procedure, first: StatementNode, last: StatementNode): boolean {
  const filename = procedure.file.getFilename();
  const start = first.getStart();
  const end = last.getEnd();
  const inside = (identifier: Identifier) => identifier.getFilename() === filename
    && !identifier.getStart().isBefore(start) && !identifier.getStart().isAfter(end);
  for (const [resolved, references] of procedure.ownReferences()) {
    if (inside(resolved) && references.some(r => !inside(r.position))) {
      return false;
    }
  }
  return true;
}

/**
 * Removes an IF branch whose condition is known.
 * decided: the IF or ELSEIF statement whose condition always has the given value.
 * Returns undefined if a removed branch declares something used outside of it.
 */
export function foldIf(procedure: Procedure, structure: StructureNode, decided: StatementNode, value: boolean): IEdit | undefined {
  const file = procedure.file;
  const branches = ifBranches(structure);
  const endIf = structure.findDirectStatement(Statements.EndIf);
  const k = branches?.findIndex(b => b.statement === decided) ?? -1;
  if (branches === undefined || endIf === undefined || k < 0
      || branches[k].statement.get() instanceof Statements.Else
      || structure.getChildren().some(c => c instanceof StatementNode && c.getColon() !== undefined)
      || branches.some(b => b.statement.getColon() !== undefined)) {
    return undefined;
  }
  const lastOf = (index: number): StatementNode => {
    const statements = branches[index].body?.findAllStatementNodes() || [];
    return statements.length > 0 ? statements[statements.length - 1] : branches[index].statement;
  };
  const dead = (from: number, to: number): boolean => {
    // branches from..to are removed, including their statements
    return selfContained(procedure, branches[from].statement, lastOf(to));
  };
  const last = branches.length - 1;
  const edits: IEdit[] = [];

  if (value === true) {
    if (k < last && !dead(k + 1, last)) {
      return undefined;
    }
    if (k === 0) {
      edits.push(deleteStatement(file, branches[0].statement));
      edits.push(k < last ? deleteRegion(file, branches[k + 1].statement, endIf) : deleteStatement(file, endIf));
    } else {
      edits.push(EditHelper.replaceRange(file, decided.getStart(), decided.getEnd(), "ELSE."));
      if (k < last) {
        edits.push(deleteRegion(file, branches[k + 1].statement, lastOf(last)));
      }
    }
  } else {
    if (!dead(k, k)) {
      return undefined;
    }
    if (k === 0) {
      if (last === 0) {
        edits.push(deleteRegion(file, branches[0].statement, endIf));
      } else {
        edits.push(deleteRegion(file, branches[0].statement, lastOf(0)));
        const next = branches[1].statement;
        if (next.get() instanceof Statements.ElseIf) {
          edits.push(EditHelper.replaceToken(file, next.getFirstToken(), "IF"));
        } else {
          edits.push(deleteStatement(file, next));
          edits.push(deleteStatement(file, endIf));
        }
      }
    } else {
      edits.push(deleteRegion(file, branches[k].statement, lastOf(k)));
    }
  }
  return mergeEdits(file, edits);
}
