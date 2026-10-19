import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {Comment, IStatement, MacroCall, MacroContent, MacroRecursion, NativeSQL,
  Unknown} from "../abap/2_statements/statements/_statement";
import {IStructure} from "../abap/3_structures/structures/_structure";
import {AbstractToken} from "../abap/1_lexer/tokens/abstract_token";
import {Dash, Identifier as IdentifierToken} from "../abap/1_lexer/tokens";
import {IReference, ReferenceType} from "../abap/5_syntax/_reference";
import {ISpaghettiScope, ISpaghettiScopeNode, ISyntaxResult} from "../abap/5_syntax/_spaghetti_scope";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ExpressionNode, StatementNode, StructureNode, TokenNode} from "../abap/nodes";
import {Identifier} from "../abap/4_file_information/_identifier";
import {IdentifierMeta, TypedIdentifier} from "../abap/types/_typed_identifier";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {CharacterType, DataReference, IntegerType, ObjectReferenceType, StringType, StructureType, TableType, UnknownType,
  VoidType} from "../abap/types/basic";
import {IMethodDefinition} from "../abap/types/_method_definition";
import {IInterfaceDefinition} from "../abap/types/_interface_definition";
import {ClassDefinition} from "../abap/types/class_definition";
import {InterfaceDefinition} from "../abap/types/interface_definition";
import {Class} from "../objects/class";
import {Interface} from "../objects/interface";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject} from "../objects/_abap_object";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {EditHelper, IEdit, ITextEdit} from "../edit_helper";
import {Position} from "../position";
import {Issue} from "../issue";
import {Severity} from "../severity";

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
  private static last: {obj: ABAPObject, syntax: ISyntaxResult, analysis: ObjectAnalysis | undefined} | undefined;

  /** returns undefined if the object is not supported, or has syntax errors */
  public static run(reg: IRegistry, obj: IObject): ObjectAnalysis | undefined {
    if (!(obj instanceof ABAPObject)) {
      return undefined;
    }
    const syntax = new SyntaxLogic(reg, obj).run();
    // the rules run one after the other on the same object, the syntax result changes when the object changes
    if (ObjectAnalysis.last?.obj === obj && ObjectAnalysis.last.syntax === syntax) {
      return ObjectAnalysis.last.analysis;
    }
    const analysis = ObjectAnalysis.build(obj, syntax);
    ObjectAnalysis.last = {obj, syntax, analysis};
    return analysis;
  }

  private static build(obj: ABAPObject, syntax: ISyntaxResult): ObjectAnalysis | undefined {
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
  /** identifier tokens by lower case name, positions as row * 100000 + column, the procedure is in one file */
  private readonly names = new Map<string, number[]>();
  private readonly declarations = new Map<string, StatementNode>();
  private readonly declarationTokens: AbstractToken[] = [];
  private readonly tokens = new Map<StatementNode, readonly AbstractToken[]>();
  private readonly variables = new Map<string, Variable | undefined>();
  private own: [Identifier, IReference[]][] | undefined = undefined;
  private comments: Position[] | undefined = undefined;

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
      const tokens = this.tokensOf(statement);
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const previous = tokens[i - 1];
        if (!(token instanceof IdentifierToken)
            || (previous !== undefined && (previous.getStr() === "->" || previous.getStr() === "=>"
            || previous.getStr() === "~" || previous instanceof Dash))) {
          continue;
        }
        const name = token.getStr().toLowerCase();
        const list = this.names.get(name);
        if (list === undefined) {
          this.names.set(name, [position(token)]);
        } else {
          list.push(position(token));
        }
      }

      const type = statement.get();
      if (type instanceof Statements.Data && this.isSimple(statement)) {
        const name = statement.findDirectExpression(Expressions.DataDefinition)
          ?.findDirectExpression(Expressions.DefinitionName)?.getFirstToken();
        if (name !== undefined) {
          this.declarations.set(this.tokenKey(name), statement);
          this.declarationTokens.push(name);
        }
      }
      if (!(type instanceof Statements.Form) && tokens.some((t, i) => t.getStr().toUpperCase() === "DATA"
          && tokens[i + 1]?.getStr() === "(")) {
        for (const inline of statement.findAllExpressionsRecursive(Expressions.InlineData)) {
          const name = inline.findDirectExpression(Expressions.TargetField)?.getFirstToken();
          if (name !== undefined) {
            this.declarations.set(this.tokenKey(name), statement);
            this.declarationTokens.push(name);
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

  /** the next statement executed after a direct statement of a block, skipping declarations, which have no effect
   * where they are written; undefined if there is none in the block */
  public nextExecuted(statement: StatementNode): StatementNode | undefined {
    const block = this.block(statement);
    for (let index = this.index(statement) + 1; index < this.statements.length; index++) {
      const next = this.statements[index];
      const type = next.get();
      if (this.block(next) !== block) {
        return undefined;
      } else if (!(this.isSimple(next) && (type instanceof Statements.Data || type instanceof Statements.Type
          || type instanceof Statements.Constant || type instanceof Statements.FieldSymbol || type instanceof Comment))) {
        return next;
      }
    }
    return undefined;
  }

  /** a comment line or end of line comment between the two positions */
  public hasComment(start: Position, end: Position): boolean {
    if (this.comments === undefined) {
      this.comments = this.file.getStatements()
        .filter(s => s.get() instanceof Comment
          && !s.getStart().isBefore(this.getStart()) && s.getStart().isBefore(this.getEnd()))
        .map(s => s.getStart());
    }
    return this.comments.some(c => !c.isBefore(start) && c.isBefore(end));
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
    const known = new Set<number>([position(identifier.getToken())]);
    for (const reference of this.analysis.referencesTo(identifier)) {
      if (!this.contains(reference.position)) {
        continue;
      }
      const token = reference.position.getToken();
      known.add(position(token));
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
    for (const named of this.names.get(identifier.getName().toLowerCase()) || []) {
      if (!known.has(named)) {
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

  /** memory that only this procedure can reach: a local variable, or a pass-by-value or RETURNING parameter of
   * a method or form, with all references understood and its address never taken */
  public private(identifier: Identifier | undefined): Variable | undefined {
    const variable = this.variable(identifier);
    if (variable === undefined || variable.complete === false || variable.escapes()
        || variable.identifier.getMeta().includes(IdentifierMeta.Static)) {
      return undefined;
    }
    const meta = variable.identifier.getMeta();
    if (variable.isLocal()) {
      return variable;
    }
    // function module parameters can be global parameters of the function group
    const parameter = !(this.structure.get() instanceof Structures.FunctionModule)
      && (meta.includes(IdentifierMeta.PassByValue) || meta.includes(IdentifierMeta.MethodReturning));
    return parameter ? variable : undefined;
  }

  /** all local variables declared in the procedure */
  public locals(): Variable[] {
    const ret: Variable[] = [];
    for (const token of this.declarationTokens) {
      const variable = this.local(this.identifierAt(token) ?? this.declaredIdentifier(token));
      if (variable !== undefined) {
        ret.push(variable);
      }
    }
    return ret;
  }

  /** tokens of the statement, getTokens() builds a new list on every call */
  public tokensOf(statement: StatementNode): readonly AbstractToken[] {
    let tokens = this.tokens.get(statement);
    if (tokens === undefined) {
      tokens = statement.getTokens();
      this.tokens.set(statement, tokens);
    }
    return tokens;
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

  /** the method or builtin function called at the method name token */
  public methodAt(token: AbstractToken): IMethodDefinition | undefined {
    for (const reference of this.analysis.referencesAt(this.file.getFilename(), token)) {
      if ((reference.referenceType === ReferenceType.MethodReference
          || reference.referenceType === ReferenceType.BuiltinMethodReference)
          && reference.resolved !== undefined && "getParameters" in reference.resolved) {
        return reference.resolved as unknown as IMethodDefinition;
      }
    }
    return undefined;
  }

  /** every data write in the statement goes to a local variable, a pass-by-value parameter or the
   * RETURNING parameter, ie. memory that no other data object, field symbol or reference can share */
  public writesOnlyPrivate(statement: StatementNode): boolean {
    const tokens = this.tokensOf(statement);
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

  private classify(reference: IReference, statement: StatementNode): OccurrenceKind {
    if (reference.referenceType !== ReferenceType.DataReadReference
        && reference.referenceType !== ReferenceType.DataWriteReference) {
      return OccurrenceKind.Escape;
    }
    const token = reference.position.getToken();
    const tokens = this.tokensOf(statement);
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

function position(token: AbstractToken): number {
  return token.getRow() * 100000 + token.getCol();
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
          && !child.getLastToken().getStart().isBefore(token.getStart())) {
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

/** IF, ELSEIF, WHILE, CHECK, CASE or WHEN: a constant compared there is left for constant_condition,
 * instead of replacing a variable by a constant and comparing two constants */
export function isCondition(statement: StatementNode): boolean {
  const type = statement.get();
  return type instanceof Statements.If || type instanceof Statements.ElseIf || type instanceof Statements.While
    || type instanceof Statements.Check || type instanceof Statements.Case || type instanceof Statements.When;
}

////////////////////////////////////////
// data sources

export enum SourceKind {
  /** constants and me, never change */
  Immutable = "immutable",
  /** a local variable or a pass-by-value parameter, or a component of it, changes only by references to the variable */
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
  if (!(first instanceof TypedIdentifier)
      || (first.getMeta().includes(IdentifierMeta.BuiltIn) && !isImmutable(first))) {
    // system fields like sy-subrc and sy-tabix are changed by many statements without a write reference
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

  const local = next === 1 ? procedure.local(first) ?? procedure.private(first) : undefined;
  let kind = SourceKind.Volatile;
  if (deref === false && isImmutable(first)) {
    kind = SourceKind.Immutable;
  } else if (deref === false && local !== undefined) {
    kind = SourceKind.Local;
  }
  return {text: nodeText(procedure.file, source), kind, base: local, type};
}

/** type of a plain target: variable, field symbol, attribute or component chain, not an inline declaration,
 * without offsets, table expressions or ->* */
export function targetType(procedure: Procedure, target: ExpressionNode): AbstractType | undefined {
  const children = target.getChildren();
  let identifier: Identifier | undefined;
  let next: number;
  const first = children[0];
  if (first instanceof ExpressionNode
      && (first.get() instanceof Expressions.TargetField || first.get() instanceof Expressions.TargetFieldSymbol)) {
    identifier = procedure.identifierAt(first.getFirstToken());
    next = 1;
  } else if (first instanceof ExpressionNode && first.get() instanceof Expressions.ClassName
      && children[1]?.getFirstToken().getStr() === "=>" && children[2] instanceof ExpressionNode
      && children[2].get() instanceof Expressions.AttributeName) {
    identifier = procedure.identifierAt(children[2].getFirstToken());
    next = 3;
  } else {
    return undefined;
  }
  let type: AbstractType | undefined = identifier instanceof TypedIdentifier ? identifier.getType() : undefined;
  for (let i = next; i < children.length; i += 2) {
    const separator = children[i];
    const name = children[i + 1];
    if (!(separator instanceof TokenNode) || !(name instanceof ExpressionNode) || type === undefined) {
      return undefined;
    }
    if (separator.getFirstToken().getStr() === "->" && name.get() instanceof Expressions.AttributeName) {
      const attribute = procedure.identifierAt(name.getFirstToken());
      type = attribute instanceof TypedIdentifier ? attribute.getType() : undefined;
    } else if (separator.getFirstToken().getStr() === "-" && name.get() instanceof Expressions.ComponentName
        && type instanceof StructureType) {
      type = type.getComponentByName(name.getFirstToken().getStr());
    } else {
      return undefined;
    }
  }
  if (type === undefined || (type instanceof TableType && type.isWithHeader())) {
    return undefined;
  }
  return type;
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
          || (statement.get() instanceof Statements.Move && procedure.isCallFree(statement))
          || passedByValue(procedure, statement, read)) {
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

export interface IFormalParameter {
  /** the method call, NEW or CREATE OBJECT the token is passed to */
  call: ExpressionNode | StatementNode;
  /** the called method, undefined for NEW and CREATE OBJECT */
  method: IMethodDefinition | undefined;
  /** the formal parameter, undefined if it is not known */
  parameter: TypedIdentifier | undefined;
}

/** the token is the complete actual parameter for an importing parameter: m( v ), m( p = v ),
 * CALL METHOD m EXPORTING p = v, NEW c( p = v ) or CREATE OBJECT o EXPORTING p = v */
export function formalParameter(procedure: Procedure, statement: StatementNode, token: AbstractToken): IFormalParameter | undefined {
  const path = expressionPath(statement, token);
  const index = path.findIndex(e => e.get() instanceof Expressions.Source && e.countTokens() === 1);
  const source = path[index];
  if (source === undefined || source.findDirectExpression(Expressions.FieldChain) === undefined
      || !source.getFirstToken().getStart().equals(token.getStart())) {
    return undefined;
  }
  const parent = index > 0 ? path[index - 1] : undefined;
  let name: string | undefined;
  let call: ExpressionNode | StatementNode | undefined;
  if (parent?.get() instanceof Expressions.MethodCallParam) {
    call = path[index - 2];
  } else if (parent?.get() instanceof Expressions.NewObject) {
    call = parent;
  } else if (parent?.get() instanceof Expressions.ParameterS && path[index - 2]?.get() instanceof Expressions.ParameterListS) {
    name = parent.findDirectExpression(Expressions.ParameterName)?.getFirstToken().getStr();
    const list = path[index - 3];
    const above = path[index - 4];
    if (list === undefined && statement.get() instanceof Statements.CreateObject) {
      call = statement;
    } else if (list?.get() instanceof Expressions.MethodCallParam) {
      call = above;
    } else if (list?.get() instanceof Expressions.NewObject) {
      call = list;
    } else if (list?.get() instanceof Expressions.MethodParameters && above?.get() instanceof Expressions.MethodCallParam) {
      call = path[index - 5];
    } else if (list?.get() instanceof Expressions.MethodParameters && above?.get() instanceof Expressions.MethodCallBody
        && index === 4 && statement.get() instanceof Statements.Call) {
      call = statement;
    }
  }
  if (call === undefined) {
    return undefined;
  }

  let method: IMethodDefinition | undefined;
  if (call instanceof ExpressionNode && call.get() instanceof Expressions.MethodCall) {
    const methodName = call.findDirectExpression(Expressions.MethodName)?.getFirstToken();
    method = methodName === undefined ? undefined : procedure.methodAt(methodName);
  } else if (call instanceof StatementNode && call.get() instanceof Statements.Call) {
    const methodSource = call.findDirectExpression(Expressions.MethodSource);
    method = methodSource === undefined ? undefined : procedure.methodAt(methodSource.getLastToken());
  } else if (!(call.get() instanceof Expressions.NewObject) && !(call.get() instanceof Statements.CreateObject)) {
    return undefined;
  }
  const parameters = method?.getParameters();
  const formal = name ?? parameters?.getDefaultImporting();
  const parameter = formal === undefined ? undefined
    : parameters?.getImporting().find(p => p.getName().toUpperCase() === formal.toUpperCase());
  return {call, method, parameter};
}

/** the token is the complete actual parameter for a pass-by-value importing parameter of the only call in the
 * statement, so the method gets a copy of the value when it is called, and nothing else runs before */
export function passedByValue(procedure: Procedure, statement: StatementNode, token: AbstractToken): boolean {
  if (!(statement.get() instanceof Statements.Call) && plainMove(statement) === undefined) {
    return false;
  }
  const formal = formalParameter(procedure, statement, token);
  if (formal?.method === undefined || formal.parameter?.getMeta().includes(IdentifierMeta.PassByValue) !== true
      || statement.findFirstExpression(Expressions.NewObject) !== undefined) {
    return false;
  }
  for (const call of statement.findAllExpressionsRecursive(Expressions.MethodCall)) {
    const name = call.findDirectExpression(Expressions.MethodName)?.getFirstToken();
    const builtin = name === undefined ? false : procedure.analysis.referencesAt(procedure.file.getFilename(), name)
      .some(r => r.referenceType === ReferenceType.BuiltinMethodReference);
    if (call !== formal.call && builtin === false) {
      return false;
    }
  }
  return true;
}

/** builtin functions whose result type follows the type of the argument */
export const NUMERIC_FUNCTIONS = new Set(["abs", "sign", "ceil", "floor", "trunc", "frac", "ipow", "nmax", "nmin",
  "round", "rescale"]);

/** type of a literal: 'abc' is c LENGTH 3, `abc` is string, 12 is i */
export function literalType(constant: ExpressionNode): AbstractType | undefined {
  if (constant.countTokens() !== 1) {
    return undefined;
  }
  const text = constant.getFirstToken().getStr();
  if (constant.findDirectExpression(Expressions.Integer) !== undefined) {
    const value = Number(text);
    return Number.isInteger(value) && Math.abs(value) <= 2147483647 ? IntegerType.get() : undefined;
  } else if (text.startsWith("'") && text.endsWith("'") && text.length >= 2) {
    return new CharacterType(Math.max(1, text.length - 2 - (text.match(/''/g)?.length ?? 0)));
  } else if (text.startsWith("`") && text.endsWith("`")) {
    return StringType.get();
  }
  return undefined;
}

/** Static type of an expression whose type does not depend on where it is used: literals, string templates,
 * concatenations, xsdbool( ), boolc( ), data objects, method calls and attributes after method calls.
 * Undefined if not known, e.g. for constructor expressions, arithmetic or builtin functions typed by their argument */
export function expressionType(procedure: Procedure, source: ExpressionNode): AbstractType | undefined {
  const children = source.getChildren();
  const first = children[0];
  const keyword = first instanceof TokenNode ? first.getFirstToken().getStr().toUpperCase() : "";
  if (children.length === 4 && keyword === "XSDBOOL" && source.findDirectExpression(Expressions.Cond) !== undefined) {
    return new CharacterType(1);
  } else if (children.length === 4 && keyword === "BOOLC" && source.findDirectExpression(Expressions.Cond) !== undefined) {
    return StringType.get();
  } else if (children.length === 3 && children[1] instanceof TokenNode && children[1].getFirstToken().getStr() === "&&") {
    return StringType.get();
  } else if (!(first instanceof ExpressionNode)) {
    return undefined;
  }

  if (children.length === 1 && first.get() instanceof Expressions.Constant) {
    return literalType(first);
  } else if (children.length === 1 && first.get() instanceof Expressions.StringTemplate) {
    return StringType.get();
  } else if (children.length === 1 && first.get() instanceof Expressions.FieldChain) {
    return dataSource(procedure, source)?.type;
  } else if (!(first.get() instanceof Expressions.MethodCallChain)) {
    return undefined;
  }

  // the last call of the chain, optionally followed by ->attribute
  let type: AbstractType | undefined;
  const last = first.getChildren()[first.getChildren().length - 1];
  if (last instanceof ExpressionNode && last.get() instanceof Expressions.MethodCall) {
    const name = last.findDirectExpression(Expressions.MethodName)?.getFirstToken();
    const method = name === undefined ? undefined : procedure.methodAt(name);
    if (name === undefined || method === undefined || NUMERIC_FUNCTIONS.has(name.getStr().toLowerCase())) {
      return undefined;
    }
    type = method.getParameters().getReturning()?.getType();
  } else {
    return undefined;
  }
  if (children.length === 1) {
    return type;
  }
  const attribute = children[2];
  if (children.length === 3 && children[1].get() instanceof Expressions.Arrow && attribute instanceof ExpressionNode
      && attribute.get() instanceof Expressions.AttributeChain && attribute.getChildren().length === 1) {
    const identifier = procedure.identifierAt(attribute.getFirstToken());
    return identifier instanceof TypedIdentifier ? identifier.getType() : undefined;
  }
  return undefined;
}

////////////////////////////////////////
// classes and interfaces

/** classes and interfaces by name: local ones in the scope of the procedure, global ones in the registry */
export class Hierarchy {
  private readonly reg: IRegistry;
  private readonly procedure: Procedure;

  public constructor(reg: IRegistry, procedure: Procedure) {
    this.reg = reg;
    this.procedure = procedure;
  }

  public find(name: string): IInterfaceDefinition | undefined {
    const scope = this.procedure.analysis.spaghetti.lookupPosition(this.procedure.getStart(), this.procedure.file.getFilename());
    const local = scope?.findClassDefinition(name) ?? scope?.findInterfaceDefinition(name);
    if (local !== undefined) {
      return local;
    }
    const clas = this.reg.getObject("CLAS", name);
    if (clas instanceof Class) {
      return clas.getDefinition();
    }
    const intf = this.reg.getObject("INTF", name);
    return intf instanceof Interface ? intf.getDefinition() : undefined;
  }

  /** the class or interface definition of an object reference type, undefined if it is not known */
  public definition(type: AbstractType): ClassDefinition | InterfaceDefinition | undefined {
    if (!(type instanceof ObjectReferenceType)) {
      return undefined;
    }
    const identifier = type.getIdentifier();
    const found = identifier instanceof ClassDefinition || identifier instanceof InterfaceDefinition
      ? identifier : this.find(identifier.getName());
    return found instanceof ClassDefinition || found instanceof InterfaceDefinition ? found : undefined;
  }

  /** sub is sup, or inherits from it or implements it; false if a definition on the way is not known */
  public isSubtype(sub: string, sup: string): boolean {
    const target = sup.toUpperCase();
    const visited = new Set<string>();
    const stack = [sub.toUpperCase()];
    while (stack.length > 0) {
      const name = stack.pop()!;
      if (name === target) {
        return true;
      } else if (visited.has(name)) {
        continue;
      }
      visited.add(name);
      const definition = this.find(name);
      const superClass = definition?.getSuperClass();
      if (superClass !== undefined) {
        stack.push(superClass.toUpperCase());
      }
      for (const implementing of definition?.getImplementing() || []) {
        stack.push(implementing.name.toUpperCase());
      }
    }
    return false;
  }
}

////////////////////////////////////////
// edits

const rowCache = new WeakMap<ABAPFile, readonly string[]>();

/** getRawRows() splits the source on every call; a file is never changed, edits create a new one */
function rowsOf(file: ABAPFile): readonly string[] {
  let rows = rowCache.get(file);
  if (rows === undefined) {
    rows = file.getRawRows();
    rowCache.set(file, rows);
  }
  return rows;
}

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
  const rows = rowsOf(file);
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
  const rows = rowsOf(file);
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

export interface IFoldCandidate {
  /** the IF structure that is folded */
  structure: StructureNode;
  statement: StatementNode;
  message: string;
  fix: IEdit;
}

/**
 * Issues for folds of IF structures. The edits of a fold inside a removed branch of another fold can not be
 * applied in the same round, and abaplint --fix only checks if the rows of a new fix cover the first or last row
 * of an accepted one. So only the outermost fold, and the first fold of an IF, keeps its quick fix; the others
 * are reported without, and get their fix in the next round.
 */
export function foldIssues(file: ABAPFile, candidates: IFoldCandidate[], key: string, severity: Severity | undefined): Issue[] {
  const contains = (outer: StructureNode, inner: StructureNode) =>
    !inner.getFirstToken().getStart().isBefore(outer.getFirstToken().getStart())
    && !outer.getLastToken().getEnd().isBefore(inner.getLastToken().getEnd());
  return candidates.map((candidate, index) => {
    const nested = candidates.some((other, otherIndex) => other.structure === candidate.structure
      ? otherIndex < index
      : contains(other.structure, candidate.structure));
    return Issue.atStatement(file, candidate.statement, candidate.message, key, severity, nested ? undefined : candidate.fix);
  });
}
