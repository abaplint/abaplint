import * as E from "../abap/2_statements/expressions";
import * as S from "../abap/2_statements/statements";
import {Comment, Empty} from "../abap/2_statements/statements/_statement";
import * as B from "../abap/3_structures/structures";
import {AbstractToken} from "../abap/1_lexer/tokens/abstract_token";
import {Identifier} from "../abap/4_file_information/_identifier";
import {Visibility} from "../abap/4_file_information/visibility";
import {IReference, ReferenceType} from "../abap/5_syntax/_reference";
import {ISpaghettiScope} from "../abap/5_syntax/_spaghetti_scope";
import {ExpressionNode, StatementNode, StructureNode} from "../abap/nodes";
import {INode} from "../abap/nodes/_inode";
import {TypedIdentifier, IdentifierMeta} from "../abap/types/_typed_identifier";
import {DataReference, ObjectReferenceType, StructureType, TableType, TableAccessType} from "../abap/types/basic";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {IMethodDefinition} from "../abap/types/_method_definition";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject} from "../objects/_abap_object";
import {FunctionGroup} from "../objects/function_group";
import {ClassAttribute} from "../abap/types/class_attribute";
import {SELECTION_EVENTS} from "../stuff";

type Location = {key: string, origins: readonly string[]};
type Binding = {targets: readonly Location[], unknown: boolean};
type State = {aliases: Map<string, Binding>, values: Map<string, Binding>, written: Set<string>, stopped: boolean};
type Write = {binding: Binding, token: AbstractToken, file: ABAPFile};
type Procedure = {node: StructureNode, file: ABAPFile, key: string, parameters: TypedIdentifier[], returning?: TypedIdentifier,
  valueOutputs?: Set<string>, locals?: string[], self?: string, me?: string};
type Summary = {writes: Write[], values: Map<string, Binding>, updates: Map<string, Binding>, returning: Binding};
export type ReadOnlyFinding = {file: ABAPFile, token: AbstractToken, origins: string[], possible: boolean};

const unknown = (): Binding => ({targets: [], unknown: true});
const empty = (): Binding => ({targets: [], unknown: false});
const cell = (key: string, origins: readonly string[] = []): Binding => ({targets: [{key, origins}], unknown: false});
const positionKey = (id: Identifier) => id.getFilename() + ":" + id.getStart().getRow() + ":" + id.getStart().getCol();
const idKey = (id: Identifier) => encodeURIComponent(id.getFilename()) + ":" + id.getStart().getRow()
  + ":" + id.getStart().getCol() + ":" + id.getName().toUpperCase();
const tokenKey = (file: ABAPFile, token: AbstractToken) => file.getFilename() + ":" + token.getRow() + ":" + token.getCol();
const allocationKey = (file: ABAPFile, token: AbstractToken) => encodeURIComponent(tokenKey(file, token));
const initialOutput = (param: TypedIdentifier) => param.getMeta().includes(IdentifierMeta.MethodReturning)
  || (param.getMeta().includes(IdentifierMeta.PassByValue)
    && (param.getMeta().includes(IdentifierMeta.MethodExporting) || param.getMeta().includes(IdentifierMeta.FunctionModuleExporting)));
const isAggregate = (type: AbstractType | undefined): type is StructureType | TableType =>
  type instanceof StructureType || type instanceof TableType;

function union(...bindings: Binding[]): Binding {
  const targets = new Map<string, Location>();
  for (const b of bindings) {
    for (const t of b.targets) {
      targets.set(t.key + ":" + t.origins.join(","), t);
    }
  }
  if (targets.size > 32 || [...targets.values()].some(t => t.key === "*")) {
    // Widen recursive heaps; retain possible protection instead of enumerating every pointer path.
    const origins = [...new Set([...targets.values()].flatMap(t => t.origins))].sort();
    return {targets: [{key: "*", origins}, ...[...targets.values()].some(t => t.origins.length === 0)
      ? [{key: "*", origins: []}] : []], unknown: true};
  }
  return {targets: [...targets.values()].sort((a, b) =>
    (a.key + a.origins.join()).localeCompare(b.key + b.origins.join())), unknown: bindings.some(b => b.unknown)};
}

function clone(state: State): State {
  return {aliases: new Map(state.aliases), values: new Map(state.values), written: new Set(state.written), stopped: state.stopped};
}

function join(states: State[]): State {
  const live = states.filter(s => !s.stopped);
  const result: State = {aliases: new Map(), values: new Map(),
    written: new Set(live.flatMap(s => [...s.written])), stopped: live.length === 0};
  for (const name of ["aliases", "values"] as const) {
    for (const key of new Set(live.flatMap(s => [...s[name].keys()]))) {
      result[name].set(key, union(...live.map(s => s[name].get(key) ?? (name === "aliases" ? empty() : unknown()))));
    }
  }
  return result;
}

function fingerprint(state: State): string {
  return JSON.stringify([...[...state.aliases].sort(), ...[...state.values].sort()]);
}

/** Binding permissions belong to access paths, not types or permanently to a field symbol. */
export class ReadOnlyFlow {
  private readonly refs = new Map<string, IReference[]>();
  private readonly procedures: Procedure[] = [];
  private readonly summaries = new Map<string, Summary>();
  private readonly callers = new Map<string, Set<Procedure>>();
  private readonly calls = new Map<string, Binding>();
  private writes: Write[] = [];
  private exits: State[] = [];
  private loops: {breaks: State[], continues: State[]}[] = [];
  private exceptions: State[][] = [];

  public constructor(private readonly obj: ABAPObject, private readonly scope: ISpaghettiScope) {
    const stack = [scope.getTop()];
    while (stack.length > 0) {
      const node = stack.pop()!;
      for (const ref of node.getData().references) {
        const key = positionKey(ref.position);
        this.refs.set(key, [...this.refs.get(key) ?? [], ref]);
      }
      stack.push(...node.getChildren());
    }
    for (const file of obj.getABAPFiles()) {
      const root = file.getStructure();
      if (root) {
        this.collect(root, file);
        this.procedures.push({node: root, file, key: file.getFilename(), parameters: []});
      }
    }
  }

  public run(): ReadOnlyFinding[] {
    if (![...this.refs.values()].some(rs => rs.some(r => r.extra?.readOnly))) {
      return [];
    }
    // Revisit callers when their callee changes, including recursive calls.
    const queue = [...this.procedures];
    const queued = new Set(queue.map(p => p.key));
    for (const p of queue) {
      queued.delete(p.key);
      const summary = this.analyze(p);
      if (this.summaryKey(summary) === this.summaryKey(this.summaries.get(p.key))) {
        continue;
      }
      this.summaries.set(p.key, summary);
      for (const caller of this.callers.get(p.key) ?? []) {
        if (!queued.has(caller.key)) {
          queue.push(caller);
          queued.add(caller.key);
        }
      }
    }
    const findings = new Map<string, ReadOnlyFinding>();
    for (const summary of this.summaries.values()) {
      for (const w of summary.writes) {
        const origins = [...new Set(w.binding.targets.flatMap(t => t.origins).filter(o => !o.startsWith("@")))];
        if (origins.length === 0) {
          continue;
        }
        const possible = w.binding.unknown || w.binding.targets.some(t => t.origins.length === 0
          || t.origins.every(o => o.startsWith("@")));
        const key = tokenKey(w.file, w.token);
        const old = findings.get(key);
        findings.set(key, {file: w.file, token: w.token, origins: [...new Set([...old?.origins ?? [], ...origins])],
          possible: possible || old?.possible === true});
      }
    }
    return [...findings.values()];
  }

  private summaryKey(s: Summary | undefined): string {
    return s === undefined ? "" : JSON.stringify([s.writes.map(w => [tokenKey(w.file, w.token), w.binding]),
      [...s.values].sort(), [...s.updates].sort(), s.returning]);
  }

