import * as Expressions from "../2_statements/expressions";
import * as Statements from "../2_statements/statements";
import * as Structures from "../3_structures/structures";
import {ExpressionNode, StatementNode, StructureNode} from "../nodes";
import {Dash, InstanceArrow, StaticArrow} from "../1_lexer/tokens";
import {IdentifierMeta, TypedIdentifier} from "../types/_typed_identifier";
import {ClassAttribute} from "../types/class_attribute";
import {DataReference, ObjectReferenceType, StructureType, TableAccessType, TableKeyType, TableType, UnknownType, VoidType} from "../types/basic";
import {AbstractType} from "../types/basic/_abstract_type";
import {Position} from "../../position";
import {ObjectOriented} from "./_object_oriented";
import {CurrentScope} from "./_current_scope";
import {CorrespondingTypes, SyntaxInput, syntaxIssue, TableArgument} from "./_syntax_input";

type Binding = {
  /** the primary key components, or "line" when the key is the whole line */
  key: string[] | "line",
  reference: boolean,
  loop?: StatementNode,
  block?: StructureNode,
  iterationDepth?: number,
  tryDepth?: number,
};

type Procedure = {
  filename: string,
  start: Position,
  exposedReferences?: Set<TypedIdentifier>,
  staticVariables?: Set<TypedIdentifier>,
  dynamicAddress?: boolean,
  loopExposed?: Set<TypedIdentifier>,
  loopDynamic?: boolean,
  sharedAliases?: Set<TypedIdentifier>,
  scheduled?: ScheduledForms,
};

type TableAlias = {
  paths: readonly string[],
  certain?: string,
  iteration?: TableAliases,
  carried?: readonly CarriedAlias[],
  shared?: boolean,
  identity?: object,
  entryIdentity?: object,
};
type TableAliases = Map<TypedIdentifier, TableAlias>;
type CarriedAlias = {loop: LoopAliases, variable: TypedIdentifier};
type LoopAliases = {
  node: StructureNode,
  backEdge: TableAliases,
  seen: boolean,
  once?: boolean,
  scheduledOnEntry?: ScheduledForms,
  entries?: Map<TypedIdentifier, CarriedAlias>,
  observations?: Map<TypedIdentifier, Map<TableAlias | undefined, object>>,
  exitFacts?: AppendFacts,
};
type AppendBinding = Binding & {
  table: TableAlias | undefined,
  original?: AppendBinding,
  pendingWrites?: readonly (() => boolean)[],
};
type AppendFacts = {
  appends: Map<TypedIdentifier, AppendBinding>,
  aliases: TableAliases,
  exposed?: Set<TypedIdentifier>,
  dynamic?: boolean,
  reachable: boolean,
  scheduled?: ScheduledForms,
};
type Conditional = {node: StructureNode, started: boolean, remaining?: AppendFacts, completed?: AppendFacts};