  private collect(node: StructureNode, file: ABAPFile): void {
    if (node.get() instanceof B.Method || node.get() instanceof B.Form || node.get() instanceof B.FunctionModule) {
      const first = node.getFirstStatement()!;
      const ref = first.getTokens().flatMap(t => this.references(file, t)).find(r =>
        r.referenceType === ReferenceType.MethodImplementationReference || r.referenceType === ReferenceType.FormReference);
      const formName = first.findDirectExpression(E.FormName)?.concatTokens();
      const s = this.scope.lookupPosition(first.getEnd(), file.getFilename());
      const def = ref?.resolved ?? (formName ? s?.findFormDefinition(formName) : undefined);
      let variables = Object.values(s?.getData().vars ?? {});
      if (node.get() instanceof B.FunctionModule && this.obj instanceof FunctionGroup) {
        const name = first.findDirectExpression(E.Field)?.concatTokens();
        const definition = name ? this.obj.getModule(name) : undefined;
        variables = definition?.getParameters().map(param => s?.findVariable(param.name))
          .filter((v): v is TypedIdentifier => v !== undefined) ?? variables;
      }
      const parameters = variables.filter(v => v.getMeta().some(m =>
        [IdentifierMeta.MethodImporting, IdentifierMeta.MethodExporting, IdentifierMeta.MethodChanging,
          IdentifierMeta.MethodReturning, IdentifierMeta.FormParameter, IdentifierMeta.FunctionModuleImporting,
          IdentifierMeta.FunctionModuleExporting, IdentifierMeta.FunctionModuleChanging, IdentifierMeta.FunctionModuleTables].includes(m)));
      const me = s?.findVariable("ME");
      const meType = me?.getType();
      this.procedures.push({node, file, key: def ? idKey(def) : tokenKey(file, first.getFirstToken()), parameters,
        self: meType instanceof ObjectReferenceType ? "$self:" + meType.getIdentifierName().toUpperCase() : undefined,
        me: me ? idKey(me) : undefined,
        returning: parameters.find(p => p.getMeta().includes(IdentifierMeta.MethodReturning)),
        locals: variables.filter(v => !parameters.includes(v) && v.getFilename() === file.getFilename()
          && v.getStart().isBetween(node.getFirstToken().getStart(), node.getLastToken().getEnd())).map(idKey),
        valueOutputs: new Set(parameters.filter(p => p.getMeta().includes(IdentifierMeta.MethodChanging)
          || p.getMeta().includes(IdentifierMeta.MethodExporting)
          || p.getMeta().includes(IdentifierMeta.FunctionModuleChanging) || p.getMeta().includes(IdentifierMeta.FunctionModuleExporting)
          || first.findDirectExpression(E.FormChanging)?.findAllExpressions(E.FormParamName)
            .some(n => n.concatTokens().toUpperCase() === p.getName().toUpperCase())).map(idKey))});
      return;
    }
    for (const c of node.getChildren()) {
      if (c instanceof StructureNode) {
        this.collect(c, file);
      }
    }
  }

  private references(file: ABAPFile, token: AbstractToken): readonly IReference[] {
    return this.refs.get(tokenKey(file, token)) ?? [];
  }

  private identifier(node: INode, file: ABAPFile): TypedIdentifier | undefined {
    const tokens = node instanceof ExpressionNode || node instanceof StatementNode ? node.getTokens() : [node.getFirstToken()];
    for (const t of tokens) {
      const found = this.references(file, t).find(r => r.resolved instanceof TypedIdentifier)?.resolved;
      if (found instanceof TypedIdentifier) {
        return found;
      }
    }
    return undefined;
  }

  private analyze(p: Procedure): Summary {
    this.writes = [];
    this.exits = [];
    this.loops = [];
    this.exceptions = [];
    const state: State = {aliases: new Map(), values: new Map(), written: new Set(), stopped: false};
    if (p.self && p.me) {
      state.values.set(p.me, cell(p.self));
    }
    for (const param of p.parameters) {
      this.seedComponents(cell(idKey(param)), state, param.getType(), !initialOutput(param));
    }
    const initialize = (node: StructureNode) => {
      for (const child of node.getChildren()) {
        const type = child.get();
        if (child instanceof StructureNode && !(type instanceof B.Method || type instanceof B.Form
            || type instanceof B.FunctionModule || type instanceof B.ClassDefinition
            || type instanceof B.ClassImplementation || type instanceof B.Interface)) {
          initialize(child);
        } else if (child instanceof StatementNode && (type instanceof S.Data || type instanceof S.DataBegin)) {
          const name = child.findFirstExpression(E.DefinitionName);
          const scope = this.scope.lookupPosition(child.getEnd(), p.file.getFilename());
          const id = name ? scope?.findVariable(name.concatTokens()) : undefined;
          if (id) {
            this.seedComponents(cell(idKey(id)), state, id.getType());
          }
        }
      }
    };
    initialize(p.node);
    const result = this.flow(p.node, state, p, true);
    const states = [...this.exits, ...result.stopped ? [] : [result]];
    const outputs = states.length > 0 ? join(states.map(s => ({...s, stopped: false}))) : state;
    const writes = new Map<string, Write>();
    for (const w of this.writes) {
      const key = tokenKey(w.file, w.token);
      writes.set(key, {...w, binding: union(writes.get(key)?.binding ?? empty(), w.binding)});
    }
    return {writes: [...writes.values()], values: outputs.values,
      updates: new Map([...outputs.values].filter(([key]) => outputs.written.has(key))),
      returning: p.returning ? outputs.values.get(idKey(p.returning)) ?? unknown() : unknown()};
  }

  private flow(node: StructureNode, state: State, p: Procedure, root = false): State {
    const type = node.get();
    if (!root && (type instanceof B.Method || type instanceof B.Form || type instanceof B.FunctionModule
        || type instanceof B.ClassDefinition || type instanceof B.ClassImplementation || type instanceof B.Interface)) {
      return state;
    }
    if (type instanceof B.Try) {
      const body = node.findDirectStructure(B.Body);
      const declarations = [S.Data, S.DataBegin, S.DataEnd, S.Static, S.StaticBegin, S.StaticEnd,
        S.Constant, S.ConstantBegin, S.ConstantEnd, S.FieldSymbol, S.Type, S.TypeBegin, S.TypeEnd,
        S.TypeEnum, S.TypeEnumBegin, S.TypeEnumEnd, S.TypeMesh, S.TypeMeshBegin, S.TypeMeshEnd, S.IncludeType];
      if (!body?.findAllStatementNodes().some(s => !(s.get() instanceof Comment) && !(s.get() instanceof Empty)
          && !declarations.some(declaration => s.get() instanceof declaration))) {
        return body ? this.flow(body, state, p) : state;
      }
      const snapshots: State[] = [clone(state)];
      const branches = node.getChildren().filter((c): c is StructureNode => c instanceof StructureNode && c !== body);
      this.exceptions.push(snapshots);
      const normal = this.flow(body, clone(state), p);
      this.exceptions.pop();
      const exceptional = join(snapshots.map(s => ({...s, stopped: false})));
      const outcomes = [normal];
      for (const branch of branches) {
        const result = this.flow(branch, clone(exceptional), p);
        if (!(branch.get() instanceof B.Cleanup)) {
          outcomes.push(result);
        }
      }
      return join(outcomes);
    }
    if (type instanceof B.If || type instanceof B.Case || type instanceof B.CaseType) {
      const header = node.getFirstStatement();
      if (header) {
        this.statement(header, state, p);
      }
      const branches = node.getChildren().filter((c): c is StructureNode => c instanceof StructureNode);
      const outcomes = branches.map(b => this.flow(b, clone(state), p));
      const exhaustive = branches.some(b => b.get() instanceof B.Else
        || (b.get() instanceof B.When && b.getFirstStatement()?.getTokens().some(t => t.getStr().toUpperCase() === "OTHERS")));
      if (!exhaustive) {
        outcomes.push(state);
      }
      return join(outcomes);
    }
    if (type instanceof B.Loop || type instanceof B.Do || type instanceof B.While || type instanceof B.Select
        || type instanceof B.LoopAtScreen || type instanceof B.LoopExtract || type instanceof B.Provide || type instanceof B.With) {
      let entry = clone(state);
      const loop = {breaks: [] as State[], continues: [] as State[]};
      this.loops.push(loop);
      for (;;) {
        let body = clone(entry);
        for (const child of node.getChildren()) {
          if (child instanceof StatementNode && child.get() instanceof S.Loop) {
            this.statement(child, body, p);
            this.bindRow(child, body, p, false);
          } else if (child instanceof StatementNode && !(child.get() instanceof S.EndLoop)
              && !(child.get() instanceof S.EndDo) && !(child.get() instanceof S.EndWhile)) {
            this.statement(child, body, p);
          } else if (child instanceof StructureNode) {
            body = this.flow(child, body, p);
          }
        }
        const next = join([state, body, ...loop.continues.map(s => ({...s, stopped: false}))]);
        if (fingerprint(next) === fingerprint(entry)) {
          this.loops.pop();
          return join([next, ...loop.breaks.map(s => ({...s, stopped: false}))]);
        }
        entry = next;
      }
    }
    for (const c of node.getChildren()) {
      if (state.stopped) {
        if (p.key !== p.file.getFilename()) {
          break;
        }
        const event = c instanceof StructureNode ? c.getFirstStatement() : c;
        if (!(event instanceof StatementNode) || !SELECTION_EVENTS.some(s => event.get() instanceof s)) {
          continue;
        }
        state.stopped = false;
      }
      if (c instanceof StructureNode) {
        state = this.flow(c, state, p);
      } else if (c instanceof StatementNode) {
        this.statement(c, state, p);
      }
      this.exceptions[this.exceptions.length - 1]?.push(clone(state));
    }
    return state;
  }

  private read(binding: Binding, state: State, type?: AbstractType): Binding {
    return union(...binding.targets.map(t => {
      const value = state.values.get(t.key);
      if (type instanceof ObjectReferenceType && (!value || (!value.unknown && value.targets.length === 0))) {
        return cell(this.bounded(t.key.startsWith("object:") ? t.key : "object:" + t.key));
      }
      if (!value && type instanceof DataReference) {
        const key = this.bounded("$" + t.key);
        const symbolic = {targets: [{key, origins: ["@" + key]}], unknown: key === "*"};
        state.values.set(t.key, symbolic);
        return symbolic;
      }
      return value ?? unknown();
    }), binding.unknown ? unknown() : empty());
  }

  private append(binding: Binding, suffix: string): Binding {
    return {targets: binding.targets.map(t => ({...t, key: this.bounded(t.key + suffix)})), unknown: binding.unknown};
  }

  private bounded(key: string): string {
    if (key.startsWith("*") || key.startsWith("object:*") || key.startsWith("$$$")) {
      return "*";
    }
    // Recursive calls can repeatedly append the same access path; collapse its tail to a summary location.
    const parts = key.split("/");
    return parts.length > 8 ? parts.slice(0, 8).join("/") + "/..." : key;
  }

  private location(node: INode | undefined, state: State, p: Procedure, writing = false): Binding {
    if (!(node instanceof ExpressionNode)) {
      return unknown();
    }
    if (node.get() instanceof E.MethodCallChain || node.get() instanceof E.Cast) {
      const cast = node.get() instanceof E.Cast ? node : node.findDirectExpression(E.Cast);
      if (cast?.findDirectExpression(E.Dereference)) {
        return this.value(cast.findDirectExpression(E.Source), state, p);
      }
      const type = this.valueType(node, p);
      if (isAggregate(type)) {
        return this.value(node, state, p, type);
      }
      const result = cell("result:" + allocationKey(p.file, node.getFirstToken()));
      this.store(result, this.value(node, state, p), state);
      return result;
    }
    const direct = node.getChildren().filter((c): c is ExpressionNode => c instanceof ExpressionNode);
    if (node.get() instanceof E.Source && this.hasProjection(node)) {
      const base = node.getFirstChild() as ExpressionNode;
      return this.follow(node.getChildren().slice(1), this.location(base, state, p), this.valueType(base, p), state, p, writing);
    }
    const chain = node.get() instanceof E.Target || node.get() instanceof E.SimpleTarget || node.get() instanceof E.FieldChain
      || node.get() instanceof E.SimpleFieldChain ? node : undefined;
    if (!chain && direct.length > 0 && !(node.get() instanceof E.SourceField)
        && !(node.get() instanceof E.TargetField) && !(node.get() instanceof E.SourceFieldSymbol)
        && !(node.get() instanceof E.TargetFieldSymbol)) {
      return this.location(direct[0], state, p, writing);
    }
    const children = chain ? chain.getChildren() : [node];
    const first = children[0];
    if (chain && first instanceof ExpressionNode && first.get() instanceof E.Cast) {
      return this.follow(children.slice(1), this.location(first, state, p), this.valueType(first, p), state, p, writing);
    }
    const id = this.identifier(children[0], p.file);
    const className = children[0].get() instanceof E.ClassName;
    if (!id && !className) {
      return unknown();
    }
    const isFS = id?.getName().startsWith("<");
    const byRef = id && p.parameters.includes(id) && !id.getMeta().includes(IdentifierMeta.PassByValue)
      && !id.getMeta().includes(IdentifierMeta.MethodReturning);
    const key = id ? idKey(id) : "class:" + children[0].concatTokens().toUpperCase();
    let result = isFS ? state.aliases.get(key) ?? empty() : cell(key, byRef ? ["@" + key] : []);
    if (id instanceof ClassAttribute && !id.getMeta().includes(IdentifierMeta.Static) && p.self) {
      result = cell(p.self + "/" + key);
    }
    return this.follow(children.slice(1), result, id?.getType(), state, p, writing);
  }

  private hasProjection(node: ExpressionNode): boolean {
    return node.get() instanceof E.Source && node.getFirstChild() instanceof ExpressionNode
      && node.getChildren().slice(1).some(c => c.get() instanceof E.Dereference
        || c.get() instanceof E.AttributeChain || c.get() instanceof E.ComponentChain);
  }

  private pathChildren(children: readonly INode[]): readonly INode[] {
    return children.flatMap(c => c.get() instanceof E.AttributeChain || c.get() instanceof E.ComponentChain
      ? this.pathChildren(c.getChildren()) : [c]);
  }

  private follow(nodes: readonly INode[], result: Binding, type: AbstractType | undefined,
                 state: State, p: Procedure, writing: boolean): Binding {
    const children = this.pathChildren(nodes);
    let table: Binding | undefined;
    for (const child of children) {
      const kind = child.get();
      const text = child instanceof ExpressionNode ? child.concatTokens() : child.getFirstToken().getStr();
      if (kind instanceof E.Dereference || text === "*") {
        result = this.read(result, state, type);
        type = type instanceof DataReference ? type.getType() : undefined;
      } else if (text === "->" || text === "=>") {
        if (text === "->") {
          result = this.read(result, state, type);
          type = type instanceof DataReference ? type.getType() : undefined;
        }
      } else if (kind instanceof E.AttributeName) {
        const ref = this.references(p.file, child.getFirstToken()).find(r => r.resolved instanceof TypedIdentifier);
        if (ref?.resolved instanceof TypedIdentifier) {
          const origins = ref.extra?.readOnly ? [ref.resolved.getName()] : [];
          const attr = idKey(ref.resolved);
          result = ref.resolved.getMeta().includes(IdentifierMeta.Static) ? cell(attr, origins)
            : result.targets.length > 0 ? {targets: result.targets.map(t =>
              ({key: this.bounded(t.key + "/" + attr), origins})), unknown: false} : cell(attr, origins);
          type = ref.resolved.getType();
        } else {
          result = this.append(result, "/" + text.toUpperCase());
          type = type instanceof StructureType ? type.getComponentByName(text) : undefined;
        }
      } else if (kind instanceof E.ComponentName || kind instanceof E.ComponentChain) {
        result = this.append(result, "/" + text.toUpperCase());
        type = type instanceof StructureType ? type.getComponentByName(text) : undefined;
      } else if (kind instanceof E.TableExpression || kind instanceof E.TableBody) {
        if (kind instanceof E.TableExpression) {
          if (writing && result.targets.some(t => t.origins.length > 0)) {
            table = table ? union(table, result) : result;
          }
          result = this.append(result, "/[]");
          type = type instanceof TableType ? type.getRowType() : undefined;
        }
      }
    }
    return table ?? result;
  }