const repeatingStructures = new Set<object>([
  Structures.Do, Structures.While, Structures.Loop, Structures.LoopAtScreen, Structures.LoopExtract,
  Structures.Select, Structures.With, Structures.Provide,
]);
type ScheduledForms = Partial<Record<"onCommit" | "onRollback", true>>;

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
  private appends = new Map<TypedIdentifier, AppendBinding>();
  private tableAliases: TableAliases = new Map();
  private readonly conditionals: Conditional[] = [];
  private readonly aliasEntries = new Map<StructureNode, TableAliases>();
  private readonly entryReachability = new Map<StructureNode, boolean>();
  private readonly loopAliases: LoopAliases[] = [];
  private readonly appendBlocks = new Map<StructureNode, Set<TypedIdentifier>>();
  private readonly retryingTries = new Set<StructureNode>();
  private readonly resumableTries = new Set<StructureNode>();
  private iterationDepth = 0;
  private tryDepth = 0;
  private reachable = true;
  private procedure: Procedure | undefined = undefined;

  public enter(node: StructureNode, filename: string, parent: StructureNode): void {
    if (SortedKeyWrite.isProcedure(node)) {
      this.bindings.clear();
      this.reachable = true;
      this.procedure = {filename, start: node.getFirstToken().getStart()};
    } else if (this.procedure) {
      const structure = node.get();
      if (structure instanceof Structures.If || structure instanceof Structures.Case || structure instanceof Structures.CaseType) {
        this.conditionals.push({node, started: structure instanceof Structures.If});
      } else if (structure instanceof Structures.ElseIf || structure instanceof Structures.Else
          || structure instanceof Structures.When || structure instanceof Structures.WhenType) {
        const conditional = this.currentConditional();
        if (conditional?.remaining) {
          if (conditional.started) {
            this.join(conditional.completed);
            conditional.completed = this.facts();
          }
          conditional.started = true;
          const remaining = conditional.remaining;
          this.restore(remaining);
          if (structure instanceof Structures.Else || node.findDirectStatement(Statements.WhenOthers)) {
            conditional.remaining = undefined;
          }
        }
      } else if (structure instanceof Structures.Catch || structure instanceof Structures.Cleanup) {
        this.reachable = this.entryReachability.get(parent) ?? this.reachable;
        const aliases = this.aliasEntries.get(parent);
        this.joinAliases(aliases);
        if (aliases) {
          for (const [identifier, alias] of this.tableAliases) {
            aliases.set(identifier, alias);
          }
        }
      } else if (repeatingStructures.has(structure.constructor)) {
        this.iterationDepth++;
        this.aliasEntries.set(node, new Map(this.tableAliases));
        this.entryReachability.set(node, this.reachable);
        const count = structure instanceof Structures.Do ? node.findDirectStatement(Statements.Do)?.getChildren() : undefined;
        const once = count?.length === 4 && /^0*1$/.test(count[1].concatTokens()) && count[2].getFirstToken().getUpperStr() === "TIMES";
        this.loopAliases.push({node, backEdge: new Map(), seen: false, once,
          scheduledOnEntry: once ? undefined : this.procedure.scheduled});
      } else if (node.get() instanceof Structures.Try) {
        this.tryDepth++;
        this.aliasEntries.set(node, new Map(this.tableAliases));
        this.entryReachability.set(node, this.reachable);
        const handlers = node.findDirectStructures(Structures.Catch);
        if (handlers.some(handler =>
          handler.findDirectStatement(Statements.Catch)?.findDirectTokenByText("BEFORE") !== undefined)) {
          this.resumableTries.add(node);
          this.iterationDepth++;
          this.loopAliases.push({node, backEdge: new Map(), seen: false});
        } else if (handlers.some(handler => SortedKeyWrite.mayRetry(handler))) {
          this.retryingTries.add(node);
          this.iterationDepth++;
          this.loopAliases.push({node, backEdge: new Map(), seen: false});
        }
      }
    }
  }

  private static mayRetry(node: StructureNode): boolean {
    for (const child of node.getChildren()) {
      if (child instanceof StatementNode) {
        // An INCLUDE can contain a RETRY belonging to this handler.
        if (child.get() instanceof Statements.Retry || child.get() instanceof Statements.Include) {
          return true;
        }
      } else if (!(child.get() instanceof Structures.Catch) && SortedKeyWrite.mayRetry(child)) {
        return true;
      }
    }
    return false;
  }

  public leave(node: StructureNode): void {
    if (SortedKeyWrite.isProcedure(node)) {
      this.bindings.clear();
      this.appends.clear();
      this.tableAliases.clear();
      this.conditionals.length = 0;
      this.aliasEntries.clear();
      this.entryReachability.clear();
      this.loopAliases.length = 0;
      this.appendBlocks.clear();
      this.retryingTries.clear();
      this.resumableTries.clear();
      this.iterationDepth = 0;
      this.tryDepth = 0;
      this.procedure = undefined;
    } else if (this.bindings.size > 0 && node.get() instanceof Structures.Loop) {
      const loop = node.findDirectStatement(Statements.Loop);
      for (const [identifier, binding] of this.bindings) {
        if (binding.loop === loop) {
          this.bindings.delete(identifier);
        }
      }
    }
    if (this.procedure && (repeatingStructures.has(node.get().constructor)
        || this.retryingTries.delete(node) || this.resumableTries.delete(node))) {
      this.iterationDepth--;
      const loop = this.loopAliases.pop();
      if (loop && !(node.get() instanceof Structures.Try)) {
        this.recordBackEdge(loop);
        if (loop.scheduledOnEntry) {
          this.procedure.scheduled = {...loop.scheduledOnEntry, ...this.procedure.scheduled};
        }
        if (loop.exitFacts) {
          SortedKeyWrite.joinAppends(this.appends, loop.exitFacts.appends);
          this.mergeEffects(loop.exitFacts);
        }
      }
    }
    if (this.procedure && node.get() instanceof Structures.Try) {
      this.tryDepth--;
    }
    const entryAliases = this.aliasEntries.get(node);
    if (entryAliases) {
      this.joinAliases(entryAliases);
      this.aliasEntries.delete(node);
    }
    const reachable = this.entryReachability.get(node);
    if (reachable !== undefined) {
      this.reachable = reachable;
      this.entryReachability.delete(node);
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
    const conditional = this.currentConditional();
    if (conditional?.node === node) {
      this.join(conditional.completed);
      this.join(conditional.remaining);
      this.conditionals.pop();
    }
  }

  /** call before the statement is checked */
  public check(node: StatementNode, input: SyntaxInput): void {
    if (this.procedure?.scheduled && (node.get() instanceof Statements.Commit || node.get() instanceof Statements.Rollback)
        && node.findDirectTokenByText("WORK")) {
      const event = node.get() instanceof Statements.Commit ? "onCommit" : "onRollback";
      if (this.procedure.scheduled[event]) {
        this.forgetSharedTables(input.scope);
      }
      this.procedure.scheduled = undefined;
    }
    if (this.conditionals.length > 0 || this.loopAliases.length > 0 || this.tryDepth > 0) {
      const s = node.get();
      if (s instanceof Statements.Continue || s instanceof Statements.Retry) {
        this.recordControlBackEdge(s instanceof Statements.Retry);
        this.reachable = false;
      } else if (s instanceof Statements.Exit || s instanceof Statements.Return) {
        if (s instanceof Statements.Exit && this.reachable) {
          this.recordLoopExit();
        }
        this.reachable = false;
      }
    }
    if ((this.appends.size > 0 || this.tableAliases.size > 0) && node.get() instanceof Statements.AssignLocalCopy) {
      const name = node.findDirectExpression(Expressions.TargetFieldSymbol)?.concatTokens();
      const identifier = input.scope.findVariable(name);
      if (identifier !== undefined) {
        this.appends.delete(identifier);
        this.tableAliases.delete(identifier);
        this.rebindUnknownAlias(identifier, this.currentLoop());
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
          || (binding.tryDepth !== undefined && binding.tryDepth !== this.tryDepth)
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
        const pending = bindings === this.appends ? (binding as AppendBinding).pendingWrites : undefined;
        const checkExposure = binding.reference && binding.iterationDepth !== undefined && binding.iterationDepth > 0;
        if (pending || checkExposure) {
          // An address taken later in the body can survive into the next iteration.
          input.deferred.push(() => {
            if (!pending?.some(stale => stale())
                && (!checkExposure || (procedure?.loopDynamic !== true && procedure?.loopExposed?.has(identifier) !== true))) {
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
    if ((s instanceof Statements.Assign && input.tableAlias === undefined
        || s instanceof Statements.Append && node.getChildren().length <= 6)
        && this.bindings.size === 0 && this.appends.size === 0 && this.tableAliases.size === 0) {
      return;
    }
    if (this.appends.size > 0 && s instanceof Statements.Move && this.updateScalarMove(node, input.scope)) {
      return;
    }
    const alias = valid ? input.tableAlias : undefined;
    const source = alias?.source.findDirectExpression(Expressions.FieldChain);
    const sourceParts = alias?.source.getChildren();
    const dereferencedSource = sourceParts?.length === 2 && sourceParts[1].get() instanceof Expressions.Dereference;
    const origins = source && (sourceParts?.length === 1 || dereferencedSource)
      ? this.aliasOrigins(source, input.scope, alias?.fromReference || dereferencedSource) : undefined;
    if (valid && this.appends.size > 0) {
      this.checkWrites(node, input, this.appends);
      if (s instanceof Statements.MoveCorresponding && node.findDirectTokenByText("KEEPING") === undefined) {
        this.forgetCorrespondingRows(node, input);
      }
    }

    // any assignment of a field symbol or reference ends its binding,
    // skipped when nothing is bound, this runs for every statement
    const boundDereference = s instanceof Statements.Assign && (alias?.fromReference || dereferencedSource)
      && origins?.certain !== undefined && origins.carried === undefined;
    const keepTableAlias = this.tableAliases.size > 0 && !boundDereference && SortedKeyWrite.mayKeepTableAlias(node);
    if (this.bindings.size > 0 || this.appends.size > 0 || this.tableAliases.size > 0) {
      if (valid && s instanceof Statements.CallTransformation) {
        const result = node.findExpressionAfterToken("RESULT");
        for (const operand of result?.findDirectExpressions(Expressions.SimpleSource3) ?? []) {
          const chain = operand.findDirectExpression(Expressions.FieldChain);
          this.forgetTableRows(chain, input.scope, true);
          if (chain?.getChildren().length === 1) {
            const name = chain.findDirectExpression(Expressions.SourceField);
            const variable = name && input.scope.findVariable(name.concatTokens());
            if (variable) {
              this.tableAliases.delete(variable);
              this.rebindUnknownAlias(variable, this.currentLoop());
            }
          }
        }
      }
      for (const fs of node.findAllExpressions(Expressions.FSTarget)) {
        this.unbind(fs.findFirstExpression(Expressions.TargetFieldSymbol), input.scope, true, keepTableAlias);
      }
      if (s instanceof Statements.Unassign) {
        this.unbind(node.findDirectExpression(Expressions.TargetFieldSymbol), input.scope);
      }
      const writesHeader = s instanceof Statements.Move || s instanceof Statements.Clear;
      const mayRemoveRows = writesHeader || s instanceof Statements.DeleteInternal
        || s instanceof Statements.Free || s instanceof Statements.Refresh;
      const sqlInto = this.appends.size > 0 && (s instanceof Statements.Select || s instanceof Statements.SelectLoop
        || s instanceof Statements.With || s instanceof Statements.WithLoop)
        ? node.findFirstExpression(Expressions.SQLIntoTable) : undefined;
      const sqlTarget = sqlInto?.findDirectTokenByText("INTO") ? sqlInto.findFirstExpression(Expressions.Target) : undefined;
      for (const target of node.findAllExpressions(Expressions.Target)) {
        if ((mayRemoveRows || target === sqlTarget) && this.appends.size > 0) {
          this.forgetTableRows(target, input.scope, writesHeader);
        }
        if (target.getChildren().length === 1) {
          this.unbind(target.findDirectExpression(Expressions.TargetField), input.scope, !(s instanceof Statements.Perform),
                      keepTableAlias);
        }
      }
    }
    if (alias && origins && alias.target.getChildren().length === 1) {
      const name = alias.target.findFirstExpression(Expressions.TargetFieldSymbol)
        ?? alias.target.findFirstExpression(Expressions.TargetField);
      const variable = name && input.scope.findVariable(name.concatTokens());
      if (variable) {
        if (this.sharedStorage(variable, input.scope)) {
          (procedure.sharedAliases ??= new Set()).add(variable);
        }
        const iteration = this.currentLoop();
        const stable = !keepTableAlias && this.privateAlias(variable, input.scope);
        const value: TableAlias = {...origins, certain: stable ? origins.certain : undefined,
          iteration: stable ? iteration : undefined, identity: stable ? origins.identity : undefined};
        this.tableAliases.set(variable, keepTableAlias ? SortedKeyWrite.mergeAlias(this.tableAliases.get(variable), value) : value);
        // An exception or early loop exit can leave any earlier alias in effect.
        for (const possible of this.aliasEntries.values()) {
          possible.set(variable, SortedKeyWrite.mergeAlias(possible.get(variable), value));
        }
      }
    }

    if (this.conditionals.length > 0 && (s instanceof Statements.If || s instanceof Statements.ElseIf
        || s instanceof Statements.Case || s instanceof Statements.CaseType || s instanceof Statements.When)) {
      const conditional = this.currentConditional();
      if (conditional) {
        conditional.remaining = this.facts();
      }
    }
    if (this.loopAliases.length > 0 && s instanceof Statements.Check) {
      this.recordControlBackEdge(false);
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
        // APPEND needs at least seven children for an explicit destination and result.
        && node.getChildren().length > 6
        && (node.findDirectExpression(Expressions.FSTarget) !== undefined || node.findExpressionAfterToken("INTO") !== undefined)) {
      table = node.findExpressionAfterToken("TO");
      result = node;
    }
    if (table === undefined || result === undefined
        || result.findDirectTokenByText("CASTING") !== undefined
        || (result !== node && node.findDirectTokenByText("CASTING") !== undefined)) {
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
    const nameText = name?.concatTokens();
    const identifier = s instanceof Statements.Append && nameText !== undefined
      ? input.scope.findLocalVariable(nameText)
      : input.scope.findVariable(nameText);
    if (identifier === undefined
        || identifier.getFilename() !== procedure.filename
        || identifier.getStart().isBefore(procedure.start)) {
      return;
    }

    const key = SortedKeyWrite.findKey(SortedKeyWrite.findType(table, input.scope, s instanceof Statements.Append));
    if (key === undefined) {
      return;
    }
    if (s instanceof Statements.Append) {
      const meta = identifier.getMeta();
      if (reference && (!(identifier.getType() instanceof DataReference)
          || procedure.dynamicAddress || procedure.exposedReferences?.has(identifier) || procedure.staticVariables?.has(identifier)
          || (!meta.includes(IdentifierMeta.PassByValue) && (meta.includes(IdentifierMeta.FormParameter)
            || meta.includes(IdentifierMeta.FunctionModuleExporting) || meta.includes(IdentifierMeta.FunctionModuleChanging)
            || meta.includes(IdentifierMeta.MethodChanging) || meta.includes(IdentifierMeta.MethodExporting))))) {
        return;
      }
      // Keep the original TRY boundary for indirect tables whose identity is uncertain.
      const origin = this.tableOrigin(table, input.scope);
      const tryDepth = origin === undefined ? this.tryDepth : undefined;
      this.appends.set(identifier, {key, reference, block, iterationDepth: this.iterationDepth,
        table: origin, tryDepth});
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

  public readonly referenceMayChange = (operand: ExpressionNode | undefined, scope: CurrentScope, addressEscapes = true,
                                        tableArgument?: TableArgument): void => {
    const procedure = this.procedure;
    if (procedure === undefined) {
      return;
    }
    if (tableArgument === "routine") {
      this.forgetSharedTables(scope);
      return;
    } else if (tableArgument === "onCommit" || tableArgument === "onRollback") {
      procedure.scheduled = {...procedure.scheduled, [tableArgument]: true};
      return;
    }
    if (operand && tableArgument && this.appends.size > 0) {
      const argument = SortedKeyWrite.unwrapSource(operand);
      const address = tableArgument === "referent" && argument.findDirectTokenByText("REF")
        ? argument.findDirectExpression(Expressions.Source) : undefined;
      const actual = address ? SortedKeyWrite.unwrapSource(address) : argument;
      const parts = actual.getChildren();
      const chain = actual.get() instanceof Expressions.Target ? actual : actual.findDirectExpression(Expressions.FieldChain);
      const dereferenced = chain !== actual && parts.length === 2 && parts[1].get() instanceof Expressions.Dereference;
      if (chain && (chain === actual || parts.length === 1 || dereferenced)) {
        const fromReference = dereferenced || (tableArgument === "referent" && address === undefined);
        this.forgetTableRows(chain, scope, tableArgument === "write" || tableArgument === "output", undefined, fromReference);
        if (tableArgument === "write" && !dereferenced && chain.getChildren().length === 1) {
          // A writable data reference can also give the callee access to the table it points to.
          this.forgetTableRows(chain, scope, false, undefined, true);
        }
      }
    }
    if (tableArgument === "referent") {
      return;
    }
    if (operand?.get() instanceof Expressions.Dynamic) {
      procedure.dynamicAddress = true;
      procedure.loopDynamic = true;
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
        (procedure.loopExposed ??= new Set()).add(identifier);
      }
      this.appends.delete(identifier);
      const alias = this.tableAliases.get(identifier);
      if (alias && (addressEscapes || tableArgument)) {
        this.tableAliases.set(identifier, {paths: alias.paths, carried: alias.carried, shared: alias.shared});
      } else if (!alias && (addressEscapes || tableArgument)) {
        this.rebindUnknownAlias(identifier);
      }
    }
  };

  public markStatic(identifier: TypedIdentifier | undefined): void {
    if (this.procedure && identifier) {
      (this.procedure.staticVariables ??= new Set()).add(identifier);
    }
  }

  private forgetSharedTables(scope: CurrentScope): void {
    if (this.appends.size === 0) {
      return;
    }
    const external = this.loopAliases.length > 0 && this.procedure
      ? this.procedure.sharedAliases ??= new Set() : this.procedure?.sharedAliases;
    const visible: TableAlias[] = [];
    for (const [variable, origin] of this.tableAliases) {
      if (this.sharedStorage(variable, scope)) {
        visible.push(origin);
      }
    }
    const loopEntries = external ? this.loopAliases.map(loop => loop.backEdge) : [];
    for (const [identifier, binding] of this.appends) {
      const table = binding.table;
      if (!table) {
        continue;
      }
      if (table.shared || visible.some(origin => origin.paths.some(path =>
        table.paths.some(name => SortedKeyWrite.writesTable(path, name))))) {
        this.appends.delete(identifier);
      } else if (table.carried || visible.some(origin => origin.carried) || loopEntries.length > 0) {
        this.deferWrite(identifier, binding, () => {
          for (const alias of SortedKeyWrite.aliasAlternatives(table)) {
            if (alias?.shared) {
              return true;
            }
          }
          if (visible.some(origin => SortedKeyWrite.carriedWrite(origin, table))) {
            return true;
          }
          for (const entry of loopEntries) {
            for (const [variable, origin] of entry) {
              if (external?.has(variable) && SortedKeyWrite.carriedWrite(origin, table)) {
                return true;
              }
            }
          }
          return false;
        });
      }
    }
  }

  private privateAlias(variable: TypedIdentifier, scope: CurrentScope): boolean {
    const procedure = this.procedure;
    return !this.sharedStorage(variable, scope) && !procedure?.dynamicAddress && !procedure?.exposedReferences?.has(variable);
  }

  private sharedStorage(variable: TypedIdentifier, scope: CurrentScope): boolean {
    return scope.findLocalVariable(variable.getName()) !== variable || this.sharedLocalStorage(variable);
  }

  private sharedLocalStorage(variable: TypedIdentifier): boolean {
    const meta = variable.getMeta();
    return this.procedure?.staticVariables?.has(variable) === true
      || (!meta.includes(IdentifierMeta.PassByValue) && (meta.includes(IdentifierMeta.FormParameter)
        || meta.includes(IdentifierMeta.MethodImporting) || meta.includes(IdentifierMeta.MethodChanging)
        || meta.includes(IdentifierMeta.MethodExporting) || meta.includes(IdentifierMeta.FunctionModuleImporting)
        || meta.includes(IdentifierMeta.FunctionModuleExporting) || meta.includes(IdentifierMeta.FunctionModuleChanging)
        || meta.includes(IdentifierMeta.FunctionModuleTables)));
  }

  private static mayKeepTableAlias(node: StatementNode): boolean {
    const statement = node.get();
    if (!(statement instanceof Statements.Assign) && !(statement instanceof Statements.ReadTable)) {
      return false;
    }
    if (node.findDirectTokenByText("ELSE")) {
      return false;
    }
    if (statement instanceof Statements.ReadTable) {
      return true;
    }
    // Failed dynamic ASSIGN keeps the old field symbol unless ELSE UNASSIGN is present.
    const source = node.findDirectExpression(Expressions.AssignSource);
    const operand = source?.findDirectExpression(Expressions.Source);
    const chain = operand?.findDirectExpression(Expressions.FieldChain);
    return source?.getChildren().length !== 1 || operand?.getChildren().length !== 1 || chain === undefined
      || chain.findDirectExpression(Expressions.Dereference) !== undefined
      || chain.findDirectExpression(Expressions.Dynamic) !== undefined
      || chain.findDirectExpression(Expressions.TableExpression) !== undefined;
  }

  private updateScalarMove(node: StatementNode, scope: CurrentScope): boolean {
    const [target, , source] = node.getChildren();
    if (!(target instanceof ExpressionNode) || !(target.get() instanceof Expressions.Target)
        || target.getChildren().length !== 1 || !(target.getChildren()[0].get() instanceof Expressions.TargetField)
        || !(source instanceof ExpressionNode) || !(source.get() instanceof Expressions.Source)
        || source.getChildren().length !== 1) {
      return false;
    }
    const rhs = source.getChildren()[0];
    if (!(rhs.get() instanceof Expressions.Constant) && !(rhs instanceof ExpressionNode
        && rhs.get() instanceof Expressions.FieldChain && rhs.getChildren().length === 1
        && rhs.getChildren()[0].get() instanceof Expressions.SourceField)) {
      return false;
    }
    const identifier = scope.findVariable(target.getFirstToken().getStr());
    const type = identifier?.getType();
    if (identifier === undefined || type instanceof TableType || type instanceof StructureType || type instanceof DataReference
        || type?.isGeneric() || type instanceof UnknownType || type instanceof VoidType) {
      return false;
    }
    this.bindings.delete(identifier);
    this.appends.delete(identifier);
    this.tableAliases.delete(identifier);
    return true;
  }

  private unbind(node: ExpressionNode | undefined, scope: CurrentScope, append = true, keepTableAlias = false): void {
    const found = node ? scope.findVariable(node.concatTokens()) : undefined;
    if (found !== undefined) {
      this.bindings.delete(found);
      if (append) {
        this.appends.delete(found);
      }
      if (keepTableAlias) {
        const alias = this.tableAliases.get(found);
        if (alias) {
          this.tableAliases.set(found, {paths: alias.paths, carried: alias.carried, shared: alias.shared});
        } else {
          this.rebindUnknownAlias(found);
        }
      } else {
        this.tableAliases.delete(found);
        this.rebindUnknownAlias(found, this.currentLoop());
      }
    }
  }

  private rebindUnknownAlias(variable: TypedIdentifier, iteration?: TableAliases): void {
    if (this.loopAliases.length > 0 && this.loopAliases.some(loop => loop.observations?.has(variable))) {
      this.tableAliases.set(variable, {paths: [], iteration});
    }
  }

  private currentConditional(): Conditional | undefined {
    return this.conditionals[this.conditionals.length - 1];
  }

  private currentLoop(): TableAliases | undefined {
    return this.loopAliases[this.loopAliases.length - 1]?.backEdge;
  }

  private recordControlBackEdge(retry: boolean): void {
    for (let index = this.loopAliases.length - 1; index >= 0; index--) {
      const loop = this.loopAliases[index];
      if ((loop.node.get() instanceof Structures.Try) === retry) {
        this.recordBackEdge(loop);
        if (!retry && this.reachable) {
          this.saveLoopExit(loop);
        }
        return;
      }
    }
  }

  private recordLoopExit(): void {
    for (let index = this.loopAliases.length - 1; index >= 0; index--) {
      const loop = this.loopAliases[index];
      if (!(loop.node.get() instanceof Structures.Try)) {
        this.saveLoopExit(loop);
        return;
      }
    }
  }

  private saveLoopExit(loop: LoopAliases): void {
    const exit = loop.exitFacts;
    if (!exit) {
      loop.exitFacts = this.facts();
    } else {
      SortedKeyWrite.joinAppends(exit.appends, this.appends);
      for (const identifier of this.procedure?.exposedReferences ?? []) {
        (exit.exposed ??= new Set()).add(identifier);
      }
      exit.dynamic ||= this.procedure?.dynamicAddress;
      if (this.procedure?.scheduled) {
        exit.scheduled = {...exit.scheduled, ...this.procedure.scheduled};
      }
    }
  }

  private recordBackEdge(loop: LoopAliases): void {
    if (!this.reachable || loop.once) {
      return;
    }
    if (loop.seen) {
      this.joinAliases(this.tableAliases, loop.backEdge, true);
    } else {
      for (const [variable, alias] of this.tableAliases) {
        loop.backEdge.set(variable, alias);
      }
      loop.seen = true;
    }
  }

  private facts(): AppendFacts {
    const exposed = this.procedure?.exposedReferences;
    return {
      appends: new Map(this.appends),
      aliases: new Map(this.tableAliases),
      exposed: exposed && new Set(exposed),
      dynamic: this.procedure?.dynamicAddress,
      reachable: this.reachable,
      scheduled: this.procedure?.scheduled,
    };
  }

  private restore(facts: AppendFacts): void {
    this.reachable = facts.reachable;
    this.appends = new Map(facts.appends);
    this.tableAliases = new Map(facts.aliases);
    if (this.procedure) {
      this.procedure.exposedReferences = facts.exposed && new Set(facts.exposed);
      this.procedure.dynamicAddress = facts.dynamic;
      this.procedure.scheduled = facts.scheduled;
    }
  }

  private join(other: AppendFacts | undefined): void {
    if (!other?.reachable) {
      return;
    } else if (!this.reachable) {
      this.restore(other);
      return;
    }
    SortedKeyWrite.joinAppends(this.appends, other.appends);
    this.joinAliases(other.aliases, this.tableAliases, true);
    this.mergeEffects(other);
  }

  private mergeEffects(other: AppendFacts): void {
    if (this.procedure) {
      for (const identifier of other.exposed ?? []) {
        (this.procedure.exposedReferences ??= new Set()).add(identifier);
      }
      this.procedure.dynamicAddress ||= other.dynamic;
      if (other.scheduled) {
        this.procedure.scheduled = {...this.procedure.scheduled, ...other.scheduled};
      }
    }
  }

  private static joinAppends(into: Map<TypedIdentifier, AppendBinding>, other: Map<TypedIdentifier, AppendBinding>): void {
    for (const [identifier, binding] of into) {
      const alternative = other.get(identifier);
      if (!alternative || (alternative.original ?? alternative) !== (binding.original ?? binding)) {
        into.delete(identifier);
      } else if (alternative !== binding && alternative.pendingWrites) {
        const pendingWrites = [...new Set([...binding.pendingWrites ?? [], ...alternative.pendingWrites])];
        into.set(identifier, {...binding, original: binding.original ?? binding, pendingWrites});
      }
    }
  }

  private joinAliases(other: TableAliases | undefined, into = this.tableAliases, correlate = false): void {
    if (!other) {
      return;
    }
    for (const [identifier, alias] of into) {
      if (!other.has(identifier)) {
        into.set(identifier, SortedKeyWrite.mergeAlias(alias, undefined));
      }
    }
    const pairs = correlate ? new Map<object | string, Map<object | string, object>>() : undefined;
    for (const [identifier, alias] of other) {
      const current = into.get(identifier);
      const merged = SortedKeyWrite.mergeAlias(current, alias);
      if (pairs && current && current !== alias) {
        const left = this.aliasKey(identifier, current);
        const right = this.aliasKey(identifier, alias);
        if (left === right && typeof left === "object") {
          into.set(identifier, {...merged, identity: left});
          continue;
        }
        let rightKeys = pairs.get(left);
        if (!rightKeys) {
          rightKeys = new Map();
          pairs.set(left, rightKeys);
        }
        const identity = rightKeys.get(right) ?? {};
        rightKeys.set(right, identity);
        into.set(identifier, {...merged, identity});
      } else {
        into.set(identifier, merged);
      }
    }
  }

  private aliasKey(variable: TypedIdentifier, alias: TableAlias): object | string {
    const loop = this.loopAliases[this.loopAliases.length - 1];
    if (loop && alias.iteration !== loop.backEdge) {
      return loop.observations?.get(variable)?.get(alias) ?? alias;
    }
    return (alias.carried ? undefined : alias.certain) ?? alias.identity ?? alias;
  }

  private static mergeAlias(left: TableAlias | undefined, right: TableAlias | undefined): TableAlias {
    if (left && left === right) {
      return left;
    }
    const paths = left && right && left.paths !== right.paths
      ? [...new Set([...left.paths, ...right.paths])] : left?.paths ?? right?.paths ?? [];
    const iteration = left?.iteration === right?.iteration ? left?.iteration : undefined;
    const certain = left?.certain === right?.certain ? left?.certain : undefined;
    const carried = left?.carried && right?.carried && left.carried !== right.carried
      ? [...new Set([...left.carried, ...right.carried])] : left?.carried ?? right?.carried;
    const identity = left?.identity === right?.identity ? left?.identity : undefined;
    const entryIdentity = left?.entryIdentity === right?.entryIdentity ? left?.entryIdentity : undefined;
    return {paths, certain, iteration, carried, identity, entryIdentity, shared: left?.shared || right?.shared};
  }

  private aliasOrigins(source: ExpressionNode, scope: CurrentScope, fromReference: boolean): TableAlias | undefined {
    const type = SortedKeyWrite.findType(source, scope, true);
    if (type instanceof TableType && type.isWithHeader() && !source.getFirstToken().getStr().startsWith("<")
        && source.findDirectExpression(Expressions.TableBody) === undefined) {
      return undefined;
    }
    return this.tableOrigin(source, scope, fromReference);
  }

  private forgetCorrespondingRows(node: StatementNode, input: SyntaxInput): void {
    const target = node.findDirectExpression(Expressions.SimpleTarget);
    const types = input.corresponding;
    if (target === undefined || types === undefined) {
      return;
    }
    let stillWrites: (() => boolean) | undefined;
    if (types.source instanceof TableType && types.target instanceof TableType
        && !SortedKeyWrite.rowsCorrespond(types.source.getRowType(), types.target.getRowType())) {
      return;
    }
    if (!(types.source instanceof StructureType) && !(types.target instanceof StructureType)) {
      const source = node.findDirectExpression(Expressions.Source);
      const left = source && this.operandOrigin(source, input.scope);
      const right = this.tableOrigin(target, input.scope);
      if (source?.concatTokens().replace(/[\s!]/g, "").toUpperCase() === target.concatTokens().replace(/[\s!]/g, "").toUpperCase()) {
        return;
      }
      if (left?.identity !== undefined && left.identity === right?.identity) {
        return;
      }
      if (left && right && left.certain !== undefined && left.certain === right.certain) {
        if (!left.carried && !right.carried) {
          return;
        }
        const path = left.certain;
        stillWrites = () => (!SortedKeyWrite.isCertainTable(left, path) || !SortedKeyWrite.isCertainTable(right, path))
          && !SortedKeyWrite.sameLoopTable(left, right);
      } else if (left?.entryIdentity !== undefined && left.entryIdentity === right?.entryIdentity) {
        stillWrites = () => !SortedKeyWrite.sameLoopTable(left, right);
      }
    }
    this.forgetTableRows(target, input.scope, true, types, false, stillWrites);
  }

  private static rowsCorrespond(source: AbstractType, target: AbstractType): boolean {
    if (source instanceof StructureType && target instanceof StructureType) {
      return target.getComponents().some(component => {
        const other = source.getComponentByName(component.name);
        return other !== undefined && (!(other instanceof StructureType) || !(component.type instanceof StructureType)
          || SortedKeyWrite.rowsCorrespond(other, component.type));
      });
    }
    return (source instanceof StructureType) === (target instanceof StructureType)
      || source.isGeneric() || target.isGeneric() || source instanceof VoidType || target instanceof VoidType
      || source instanceof UnknownType || target instanceof UnknownType;
  }

  private forgetTableRows(target: ExpressionNode | undefined, scope: CurrentScope, writesHeader: boolean,
                          corresponding?: CorrespondingTypes, fromReference = false, stillWrites?: () => boolean): void {
    if (target === undefined || this.appends.size === 0) {
      return;
    }
    const token = target.getFirstToken().getUpperStr();
    const root = token.startsWith("!") ? token.slice(1) : token;
    const part = target.getChildren()[1]?.get();
    const throughAlias = fromReference || root.startsWith("<") || part instanceof Expressions.Dereference;
    const indirect = throughAlias || root === "ME" || root === "SUPER" || part instanceof StaticArrow;
    let destinations: TableAlias | null | undefined;
    for (const [identifier, binding] of this.appends) {
      const table = binding.table;
      if (!table) {
        continue;
      }
      if (!indirect && !table.carried && !table.paths.some(table => table === root || table.startsWith(root + "-")
          || table === "ME->" + root || table.startsWith("ME->" + root + "-")
          || table.includes("=>"))) {
        continue;
      }
      if (destinations === undefined) {
        destinations = this.tableOrigin(target, scope, fromReference) ?? null;
      }
      const matches = destinations?.paths.some(path => table.paths.some(name => SortedKeyWrite.writesTable(path, name, corresponding)));
      if (matches || (destinations && (destinations.carried || table.carried || stillWrites))) {
        if (writesHeader && !throughAlias && target.findDirectExpression(Expressions.TableBody) === undefined) {
          const type = SortedKeyWrite.findType(target, scope, true);
          if (type instanceof TableType && type.isWithHeader()) {
            return;
          }
        }
        if (matches && !stillWrites) {
          this.appends.delete(identifier);
          continue;
        }
      }
      if (destinations && (destinations.carried || table.carried || stillWrites)) {
        // An earlier iteration can bind this operand to a table before the current iteration starts.
        const origin = destinations;
        const stale = () => (!stillWrites || stillWrites()) && SortedKeyWrite.carriedWrite(origin, table, corresponding);
        this.deferWrite(identifier, binding, stale);
      }
    }
  }

  private deferWrite(identifier: TypedIdentifier, binding: AppendBinding, stale: () => boolean): void {
    this.appends.set(identifier, {
      ...binding,
      original: binding.original ?? binding,
      pendingWrites: [...binding.pendingWrites ?? [], stale],
    });
  }

  private static carriedWrite(destination: TableAlias, original: TableAlias, corresponding?: CorrespondingTypes): boolean {
    const tables = new Set<string>();
    for (const alias of SortedKeyWrite.aliasAlternatives(original)) {
      for (const path of alias?.paths ?? []) {
        tables.add(path);
      }
    }
    for (const alias of SortedKeyWrite.aliasAlternatives(destination)) {
      for (const path of alias?.paths ?? []) {
        for (const table of tables) {
          if (SortedKeyWrite.writesTable(path, table, corresponding)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private static isCertainTable(origin: TableAlias, expected: string): boolean {
    for (const alias of SortedKeyWrite.aliasAlternatives(origin)) {
      if (alias?.certain !== expected) {
        return false;
      }
    }
    return true;
  }

  private static sameLoopTable(left: TableAlias, right: TableAlias): boolean {
    const pending: [TableAlias, TableAlias][] = [[left, right]];
    const seen = new Map<TableAlias, Set<TableAlias>>();
    while (pending.length > 0) {
      const [a, b] = pending.pop()!;
      let paired = seen.get(a);
      if (paired?.has(b) || (a.identity !== undefined && a.identity === b.identity)) {
        continue;
      }
      if (!paired) {
        paired = new Set();
        seen.set(a, paired);
      }
      paired.add(b);
      const sameInitialPath = a.certain !== undefined && a.certain === b.certain;
      if (sameInitialPath && this.isCertainTable(a, a.certain!) && this.isCertainTable(b, a.certain!)) {
        continue;
      }
      if ((!sameInitialPath && (a.entryIdentity ?? a.identity ?? a) !== (b.entryIdentity ?? b.identity ?? b))
          || (a.carried?.length ?? 0) !== (b.carried?.length ?? 0)) {
        return false;
      }
      const compared = new Set<LoopAliases>();
      for (const edge of a.carried ?? []) {
        const matches = b.carried?.filter(candidate => candidate.loop === edge.loop);
        if (compared.has(edge.loop) || matches?.length !== 1) {
          return false;
        }
        compared.add(edge.loop);
        if (!edge.loop.seen) {
          continue;
        }
        const match = matches[0];
        const aNext = edge.loop.backEdge.get(edge.variable);
        const bNext = match.loop.backEdge.get(match.variable);
        if (!aNext || !bNext) {
          return false;
        }
        pending.push([aNext, bNext]);
      }
    }
    return true;
  }

  private static *aliasAlternatives(origin: TableAlias): Iterable<TableAlias | undefined> {
    const pending: (TableAlias | undefined)[] = [origin];
    const seen = new Set<TableAlias>();
    while (pending.length > 0) {
      const alias = pending.pop();
      if (alias === undefined) {
        yield undefined;
        continue;
      } else if (seen.has(alias)) {
        continue;
      }
      seen.add(alias);
      yield alias;
      for (const {loop, variable} of alias.carried ?? []) {
        if (loop.seen) {
          pending.push(loop.backEdge.get(variable));
        }
      }
    }
  }

  private static writesTable(path: string, table: string, corresponding?: CorrespondingTypes): boolean {
    if (table === path) {
      return true;
    } else if (!table.startsWith(path + "-")) {
      return false;
    }
    if (corresponding === undefined) {
      return true;
    }
    let {source, target} = corresponding;
    for (const component of table.slice(path.length + 1).split("-")) {
      source = source instanceof StructureType ? source.getComponentByName(component) : undefined;
      target = target instanceof StructureType ? target.getComponentByName(component) : undefined;
    }
    return source instanceof TableType && (!corresponding.expanding || !(target instanceof TableType)
      || SortedKeyWrite.rowsCorrespond(source.getRowType(), target.getRowType()));
  }

  private operandOrigin(operand: ExpressionNode, scope: CurrentScope, fromReference = false): TableAlias | undefined {
    operand = SortedKeyWrite.unwrapSource(operand);
    if (operand.get() instanceof Expressions.Target || operand.get() instanceof Expressions.SimpleTarget) {
      return this.tableOrigin(operand, scope, fromReference);
    }
    const parts = operand.getChildren();
    const chain = operand.findDirectExpression(Expressions.FieldChain);
    const dereferenced = parts.length === 2 && parts[1].get() instanceof Expressions.Dereference;
    if (chain && (parts.length === 1 || dereferenced)) {
      return this.tableOrigin(chain, scope, fromReference || dereferenced);
    }
    return undefined;
  }

  private static unwrapSource(operand: ExpressionNode): ExpressionNode {
    while (operand.get() instanceof Expressions.Source) {
      const [open, inner, close, extra] = operand.getChildren();
      if (extra || open?.getFirstToken().getStr() !== "(" || close?.getFirstToken().getStr() !== ")"
          || !(inner instanceof ExpressionNode) || !(inner.get() instanceof Expressions.Source)) {
        break;
      }
      operand = inner;
    }
    return operand;
  }

  private static tableAliasName(target: ExpressionNode, fromReference: boolean): string | undefined {
    const children = target.getChildren();
    const root = children[0]?.getFirstToken().getUpperStr().replace(/^!/, "");
    const part = children[1]?.get();
    const wholeTableSymbol = root?.startsWith("<") && (children.length === 1 || part instanceof Expressions.TableBody);
    const dereferenced = part instanceof Expressions.Dereference
      && (children.length === 2 || children[2]?.get() instanceof Expressions.TableBody);
    return wholeTableSymbol || dereferenced || (fromReference && children.length === 1) ? root : undefined;
  }

  private tableOrigin(target: ExpressionNode, scope: CurrentScope, fromReference = false): TableAlias | undefined {
    const name = SortedKeyWrite.tableAliasName(target, fromReference);
    if (name !== undefined) {
      const variable = scope.findVariable(name);
      const alias = variable && this.tableAliases.get(variable);
      const stable = variable && this.privateAlias(variable, scope);
      if (variable && this.loopAliases.length > 0 && alias?.iteration !== this.currentLoop()) {
        // Keep entry aliases symbolic so copies made before a later rebinding see it on the next pass.
        const assigned = this.loopAliases.findIndex(loop => loop.backEdge === alias?.iteration);
        const carried = new Set(alias?.carried);
        const carriedLoops = this.loopAliases.slice(assigned + 1).filter(loop => !loop.once);
        for (const loop of carriedLoops) {
          const entries = loop.entries ??= new Map();
          let entry = entries.get(variable);
          if (!entry) {
            entry = {loop, variable};
            entries.set(variable, entry);
          }
          carried.add(entry);
        }
        if (carriedLoops.length === 0 && alias) {
          return stable ? {...alias, identity: alias.identity ?? alias}
            : {...alias, identity: undefined, entryIdentity: undefined, certain: undefined};
        }
        let identity: object | undefined;
        if (stable) {
          const loop = this.loopAliases[this.loopAliases.length - 1];
          const observations = loop.observations ??= new Map();
          let observation = observations.get(variable);
          if (!observation) {
            observation = new Map();
            observations.set(variable, observation);
          }
          identity = observation.get(alias);
          if (!identity) {
            identity = {};
            observation.set(alias, identity);
          }
        }
        return {paths: alias?.paths ?? [], certain: stable ? alias?.certain : undefined,
          carried: [...carried], identity, entryIdentity: stable && alias ? alias.identity ?? alias : undefined, shared: alias?.shared};
      }
      if (alias && !stable && (alias.identity || alias.certain)) {
        return {...alias, identity: undefined, entryIdentity: undefined, certain: undefined};
      }
      return alias && stable && !alias.identity ? {...alias, identity: alias} : alias;
    } else if (fromReference) {
      return undefined;
    }
    const parts = target.getChildren();
    const root = target.getFirstToken().getUpperStr().replace(/^!/, "");
    const first = parts[0]?.get();
    const path = parts.length === 1 && (first instanceof Expressions.TargetField || first instanceof Expressions.SourceField)
      ? root : target.concatTokens().replace(/[\s!]/g, "").replace(/\[\]$/, "").toUpperCase();
    const explicitSuper = path.startsWith("SUPER->");
    const member = path.startsWith("ME->") ? path.slice(4) : explicitSuper ? path.slice(7) : path;
    // Indirect table operands can denote different tables at the two statements.
    if (member.includes("->") || member.startsWith("<")) {
      return undefined;
    }
    const qualified = parts[1]?.get() instanceof StaticArrow;
    const explicitSelf = member !== path;
    const local = !qualified && !explicitSelf ? scope.findLocalVariable(root) : undefined;
    const enclosing = explicitSelf ? scope.getEnclosingClassName() : undefined;
    const qualifier = qualified ? root : explicitSuper ? scope.findClassDefinition(enclosing)?.getSuperClass() : enclosing;
    let attribute = qualified || explicitSelf
      ? SortedKeyWrite.findAttribute(scope, qualifier, parts[2]?.getFirstToken().getStr())
      : local ?? scope.findVariable(root);
    if (!local && !qualified && !explicitSelf && attribute?.getMeta().includes(IdentifierMeta.Static)
        && !(attribute instanceof ClassAttribute)) {
      attribute = SortedKeyWrite.findAttribute(scope, scope.getEnclosingClassName(), root);
    }
    let canonical = path;
    if (attribute?.getMeta().includes(IdentifierMeta.Static) && attribute instanceof ClassAttribute) {
      const owner = SortedKeyWrite.staticOwner(scope, qualifier ?? scope.getEnclosingClassName(), attribute);
      if (owner === undefined) {
        return undefined;
      }
      const position = attribute.getStart();
      const field = (qualified || explicitSelf ? parts[2] : parts[0])?.getFirstToken().getUpperStr().replace(/^!/, "") ?? "";
      const suffix = (qualified ? path.slice(root.length + 2) : member).slice(field.length);
      const declared = attribute.getName().toUpperCase().split("~").pop();
      canonical = owner + ":" + attribute.getFilename() + ":" + position.getRow() + ":" + position.getCol() + "=>" + declared + suffix;
    } else if (explicitSuper) {
      return undefined;
    } else if (!qualified && !explicitSelf && attribute instanceof ClassAttribute) {
      canonical = "ME->" + path;
    }
    const shared = !local || this.sharedLocalStorage(local);
    return {paths: [canonical], certain: canonical, iteration: this.currentLoop(), shared};
  }

  private static findAttribute(scope: CurrentScope, className: string | undefined, attribute: string | undefined
  ): TypedIdentifier | undefined {
    const def = scope.findObjectDefinition(className);
    return attribute && def ? new ObjectOriented(scope).searchAttributeName(def, attribute) : undefined;
  }

  private static staticOwner(scope: CurrentScope, qualifier: string | undefined, attribute: ClassAttribute): string | undefined {
    let owner = scope.findClassDefinition(qualifier);
    if (owner === undefined) {
      return undefined;
    }
    const objects = new ObjectOriented(scope);
    const declaring = objects.findAttributeOwner(owner, attribute);
    if (declaring) {
      return declaring.getName().toUpperCase();
    }
    // Interface attributes have separate storage in each implementing class tree.
    const visited = new Set([owner.getName().toUpperCase()]);
    let parent = scope.findClassDefinition(owner.getSuperClass());
    while (parent && !visited.has(parent.getName().toUpperCase()) && objects.findInterfaces(parent).some(i =>
      objects.searchAttributeName(scope.findInterfaceDefinition(i.name), attribute.getName()) === attribute)) {
      owner = parent;
      visited.add(owner.getName().toUpperCase());
      parent = scope.findClassDefinition(owner.getSuperClass());
    }
    return owner.getName().toUpperCase();
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
  private static findType(node: ExpressionNode, scope: CurrentScope, allowStatic = false): AbstractType | undefined {
    const parsed = node.get();
    const chain = parsed instanceof Expressions.Target || parsed instanceof Expressions.SimpleTarget
      || parsed instanceof Expressions.FieldChain
      ? node
      : node.getChildren().length === 1 ? node.findDirectExpression(Expressions.FieldChain) : undefined;
    const children = chain?.getChildren() || [];
    const first = children[0];
    const qualified = allowStatic && children[1]?.get() instanceof StaticArrow;
    if (!qualified && !(first?.get() instanceof Expressions.SourceField) && !(first?.get() instanceof Expressions.SourceFieldSymbol)
        && !(first?.get() instanceof Expressions.TargetField) && !(first?.get() instanceof Expressions.TargetFieldSymbol)) {
      return undefined;
    }

    let type = qualified
      ? this.findAttribute(scope, first?.concatTokens(), children[2]?.getFirstToken().getStr())?.getType()
      : scope.findVariable(first.concatTokens())?.getType();
    for (let i = qualified ? 3 : 1; i < children.length && type !== undefined; i++) {
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