  private value(node: ExpressionNode | undefined, state: State, p: Procedure, expected?: AbstractType): Binding {
    if (!node) {
      return unknown();
    }
    this.letValues(node, state, p);
    const children = node.getChildren();
    const first = children[0];
    if (this.hasProjection(node)) {
      const type = this.valueType(node, p);
      const location = this.location(node, state, p);
      return isAggregate(type) ? location : this.read(location, state, type);
    }
    if (first?.concatTokens().toUpperCase() === "REF") {
      return this.location(node.findDirectExpression(E.Source), state, p);
    }
    const cast = node.get() instanceof E.Cast ? node : node.findDirectExpression(E.Cast);
    if (cast) {
      const value = this.value(cast.findDirectExpression(E.Source), state, p, expected);
      return (node.findDirectExpression(E.Dereference) || cast.findDirectExpression(E.Dereference))
        && (expected instanceof DataReference || expected instanceof ObjectReferenceType) ? this.read(value, state, expected) : value;
    }
    const conditional = node.findDirectExpression(E.CondBody) ?? node.findDirectExpression(E.SwitchBody);
    if (conditional) {
      this.letValues(conditional, state, p);
      const parts = conditional.getChildren();
      const branches = parts.filter((c, i): c is ExpressionNode => c instanceof ExpressionNode
        && ["THEN", "ELSE"].includes(parts[i - 1]?.concatTokens().toUpperCase()));
      for (const part of parts.filter((c): c is ExpressionNode => c instanceof ExpressionNode && !branches.includes(c))) {
        for (const call of part.findAllExpressionsRecursive(E.MethodCallChain)) {
          this.call(call, state, p);
        }
      }
      const result = cell("value:" + allocationKey(p.file, node.getFirstToken()));
      const aggregate = isAggregate(expected);
      const values: Binding[] = [];
      const states = branches.filter(b => !(b.get() instanceof E.Throw)).map(branch => {
        const outcome = clone(state);
        const value = this.value(branch, outcome, p, expected);
        values.push(value);
        if (aggregate) {
          this.copyComponents(result, value, outcome, expected);
        }
        return outcome;
      });
      if (!conditional.findDirectTokenByText("ELSE")) {
        const outcome = clone(state);
        values.push(unknown());
        if (aggregate) {
          this.copyComponents(result, unknown(), outcome, expected);
        }
        states.push(outcome);
      }
      Object.assign(state, join(states));
      return aggregate ? result : union(...values);
    }
    const conversion = node.findDirectExpression(E.ConvBody);
    if (conversion) {
      this.letValues(conversion, state, p);
    }
    const converted = conversion?.findDirectExpression(E.Source);
    if (converted || first?.concatTokens().toUpperCase() === "EXACT") {
      return this.value(converted ?? node.findDirectExpression(E.Source), state, p, expected);
    }
    const corresponding = node.findDirectExpression(E.CorrespondingBody);
    if (corresponding && expected) {
      const result = cell("value:" + allocationKey(p.file, node.getFirstToken()));
      this.seedComponents(result, state, expected);
      const baseNode = corresponding.findDirectExpression(E.CorrespondingBodyBase)?.findDirectExpression(E.Source);
      const base = baseNode ? this.value(baseNode, state, p, expected) : empty();
      if (baseNode) {
        this.copyComponents(result, base, state, expected);
      }
      const sourceNode = corresponding.findDirectExpression(E.Source);
      const source = this.value(sourceNode, state, p, expected);
      const sourceType = sourceNode ? this.valueType(sourceNode, p) : undefined;
      const available = new Set(this.componentTypes(sourceType).map(c => c.path));
      const excluded = corresponding.findDirectExpressions(E.Field).map(f => "/" + f.concatTokens().toUpperCase());
      const allExcluded = corresponding.findDirectTokenByText("*") !== undefined;
      for (const component of this.componentTypes(expected)) {
        const path = component.path.replace(/^\/\[\]/, "");
        if (!allExcluded && !excluded.some(e => path === e || path.startsWith(e + "/")) && available.has(component.path)) {
          this.store(this.append(result, component.path), this.read(this.append(source, component.path), state, component.type), state);
        }
      }
      const mapping = corresponding.findDirectExpression(E.CorrespondingBodyMapping);
      const fields = mapping?.getChildren() ?? [];
      for (let i = 0; i < fields.length; i++) {
        if (!(fields[i].get() instanceof E.ComponentName)) {
          continue;
        }
        const targetPath = "/" + fields[i].concatTokens().toUpperCase();
        const sourcePath = "/" + fields[i + 2]?.concatTokens().toUpperCase().replace(/-/g, "/");
        const prefix = expected instanceof TableType ? "/[]" : "";
        for (const component of this.componentTypes(expected).filter(c => c.path === prefix + targetPath
          || c.path.startsWith(prefix + targetPath + "/"))) {
          const suffix = component.path.slice((prefix + targetPath).length);
          this.store(this.append(result, component.path),
                     this.read(this.append(source, prefix + sourcePath + suffix), state, component.type), state);
        }
      }
      return result;
    }
    const filtered = node.findDirectExpression(E.FilterBody)?.findDirectExpression(E.Source);
    if (filtered) {
      return this.value(filtered, state, p, expected);
    }
    const body = node.findDirectExpression(E.ValueBody);
    if (body) {
      this.letValues(body, state, p);
      const source = body.findDirectExpression(E.Source);
      if (source) {
        return this.value(source, state, p, expected);
      }
      if (!isAggregate(expected)) {
        return empty();
      }
      const result = cell("value:" + allocationKey(p.file, node.getFirstToken()));
      this.seedComponents(result, state, expected);
      const base = body.findDirectExpression(E.ValueBase)?.findDirectExpression(E.Source);
      if (base) {
        this.copyComponents(result, this.value(base, state, p, expected), state, expected);
      }
      if (expected instanceof StructureType) {
        this.assignComponents(body, result, state, p, expected);
      } else {
        const rowType = expected.getRowType();
        const rows = body.findDirectExpressions(E.ValueBodyLine).map(line => {
          const row = cell("row:" + allocationKey(p.file, line.getFirstToken()));
          this.seedComponents(row, state, rowType);
          const value = line.findDirectExpression(E.Source);
          if (value) {
            const contents = this.value(value, state, p, rowType);
            this.copyComponents(row, contents, state, rowType);
            if (!isAggregate(rowType)) {
              this.store(row, contents, state);
            }
          }
          const lines = line.findDirectExpression(E.ValueBodyLines)?.findDirectExpression(E.Source);
          if (lines) {
            const contents = this.append(this.value(lines, state, p, expected), "/[]");
            this.copyComponents(row, contents, state, rowType);
            if (!isAggregate(rowType)) {
              this.store(row, this.read(contents, state, rowType), state);
            }
          }
          this.assignComponents(body, row, state, p, rowType);
          this.assignComponents(line, row, state, p, rowType);
          return row;
        });
        if (base) {
          rows.push(this.append(result, "/[]"));
        }
        if (rows.length > 0) {
          const contents = union(...rows);
          const target = this.append(result, "/[]");
          this.copyComponents(target, contents, state, rowType);
          if (!isAggregate(rowType)) {
            this.store(target, this.read(contents, state, rowType), state);
          }
        }
      }
      return result;
    }
    const method = node.get() instanceof E.MethodCallChain ? node : node.findDirectExpression(E.MethodCallChain);
    if (method) {
      const cast = method.findDirectExpression(E.Cast);
      if (cast && method.findDirectExpression(E.MethodCall) === undefined) {
        return this.value(cast, state, p, expected);
      }
      return this.call(method, state, p);
    }
    const chain = node.get() instanceof E.FieldChain || node.get() instanceof E.Target || node.get() instanceof E.SimpleTarget
      ? node : node.findDirectExpression(E.FieldChain);
    if (chain) {
      const location = this.location(chain, state, p);
      const type = this.valueType(chain, p);
      return isAggregate(type) ? location : this.read(location, state, type);
    }
    if (node.get() instanceof E.Source && children.filter(c => c instanceof ExpressionNode).length === 1) {
      return this.value(children.find((c): c is ExpressionNode => c instanceof ExpressionNode), state, p, expected);
    }
    return unknown();
  }

  private valueType(node: ExpressionNode, p: Procedure): AbstractType | undefined {
    if (node.get() instanceof E.NewObject) {
      const name = node.findDirectExpression(E.TypeNameOrInfer);
      const ref = name && this.references(p.file, name.getFirstToken()).find(r => r.referenceType === ReferenceType.InferredType);
      return ref?.resolved instanceof TypedIdentifier ? ref.resolved.getType() : undefined;
    }
    if (node.get() instanceof E.MethodCallChain || node.get() instanceof E.Cast) {
      const cast = node.get() instanceof E.Cast ? node : node.findDirectExpression(E.Cast);
      if (cast) {
        const name = cast.findDirectExpression(E.TypeNameOrInfer);
        const ref = name?.getTokens().flatMap(t => this.references(p.file, t)).find(r => r.referenceType === ReferenceType.TypeReference);
        if (ref?.resolved instanceof TypedIdentifier) {
          return cast.findDirectExpression(E.Dereference) ? ref.resolved.getType() : new DataReference(ref.resolved.getType());
        }
      }
      const method = node.findDirectExpressions(E.MethodCall).slice(-1)[0];
      const ref = method ? this.references(p.file, method.getFirstToken())
        .find(r => r.referenceType === ReferenceType.MethodReference) : undefined;
      const allocation = node.findDirectExpression(E.NewObject);
      return method ? (ref?.resolved as IMethodDefinition | undefined)?.getParameters().getReturning()?.getType()
        : allocation ? this.valueType(allocation, p) : undefined;
    }
    const projected = this.hasProjection(node);
    const chain = projected || node.get() instanceof E.Target || node.get() instanceof E.SimpleTarget
      || node.get() instanceof E.FieldChain ? node : node.findDirectExpression(E.FieldChain);
    if (!chain) {
      return this.identifier(node, p.file)?.getType();
    }
    const first = chain.getChildren()[0];
    let type: AbstractType | undefined = projected || (first instanceof ExpressionNode && first.get() instanceof E.Cast)
      ? this.valueType(first as ExpressionNode, p) : this.identifier(first, p.file)?.getType();
    const children = chain.getChildren().slice(1);
    for (const child of projected ? this.pathChildren(children) : children) {
      const text = child instanceof ExpressionNode ? child.concatTokens() : child.getFirstToken().getStr();
      if (child.get() instanceof E.AttributeName || (projected && child.get() instanceof E.ComponentName)) {
        const ref = this.references(p.file, child.getFirstToken()).find(r => r.resolved instanceof TypedIdentifier);
        type = ref?.resolved instanceof TypedIdentifier ? ref.resolved.getType()
          : type instanceof StructureType ? type.getComponentByName(text) : undefined;
      } else if (child.get() instanceof E.ComponentName) {
        type = type instanceof StructureType ? type.getComponentByName(text) : undefined;
      } else if (child.get() instanceof E.TableExpression) {
        type = type instanceof TableType ? type.getRowType() : undefined;
      } else if (child.get() instanceof E.Dereference || text === "->" || (projected && text === "*")) {
        type = type instanceof DataReference ? type.getType() : type;
      }
    }
    return type;
  }

  private letValues(node: ExpressionNode, state: State, p: Procedure): void {
    for (const definition of node.findDirectExpression(E.Let)?.findDirectExpressions(E.InlineFieldDefinition) ?? []) {
      const id = this.identifier(definition, p.file);
      const source = definition.findDirectExpression(E.Source);
      if (!id || !source) {
        continue;
      }
      if (id.getName().startsWith("<")) {
        state.aliases.set(idKey(id), this.location(source, state, p));
      } else {
        const target = cell(idKey(id));
        const value = this.value(source, state, p, id.getType());
        this.copyComponents(target, value, state, id.getType());
        this.store(target, value, state);
      }
    }
  }

  private componentTypes(type: AbstractType | undefined, path = ""): {path: string, type: AbstractType}[] {
    if (type instanceof DataReference || type instanceof ObjectReferenceType) {
      return [{path, type}];
    } else if (type instanceof StructureType) {
      return type.getComponents().flatMap(c => this.componentTypes(c.type, path + "/" + c.name.toUpperCase()));
    } else if (type instanceof TableType) {
      return this.componentTypes(type.getRowType(), path + "/[]");
    }
    return [];
  }

  private seedComponents(target: Binding, state: State, type: AbstractType, symbolic = false): void {
    for (const component of this.componentTypes(type)) {
      const location = this.append(target, component.path);
      for (const t of location.targets) {
        state.values.set(t.key, symbolic ? cell("$" + t.key, ["@$" + t.key]) : empty());
        if (!symbolic) {
          state.written.add(t.key);
        }
      }
    }
  }

  private copyComponents(target: Binding, source: Binding, state: State, type: AbstractType | undefined,
                         values: ReadonlyMap<string, Binding> = state.values, substitute = (b: Binding) => b): void {
    const components = this.componentTypes(type).filter(c => c.path !== "");
    const copies = components.map(c => ({target: this.append(target, c.path), value: substitute(union(
      ...source.targets.map(t => {
        const key = this.bounded(t.key + c.path);
        return values === state.values ? this.read(cell(key), state, c.type) : values.get(key) ?? unknown();
      }),
      source.unknown ? unknown() : empty()))}));
    const whole = target.targets.length === 1 && !target.unknown && !target.targets[0].key.includes("/[]")
      && target.targets[0].key !== "*" && !target.targets[0].key.endsWith("/...");
    for (const copy of copies) {
      this.store(copy.target, copy.value, state, whole);
    }
  }

  private assignComponents(node: ExpressionNode, target: Binding, state: State, p: Procedure, type: AbstractType): void {
    const assignments = node.findDirectExpressions(E.FieldAssignment)
      .concat(node.findDirectExpression(E.ParameterListS)?.findDirectExpressions(E.ParameterS) ?? []);
    for (const assignment of assignments) {
      const field = (assignment.findDirectExpression(E.FieldSub) ?? assignment.findDirectExpression(E.ParameterName))
        ?.concatTokens().toUpperCase().replace(/-/g, "/");
      if (!field) {
        continue;
      }
      let componentType: AbstractType | undefined = type;
      for (const part of field.split("/")) {
        componentType = componentType instanceof StructureType ? componentType.getComponentByName(part) : undefined;
      }
      const location = this.append(target, "/" + field);
      const value = this.value(assignment.findDirectExpression(E.Source), state, p, componentType);
      this.copyComponents(location, value, state, componentType);
      this.store(location, isAggregate(componentType) ? location : value, state);
    }
  }

  private store(target: Binding, value: Binding, state: State, overwrite = false): void {
    for (const t of target.targets) {
      state.written.add(t.key);
      state.values.set(t.key, overwrite || target.targets.length === 1 && !target.unknown && t.key !== "*"
        && !t.key.endsWith("/...") && !t.key.includes("/[]") ? value
        : union(state.values.get(t.key) ?? unknown(), value));
    }
  }

  private write(node: ExpressionNode, state: State, p: Procedure): void {
    const binding = this.location(node, state, p, true);
    if (binding.targets.some(t => t.origins.length > 0)) {
      this.writes.push({binding, token: node.getFirstToken(), file: p.file});
    }
  }

  private effects(node: INode, state: State, p: Procedure): void {
    const type = node.get();
    if (node instanceof ExpressionNode) {
      this.letValues(node, state, p);
    }
    if (type instanceof E.CondBody || type instanceof E.SwitchBody) {
      const parts = node.getChildren();
      const outcomes: State[] = [];
      for (let i = 0; i < parts.length; i++) {
        const child = parts[i];
        if (!(child instanceof ExpressionNode)) {
          continue;
        }
        const previous = parts[i - 1]?.getFirstToken().getStr().toUpperCase();
        if (previous === "THEN" || previous === "ELSE") {
          const branch = clone(state);
          this.effects(child, branch, p);
          outcomes.push(branch);
        } else {
          this.effects(child, state, p);
        }
      }
      if (!parts.some(c => c.getFirstToken().getStr().toUpperCase() === "ELSE")) {
        outcomes.push(clone(state));
      }
      Object.assign(state, join(outcomes));
      return;
    }
    let first = true;
    for (const child of node.getChildren()) {
      if (!(child instanceof ExpressionNode)) {
        continue;
      }
      if (type instanceof E.Cond && !first) {
        const branch = clone(state);
        this.effects(child, branch, p);
        Object.assign(state, join([state, branch]));
      } else {
        this.effects(child, state, p);
      }
      first = false;
    }
    if (node instanceof ExpressionNode && type instanceof E.MethodCallChain) {
      this.call(node, state, p);
    }
    if (type instanceof E.Throw) {
      state.stopped = true;
    }
  }

  private statement(node: StatementNode, state: State, p: Procedure): void {
    this.calls.clear();
    this.effects(node, state, p);
    if (state.stopped) {
      return;
    }
    const type = node.get();
    if (type instanceof S.Exit || type instanceof S.Continue) {
      const loop = this.loops[this.loops.length - 1];
      if (loop) {
        (type instanceof S.Exit ? loop.breaks : loop.continues).push(clone(state));
      } else {
        this.exits.push(clone(state));
      }
      state.stopped = true;
      return;
    }
    if (type instanceof S.Return || type instanceof S.Raise) {
      this.exits.push(clone(state));
      state.stopped = true;
      return;
    }
    if (type instanceof S.Check) {
      const loop = this.loops[this.loops.length - 1];
      (loop?.continues ?? this.exits).push(clone(state));
    }
    if (type instanceof S.Assign) {
      const target = node.findDirectExpression(E.FSTarget);
      const id = target ? this.identifier(target, p.file) : undefined;
      if (id) {
        const source = node.findDirectExpression(E.AssignSource);
        const dynamic = source?.findFirstExpression(E.Dynamic) !== undefined;
        const table = source?.findFirstExpression(E.TableExpression) !== undefined;
        const component = source?.getFirstToken().getStr().toUpperCase() === "COMPONENT";
        const part = node.findDirectExpression(E.Target)
          ?? source?.findDirectExpressionsMulti([E.Source, E.SimpleSource3]).slice(-1)[0];
        let binding = dynamic ? unknown() : this.location(part, state, p);
        if (component) {
          binding = this.append(binding, "/*");
        }
        if (dynamic || table || component || node.findDirectExpression(E.Target)) {
          const unassign = node.getTokens().some(t => t.getStr().toUpperCase() === "UNASSIGN");
          binding = union(binding, unassign ? empty() : state.aliases.get(idKey(id)) ?? empty());
        }
        state.aliases.set(idKey(id), binding);
      }
      return;
    }
    if (type instanceof S.CallFunction) {
      const name = node.findDirectExpression(E.FunctionName)?.concatTokens().replace(/^'|'$/g, "").toUpperCase();
      const callee = this.procedures.find(c => c.node.get() instanceof B.FunctionModule
        && c.node.getFirstStatement()?.findDirectExpression(E.Field)?.concatTokens().toUpperCase() === name);
      const substitutions = new Map<string, Binding>();
      const operands = node.findAllExpressionsRecursive(E.FunctionExportingParameter)
        .concat(node.findAllExpressionsRecursive(E.ParameterT));
      for (const operand of operands) {
        const paramName = operand.findDirectExpression(E.ParameterName)?.concatTokens().toUpperCase();
        const param = callee?.parameters.find(t => t.getName().toUpperCase() === paramName);
        const arg = operand.findDirectExpressionsMulti([E.Source, E.SimpleSource3, E.Target])[0];
        if (arg) {
          this.argument(param, arg, substitutions, state, p);
        }
      }
      this.applyCall(node, state, p, callee, substitutions);
    }
    if (type instanceof S.Unassign) {
      const id = this.identifier(node, p.file);
      if (id) {
        state.aliases.set(idKey(id), empty());
      }
      return;
    }
    if (type instanceof S.ReadTable) {
      this.bindRow(node, state, p, true);
    }
    if (type instanceof S.Call && node.findDirectExpression(E.MethodSource)) {
      const source = node.findDirectExpression(E.MethodSource)!;
      const ref = source.getTokens().flatMap(t => this.references(p.file, t))
        .find(r => r.referenceType === ReferenceType.MethodReference);
      const def = ref?.resolved as IMethodDefinition | undefined;
      const children = source.getChildren();
      const prefix = children.length > 2 ? new ExpressionNode(new E.FieldChain()).setChildren(children.slice(0, -2)) : undefined;
      this.invoke(node, node, def, state, p, prefix ? this.value(prefix, state, p) : undefined);
    }
    if (type instanceof S.Append || type instanceof S.InsertInternal) {
      this.bindInsertedRow(node, state, p);
    }
    if (type instanceof S.Perform) {
      const name = node.findDirectExpression(E.FormName);
      const scope = this.scope.lookupPosition(node.getStart(), p.file.getFilename());
      const def = name ? scope?.findFormDefinition(name.concatTokens()) : undefined;
      const callee = def ? this.procedures.find(c => c.key === idKey(def)) : undefined;
      const args = [...node.findDirectExpression(E.PerformTables)?.findDirectExpressions(E.Source) ?? [],
        ...node.findDirectExpression(E.PerformUsing)?.findDirectExpressions(E.SimpleSource3) ?? [],
        ...node.findDirectExpression(E.PerformChanging)?.findDirectExpressions(E.Target) ?? []];
      const parameters = def ? [...def.getTablesParameters(), ...def.getUsingParameters(), ...def.getChangingParameters()] : [];
      const substitutions = new Map<string, Binding>();
      args.forEach((arg, i) => {
        if (parameters[i]) {
          this.argument(parameters[i], arg, substitutions, state, p);
        }
      });
      this.applyCall(node, state, p, callee, substitutions);
      return;
    }
    if (type instanceof S.GetReference) {
      const target = node.findDirectExpression(E.Target);
      if (target) {
        this.write(target, state, p);
        this.store(this.location(target, state, p), this.location(node.findDirectExpression(E.Source), state, p), state);
      }
      return;
    }
    if (type instanceof S.Move || type instanceof S.Compute) {
      const source = node.findDirectExpression(E.Source);
      const targets = node.findDirectExpressions(E.Target);
      const value = this.value(source, state, p, targets[0] ? this.valueType(targets[0], p) : undefined);
      for (const target of targets) {
        this.write(target, state, p);
        const location = this.location(target, state, p);
        const targetType = this.valueType(target, p);
        this.copyComponents(location, value, state, targetType);
        this.store(location, isAggregate(targetType) ? location : value, state);
      }
      return;
    }
    if (type instanceof S.MoveCorresponding) {
      const source = node.findDirectExpressionsMulti([E.Source, E.SimpleSource3])[0];
      const sourceType = source ? this.valueType(source, p) : undefined;
      const value = this.value(source, state, p, sourceType);
      const available = new Set(this.componentTypes(sourceType).map(c => c.path));
      for (const target of node.findDirectExpressionsMulti([E.Target, E.SimpleTarget])) {
        this.write(target, state, p);
        const location = this.location(target, state, p);
        for (const component of this.componentTypes(this.valueType(target, p))) {
          if (available.has(component.path)) {
            this.store(this.append(location, component.path),
                       this.read(this.append(value, component.path), state, component.type), state);
          }
        }
      }
      return;
    }
    if (type instanceof S.CreateObject) {
      const target = node.findDirectExpression(E.Target);
      if (target) {
        this.write(target, state, p);
        const result = cell("new:" + allocationKey(p.file, target.getFirstToken()));
        this.store(this.location(target, state, p), result, state);
        if (!node.findDirectExpression(E.Dynamic)) {
          const ref = this.references(p.file, target.getFirstToken()).find(r => r.referenceType === ReferenceType.ConstructorReference);
          const targetType = this.valueType(target, p);
          const name = ref?.resolved?.getName() ?? (targetType instanceof ObjectReferenceType ? targetType.getIdentifierName() : undefined);
          if (name) {
            this.construct(node, result, name, state, p);
          }
        }
      }
      return;
    }
    const targets = node.findAllExpressionsRecursive(E.Target).concat(node.findAllExpressionsRecursive(E.SimpleTarget),
                                                                      node.findAllExpressionsRecursive(E.FieldChain));
    const reportedCall = (type instanceof S.Call || type instanceof S.CallFunction)
      && this.writes.some(w => w.file === p.file && w.token === node.getFirstToken());
    for (const target of targets) {
      // A callee effect already reports this call, so do not repeat it at the actual parameter.
      if (reportedCall) {
        continue;
      }
      if (type instanceof S.Loop && node.findDirectExpression(E.LoopSource)?.getTokens().includes(target.getFirstToken())) {
        continue;
      }
      if ((type instanceof S.ReadTable && node.findDirectExpression(E.ReadTableTarget)?.findFirstExpression(E.FSTarget))
          || target.findDirectExpression(E.InlineData)) {
        continue;
      }
      if (!this.references(p.file, target.getFirstToken()).some(r =>
        r.referenceType === ReferenceType.DataWriteReference || r.extra?.writeOperand)) {
        continue;
      }
      this.write(target, state, p);
      if (type instanceof S.Clear || type instanceof S.Free || type instanceof S.CreateData) {
        const value = type instanceof S.Clear || type instanceof S.Free ? empty() : cell("new:" + allocationKey(p.file, target.getFirstToken()));
        this.store(this.location(target, state, p), value, state);
        if (type instanceof S.Clear || type instanceof S.Free) {
          const targetType = this.valueType(target, p);
          if (targetType) {
            this.seedComponents(this.location(target, state, p), state, targetType);
          }
        }
      }
    }
  }

  private bindRow(node: StatementNode, state: State, p: Procedure, conditional: boolean): void {
    const source = node.findDirectExpression(E.LoopSource)
      ?? node.findDirectExpressionsMulti([E.Source, E.SimpleSource2])[0];
    const binding = this.append(this.location(source, state, p), "/[]");
    const target = node.findDirectExpression(E.LoopTarget) ?? node.findDirectExpression(E.ReadTableTarget);
    const fs = target?.findFirstExpression(E.FSTarget);
    if (fs) {
      const id = this.identifier(fs, p.file);
      if (id) {
        state.aliases.set(idKey(id), conditional ? union(binding, state.aliases.get(idKey(id)) ?? empty()) : binding);
      }
    } else if (target?.getTokens().some(t => t.getStr().toUpperCase() === "REFERENCE")) {
      const t = target.findFirstExpression(E.Target);
      if (t) {
        const loc = this.location(t, state, p);
        const previous = t.findDirectExpression(E.InlineData) ? empty() : this.read(loc, state);
        this.store(loc, conditional ? union(binding, previous) : binding, state);
      }
    } else {
      const t = target?.findFirstExpression(E.Target);
      if (t) {
        this.write(t, state, p);
        const type = this.valueType(t, p);
        const location = this.location(t, state, p);
        if (type) {
          this.copyComponents(location, binding, state, type);
        }
        const value = this.read(binding, state, type);
        const previous = t.findDirectExpression(E.InlineData) ? empty() : this.read(location, state, type);
        this.store(location, conditional ? union(value, previous) : value, state);
      }
    }
  }

  private bindInsertedRow(node: StatementNode, state: State, p: Procedure): void {
    const refOutput = node.findDirectTokenByText("REFERENCE")
      ? node.findDirectExpressions(E.Target).slice(-1)[0] : undefined;
    const table = node.findDirectExpressions(E.Target).find(t => t !== refOutput)
      ?? node.findDirectExpressionsMulti([E.Source, E.SimpleSource4])[0];
    const binding = this.append(this.location(table, state, p), "/[]");
    const source = node.findDirectTokenByText("INITIAL") ? undefined
      : node.findDirectExpressionsMulti([E.Source, E.SimpleSource4]).find(s => s !== table
        && s !== node.findExpressionAfterToken("INDEX") && s !== node.findExpressionAfterToken("FROM")
        && s !== node.findExpressionAfterToken("TO"));
    const tableType = table ? this.valueType(table, p) : undefined;
    const rowType = tableType instanceof TableType ? tableType.getRowType() : undefined;
    const always = node.get() instanceof S.Append || (tableType instanceof TableType
      && tableType.getAccessType() === TableAccessType.standard
      && (node.findExpressionAfterToken("INDEX")?.concatTokens() === "1" || node.findDirectTokenByText("TABLE") !== undefined));
    if (source && rowType) {
      let value = this.value(source, state, p, node.findDirectTokenByText("LINES") ? tableType : rowType);
      if (node.findDirectTokenByText("LINES")) {
        const rows = this.append(value, "/[]");
        value = isAggregate(rowType) ? rows : this.read(rows, state, rowType);
      }
      this.copyComponents(binding, value, state, rowType);
      this.store(binding, value, state);
    }
    const fs = node.findDirectExpression(E.FSTarget);
    const id = fs ? this.identifier(fs, p.file) : undefined;
    if (id) {
      const old = state.aliases.get(idKey(id)) ?? empty();
      state.aliases.set(idKey(id), always ? binding : union(binding, old));
    } else if (refOutput) {
      this.write(refOutput, state, p);
      const target = this.location(refOutput, state, p);
      this.store(target, always ? binding : union(binding, this.read(target, state)), state);
    }
  }

  private call(node: ExpressionNode, state: State, p: Procedure): Binding {
    const key = tokenKey(p.file, node.getFirstToken());
    const cached = this.calls.get(key);
    if (cached) {
      return cached;
    }
    let result = unknown();
    const first = node.getFirstChild();
    let receiver = first instanceof ExpressionNode && first.get() instanceof E.FieldChain ? this.value(first, state, p) : undefined;
    const allocation = node.findDirectExpression(E.NewObject);
    const type = allocation && this.valueType(allocation, p);
    if (allocation && (type instanceof ObjectReferenceType || type instanceof DataReference)) {
      result = cell("new:" + allocationKey(p.file, allocation.getFirstToken()));
      if (type instanceof ObjectReferenceType) {
        this.construct(allocation, result, type.getIdentifierName(), state, p);
      } else {
        const dataType = type.getType();
        this.seedComponents(result, state, dataType);
        const rows = dataType instanceof TableType && allocation.getChildren().slice(3).some(c => c.getFirstToken().getStr() === "(");
        const target = rows ? this.append(result, "/[]") : result;
        const targetType = rows && dataType instanceof TableType ? dataType.getRowType() : dataType;
        for (const source of allocation.findDirectExpressions(E.Source)) {
          const value = this.value(source, state, p, targetType);
          this.copyComponents(target, value, state, targetType);
          this.store(target, isAggregate(targetType) ? target : value, state);
        }
        this.assignComponents(allocation, target, state, p, targetType);
      }
      receiver = result;
    }
    for (const method of node.findDirectExpressions(E.MethodCall)) {
      const token = method.findDirectExpression(E.MethodName)?.getFirstToken() ?? method.getFirstToken();
      const ref = this.references(p.file, token).find(r => r.referenceType === ReferenceType.MethodReference);
      result = this.invoke(method, node, ref?.resolved as IMethodDefinition | undefined, state, p, receiver);
      receiver = result;
    }
    this.calls.set(key, result);
    return result;
  }

  private construct(node: ExpressionNode | StatementNode, receiver: Binding, name: string, state: State, p: Procedure): void {
    const scope = this.scope.lookupPosition(node.getFirstToken().getStart(), p.file.getFilename());
    let owner = scope?.findClassDefinition(name);
    let constructor = owner?.getMethodDefinitions().getByName("CONSTRUCTOR");
    const visited = new Set<string>();
    while (!constructor && owner?.getSuperClass() && !visited.has(owner.getName())) {
      visited.add(owner.getName());
      owner = scope?.findClassDefinition(owner.getSuperClass()!);
      constructor = owner?.getMethodDefinitions().getByName("CONSTRUCTOR");
    }
    if (constructor) {
      this.invoke(node, node, constructor, state, p, receiver);
    }
  }

  private callOperands(node: ExpressionNode | StatementNode): ExpressionNode[] {
    return node.findAllExpressionsMulti([E.ParameterS, E.ParameterT, E.MethodCallChain])
      .filter(child => !(child.get() instanceof E.MethodCallChain));
  }

  private invoke(invocation: ExpressionNode | StatementNode, site: ExpressionNode | StatementNode,
                 def: IMethodDefinition | undefined, state: State, p: Procedure, receiver?: Binding): Binding {
    const callee = def ? this.procedures.find(c => c.key === idKey(def)) : undefined;
    const substitutions = new Map<string, Binding>();
    if (callee?.self) {
      substitutions.set(callee.self, receiver ?? (p.self ? cell(p.self) : unknown()));
      // Self attributes have no declaration-time pointee; read their current caller-side reference value.
      for (const [key] of callee ? this.summaries.get(callee.key)?.values ?? [] : []) {
        if (key.startsWith(callee.self + "/")) {
          const target = this.append(substitutions.get(callee.self)!, key.slice(callee.self.length));
          substitutions.set("$" + key, this.read(target, state));
        }
      }
    }
    const params = def?.getParameters();
    const operands = this.callOperands(invocation);
    for (const operand of operands) {
      const name = operand.findDirectExpression(E.ParameterName)?.concatTokens().toUpperCase();
      const param = params?.getAll().find(t => t.getName().toUpperCase() === name);
      const arg = operand.findDirectExpression(E.Source) ?? operand.findDirectExpression(E.Target);
      if (arg) {
        this.argument(param, arg, substitutions, state, p);
      }
    }
    const unnamed = invocation.get() instanceof E.NewObject ? invocation.findDirectExpression(E.Source)
      : invocation.findFirstExpression(E.MethodCallParam)?.findDirectExpression(E.Source);
    const defaultName = params?.getDefaultImporting();
    const param = params?.getAll().find(t => t.getName().toUpperCase() === defaultName);
    if (unnamed && param) {
      this.argument(param, unnamed, substitutions, state, p);
    }
    const owner = callee?.self ? this.scope.lookupPosition(callee.node.getFirstToken().getStart(), callee.file.getFilename())
      ?.findClassDefinition(callee.self.slice(6)) : undefined;
    const uncertain = def?.isStatic() === false && def.getName().toUpperCase() !== "CONSTRUCTOR"
      && def.getVisibility() !== Visibility.Private && !owner?.isFinal();
    const previous = uncertain ? clone(state) : undefined;
    const firstWrite = this.writes.length;
    let result = this.applyCall(site, state, p, callee, substitutions);
    if (previous) {
      for (const write of this.writes.slice(firstWrite)) {
        write.binding = union(write.binding, unknown());
      }
      Object.assign(state, join([previous, state]));
      result = union(result, unknown());
    }
    const receiving = operands.find(o => o.findDirectExpression(E.ParameterName)?.concatTokens().toUpperCase()
      === params?.getReturning()?.getName().toUpperCase())?.findDirectExpression(E.Target);
    if (receiving) {
      const target = this.location(receiving, state, p);
      const returningType = params?.getReturning()?.getType();
      if (returningType) {
        this.copyComponents(target, result, state, returningType);
      }
      this.store(target, result, state);
    }
    return result;
  }

  private argument(param: TypedIdentifier | undefined, arg: ExpressionNode, substitutions: Map<string, Binding>,
                   state: State, p: Procedure): void {
    const key = param ? idKey(param) : tokenKey(p.file, arg.getFirstToken());
    const target = this.location(arg, state, p);
    const byValue = param?.getMeta().includes(IdentifierMeta.PassByValue);
    const copied = cell("copy:" + allocationKey(p.file, arg.getFirstToken()) + ":" + key);
    substitutions.set(key, byValue ? copied : target);
    const value = param && initialOutput(param) ? empty() : this.value(arg, state, p, param?.getType());
    const aggregate = isAggregate(param?.getType());
    if (byValue && aggregate) {
      this.copyComponents(copied, value, state, param?.getType());
    } else if (byValue) {
      this.store(copied, value, state);
    }
    substitutions.set("$" + key, byValue && aggregate ? copied : value);
    for (const component of this.componentTypes(param?.getType()).filter(c => c.path !== "")) {
      substitutions.set(key + component.path, this.append(byValue ? copied : target, component.path));
      substitutions.set("$" + key + component.path, this.read(this.append(value, component.path), state, component.type));
    }
    if (byValue) {
      substitutions.set("!" + key, target);
    }
  }

  private applyCall(node: ExpressionNode | StatementNode, state: State, p: Procedure,
                    callee: Procedure | undefined, substitutions: Map<string, Binding>): Binding {
    if (callee) {
      const callers = this.callers.get(callee.key) ?? new Set<Procedure>();
      callers.add(p);
      this.callers.set(callee.key, callers);
    }
    const summary = callee ? this.summaries.get(callee.key) : undefined;
    const substitute = (binding: Binding): Binding => {
      let result: Binding = {targets: [], unknown: binding.unknown};
      for (const t of binding.targets) {
        const replacement = [...substitutions].filter(([k]) => t.key === k || t.key.startsWith(k + "/"))
          .sort(([a], [b]) => b.length - a.length)[0];
        const origins = t.origins.filter(o => !o.startsWith("@"));
        const permissions = t.origins.filter(o => o.startsWith("@")).map(o => substitutions.get(o.slice(1)) ?? unknown());
        const permission = permissions.length > 0 ? union(...permissions) : cell(t.key, origins);
        const bases = replacement?.[1] ?? cell(t.key);
        const suffix = replacement ? t.key.slice(replacement[0].length) : "";
        const targets = bases.targets.flatMap(base => permission.targets.map(capability => ({
          key: this.bounded(base.key + suffix), origins: [...new Set([...origins, ...capability.origins])],
        })));
        result = union(result, {targets, unknown: bases.unknown || permission.unknown});
      }
      return result;
    };
    if (summary) {
      const escapes = new Set<string>();
      const published = [summary.returning, ...summary.updates.values()];
      const allocations = new Set(callee!.locals);
      for (const key of [...summary.values.keys(), ...published.flatMap(b => b.targets.map(t => t.key))]) {
        const root = key.split("/")[0];
        if (/^(escape|copy|new|value|row|return|result):/.test(root)) {
          allocations.add(root);
        }
      }
      for (const local of allocations) {
        if (published.some(b => b.targets.some(t => t.key === local || t.key.startsWith(local + "/")))) {
          escapes.add(local);
          substitutions.set(local, cell(this.bounded("escape:" + allocationKey(p.file, node.getFirstToken()) + "/" + local)));
        }
      }
      for (const [key] of summary.values) {
        const local = callee!.locals?.some(localKey => key === localKey || key.startsWith(localKey + "/"));
        if (!local && !substitutions.has("$" + key)) {
          substitutions.set("$" + key, this.read(substitute(cell(key)), state));
        }
      }
      // shortcut: overlapping argument cells join entry and output values; ordered effects would improve precision.
      const reads = [...substitutions.keys()].filter(key => key.startsWith("$") && summary.values.has(key.slice(1)));
      let changed: boolean;
      do {
        changed = false;
        for (const [key, value] of summary.updates) {
          const target = substitute(cell(key));
          for (const read of reads) {
            if (read.slice(1) === key || !substitute(cell(read.slice(1))).targets.some(t =>
              target.targets.some(w => t.key === w.key))) {
              continue;
            }
            const merged = union(substitutions.get(read)!, substitute(value));
            if (JSON.stringify(merged) !== JSON.stringify(substitutions.get(read))) {
              substitutions.set(read, merged);
              changed = true;
            }
          }
        }
      } while (changed);
      for (const w of summary.writes) {
        this.writes.push({binding: substitute(w.binding), token: node.getFirstToken(), file: p.file});
      }
      const updated = new Set<string>();
      for (const [key, value] of summary.updates) {
        const parameter = callee!.parameters.find(param => key === idKey(param) || key.startsWith(idKey(param) + "/"));
        const local = callee!.locals?.some(localKey => !escapes.has(localKey) && (key === localKey || key.startsWith(localKey + "/")));
        if ((parameter && !substitutions.has(idKey(parameter))) || local) {
          continue;
        }
        const target = substitute(cell(key));
        const output = substitute(value);
        this.store(target, output.unknown || target.targets.some(t => updated.has(t.key))
          ? union(output, this.read(target, state)) : output, state);
        target.targets.forEach(t => updated.add(t.key));
      }
      for (const parameter of callee!.parameters) {
        const target = substitutions.get("!" + idKey(parameter));
        if (target && callee!.valueOutputs?.has(idKey(parameter))) {
          const output = summary.values.get(idKey(parameter));
          if (output) {
            this.store(target, substitute(output), state);
          }
          this.copyComponents(target, cell(idKey(parameter)), state, parameter.getType(), summary.values, substitute);
        }
      }
    } else if (!callee) {
      // Opaque code may retain, mutate or replace a tracked reference; it cannot establish writability.
      for (const [key, b] of substitutions) {
        if (key.startsWith("!")) {
          continue;
        }
        if (b.targets.some(t => t.origins.length > 0)) {
          this.writes.push({binding: union(b, unknown()), token: node.getFirstToken(), file: p.file});
        }
      }
      for (const operand of node.findAllExpressionsRecursive(E.ParameterT)) {
        const target = operand.findDirectExpression(E.Target);
        if (target) {
          const location = this.location(target, state, p);
          this.store(location, union(this.read(location, state), unknown()), state);
        }
      }
    }
    if (summary && callee?.returning && isAggregate(callee.returning.getType())) {
      const target = cell("return:" + allocationKey(p.file, node.getFirstToken()));
      this.copyComponents(target, cell(idKey(callee.returning)), state, callee.returning.getType(), summary.values, substitute);
      return target;
    }
    return summary ? substitute(summary.returning) : unknown();
  }
}
