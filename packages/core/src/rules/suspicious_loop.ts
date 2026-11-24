import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {ExpressionNode, StatementNode, StructureNode} from "../abap/nodes";
import {AbstractToken} from "../abap/1_lexer/tokens/abstract_token";
import {Identifier} from "../abap/4_file_information/_identifier";
import {ReferenceType} from "../abap/5_syntax/_reference";
import {IdentifierMeta, TypedIdentifier} from "../abap/types/_typed_identifier";
import {IStatement} from "../abap/2_statements/statements/_statement";
import {IStructure} from "../abap/3_structures/structures/_structure";
import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Severity} from "../severity";
import {IRule, IRuleMetadata} from "./_irule";
import {ObjectAnalysis, Procedure, Variable, isImmutable, plainMove, singleTarget} from "./_procedure_analysis";

export class SuspiciousLoopConf extends BasicRuleConfig {
  public severity?: Severity = Severity.Warning;
  /** Report WHILE loops whose condition the loop body never changes, or sets to the same value in every iteration.
   * The loop runs zero times, once or forever */
  public unchangedCondition: boolean = true;
}

const NESTED_LOOPS: (new () => IStructure)[] = [Structures.Loop, Structures.Do, Structures.While, Structures.Select,
  Structures.Provide, Structures.LoopAtScreen, Structures.LoopExtract];

/** statements that leave the loop, or may leave it, wherever they are in the loop body */
const LEAVING: (new () => IStatement)[] = [Statements.Return, Statements.Raise, Statements.Message, Statements.Leave,
  Statements.Submit, Statements.Stop, Statements.Reject];

/** statements which run no other code than the method calls they contain */
const CALLING: (new () => IStatement)[] = [Statements.Call, Statements.Move, Statements.If, Statements.ElseIf,
  Statements.Case, Statements.When, Statements.Append, Statements.InsertInternal, Statements.Concatenate];

/** data read by a condition or a source */
interface IReads {
  /** local variables, written only where the analysis sees it */
  locals: Variable[];
  /** attributes, parameters and other data that is not local, nor a constant */
  others: Identifier[];
  /** local reference variables followed by ->, the object they point to is read */
  receivers: Variable[];
}

export class SuspiciousLoop implements IRule {
  private reg: IRegistry;
  private conf = new SuspiciousLoopConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "suspicious_loop",
      title: "Suspicious loop",
      shortDescription: `Finds WHILE loops whose condition the loop body never changes`,
      extendedInformation: `Option unchangedCondition: reports a WHILE loop when the loop body cannot change its condition
after the first iteration. Then the loop runs zero times, once or forever.

The condition may read local variables of the METHOD, FORM or FUNCTION, constants, builtin functions
like lines( ), and attributes and parameters without ->. Each local variable in it is either
* not written in the loop body, or
* only written by var = source. directly in the loop body, not in a nested block, where the source is
  the same in every iteration: no method calls, field symbols or ->*, and it only reads constants,
  local variables that the loop body does not write, and other data that the loop body does not write.
Attributes and parameters in the condition must not be written in the loop body either.

When the condition or a source reads data that is not local, the loop body must not call methods,
functions or forms, except instance methods via local reference variables, and must not write via
field symbols or ->*. A source that reads local->attribute also needs that the loop body calls no
method via that local.

Not reported: conditions with system fields like sy-subrc, field symbols, -> or method calls, local
variables whose address is taken, loop bodies with EXIT, RETURN, RAISE, MESSAGE, LEAVE, SUBMIT, STOP or
REJECT, and, when the condition variables are written, loop bodies with CONTINUE or CHECK.
Objects with syntax errors, macros or unknown statements are skipped, as are procedures with dynamic code,
INCLUDE, test seams, enhancements or native SQL.`,
      tags: [],
      badExample: `DATA(lo_x) = previous.
WHILE lo_x IS BOUND.
  result = result && lo_x->get_text( ).
  lo_x = previous->previous.
ENDWHILE.`,
      goodExample: `DATA(lo_x) = previous.
WHILE lo_x IS BOUND.
  result = result && lo_x->get_text( ).
  lo_x = lo_x->previous.
ENDWHILE.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SuspiciousLoopConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): readonly Issue[] {
    if (this.conf.unchangedCondition === false) {
      return [];
    }
    const analysis = ObjectAnalysis.run(this.reg, obj);
    if (analysis === undefined) {
      return [];
    }

    const issues: Issue[] = [];
    for (const procedure of analysis.procedures) {
      if (procedure.supported === false) {
        continue;
      }
      for (const loop of procedure.structure.findAllStructuresRecursive(Structures.While)) {
        const issue = this.unchangedCondition(procedure, loop);
        if (issue !== undefined) {
          issues.push(issue);
        }
      }
    }
    return issues;
  }

////////////////

  private unchangedCondition(procedure: Procedure, loop: StructureNode): Issue | undefined {
    const statement = loop.findDirectStatement(Statements.While);
    const end = loop.findDirectStatement(Statements.EndWhile);
    const cond = statement?.findDirectExpression(Expressions.Cond);
    if (statement === undefined || end === undefined || cond === undefined
        || statement.findDirectTokenByText("VARY") !== undefined
        || cond.getAllTokens().some(t => t.getStr() === "->")) {
      return undefined;
    }
    const reads = this.reads(procedure, cond);
    if (reads === undefined || reads.locals.length + reads.others.length === 0) {
      return undefined;
    }

    const from = procedure.index(statement);
    const to = procedure.index(end);
    const body = loop.findDirectStructure(Structures.Body);
    let continues = false;
    for (const found of body === undefined ? [] : this.loopControl(body, false)) {
      const type = found.get();
      if (type instanceof Statements.Continue || type instanceof Statements.Check) {
        continues = true;
      } else {
        return undefined;
      }
    }
    if (reads.others.some(o => this.writtenIn(procedure, o, from, to))
        || (reads.others.length > 0 && this.mayChangeOtherData(procedure, from, to, []))) {
      return undefined;
    }

    let written: string | undefined = undefined;
    for (const variable of reads.locals) {
      for (const write of variable.writes()) {
        if (write.index <= from || write.index >= to) {
          continue;
        } else if (continues || body === undefined
            || this.sameValueWrite(procedure, write.statement, write.token, body, from, to) === false) {
          return undefined;
        }
        written = variable.identifier.getName();
      }
    }

    const names = [...reads.locals.map(v => v.identifier.getName()), ...reads.others.map(o => o.getName())].join(", ");
    const message = written === undefined
      ? `WHILE condition never changes, the loop body does not write ${names}, the loop runs zero times or forever`
      : `WHILE condition does not change after the first iteration, the loop body sets ${written} `
        + `to the same value in every iteration, the loop runs once or forever`;
    return Issue.atStatement(procedure.file, statement, message, this.getMetadata().key, this.conf.severity);
  }

  /** data read by the condition or source, undefined if it reads anything that can change unseen */
  private reads(procedure: Procedure, node: ExpressionNode): IReads | undefined {
    if (node.findFirstExpression(Expressions.SourceFieldSymbol) !== undefined
        || node.findFirstExpression(Expressions.Dereference) !== undefined
        || node.findFirstExpression(Expressions.NewObject) !== undefined) {
      return undefined;
    }
    for (const call of node.findAllExpressionsRecursive(Expressions.MethodCall)) {
      if (this.isBuiltinCall(procedure, call) === false) {
        return undefined;
      }
    }

    const ret: IReads = {locals: [], others: [], receivers: []};
    const tokens = node.getAllTokens();
    for (const field of [...node.findAllExpressionsRecursive(Expressions.SourceField),
      ...node.findAllExpressionsRecursive(Expressions.AttributeName)]) {
      const token = field.getFirstToken();
      const identifier = procedure.identifierAt(token);
      if (isImmutable(identifier)) {
        continue;
      }
      const local = procedure.local(identifier);
      if (local !== undefined) {
        if (local.escapes()) {
          return undefined;
        }
        if (ret.locals.includes(local) === false) {
          ret.locals.push(local);
        }
        const index = tokens.findIndex(t => t.getStart().equals(token.getStart()));
        if (tokens[index + 1]?.getStr() === "->") {
          ret.receivers.push(local);
        }
      } else if (!(identifier instanceof TypedIdentifier)
          || identifier.getMeta().includes(IdentifierMeta.BuiltIn)) {
        // unknown, or system fields like sy-subrc, which change without a write reference
        return undefined;
      } else if (ret.others.includes(identifier) === false) {
        ret.others.push(identifier);
      }
    }
    return ret;
  }

  private isBuiltinCall(procedure: Procedure, call: ExpressionNode): boolean {
    const name = call.findDirectExpression(Expressions.MethodName)?.getFirstToken();
    if (name === undefined) {
      return false;
    }
    const references = procedure.analysis.referencesAt(procedure.file.getFilename(), name);
    return references.length > 0 && references.every(r => r.referenceType === ReferenceType.BuiltinMethodReference);
  }

  /** statements in the loop body that leave the loop or go to its next iteration */
  private loopControl(node: StructureNode, nested: boolean): StatementNode[] {
    const ret: StatementNode[] = [];
    for (const child of node.getChildren()) {
      if (child instanceof StructureNode) {
        ret.push(...this.loopControl(child, nested || NESTED_LOOPS.some(l => child.get() instanceof l)));
        continue;
      }
      const type = child.get();
      if (LEAVING.some(l => type instanceof l)
          || (nested === false && (type instanceof Statements.Exit
          || type instanceof Statements.Continue || type instanceof Statements.Check))) {
        ret.push(child as StatementNode);
      }
    }
    return ret;
  }

  /** var = source. directly in the loop body, the source has the same value in every iteration */
  private sameValueWrite(procedure: Procedure, statement: StatementNode, token: AbstractToken,
                         body: StructureNode, from: number, to: number): boolean {
    const move = plainMove(statement);
    if (move === undefined || move.operator !== "=" || singleTarget(move.target) !== token
        || procedure.block(statement) !== body || procedure.isSimple(statement) === false) {
      return false;
    }
    const reads = this.reads(procedure, move.source);
    if (reads === undefined
        || reads.locals.some(l => this.changedIn(procedure, l, from, to))
        || reads.others.some(o => this.writtenIn(procedure, o, from, to))) {
      return false;
    }
    return reads.others.length === 0 || this.mayChangeOtherData(procedure, from, to, reads.receivers) === false;
  }

  /** written in the loop body, or declared inline in it: the inline declaration is not one of the writes(),
   * but sets the variable in every iteration, possibly from data the loop changes */
  private changedIn(procedure: Procedure, local: Variable, from: number, to: number): boolean {
    if (local.writes().some(w => w.index > from && w.index < to)) {
      return true;
    }
    const index = local.inline && local.declaration !== undefined ? procedure.index(local.declaration) : -1;
    return index > from && index < to;
  }

  private writtenIn(procedure: Procedure, identifier: Identifier, from: number, to: number): boolean {
    for (const reference of procedure.analysis.referencesTo(identifier)) {
      if (reference.referenceType !== ReferenceType.DataWriteReference || !procedure.contains(reference.position)) {
        continue;
      }
      const statement = procedure.statementOf(reference.position.getToken());
      const index = statement === undefined ? -1 : procedure.index(statement);
      if (index > from && index < to) {
        return true;
      }
    }
    return false;
  }

  /** the loop body calls methods, functions or forms, or writes via field symbols or ->*, which can change
   * attributes and other data that is not local; instance methods via local reference variables are accepted,
   * unless the variable is one of the receivers */
  private mayChangeOtherData(procedure: Procedure, from: number, to: number, receivers: Variable[]): boolean {
    for (let index = from + 1; index < to; index++) {
      const statement = procedure.statements[index];
      if (statement.findFirstExpression(Expressions.TargetFieldSymbol) !== undefined
          || statement.findFirstExpression(Expressions.Dereference) !== undefined) {
        return true;
      } else if (procedure.isCallFree(statement)) {
        continue;
      }
      const type = statement.get();
      if (!CALLING.some(c => type instanceof c) || statement.findFirstExpression(Expressions.NewObject) !== undefined) {
        return true;
      }
      const tokens = procedure.tokensOf(statement);
      const methodSource = statement.findDirectExpression(Expressions.MethodSource);
      if (methodSource !== undefined && this.localReceiver(procedure, tokens, methodSource.getLastToken(), receivers) === false) {
        return true;
      }
      for (const call of statement.findAllExpressionsRecursive(Expressions.MethodCall)) {
        if (this.isBuiltinCall(procedure, call) === false
            && this.localReceiver(procedure, tokens, call.getFirstToken(), receivers) === false) {
          return true;
        }
      }
    }
    return false;
  }

  /** the method name token is preceded by local->, a local reference variable that is not one of the receivers */
  private localReceiver(procedure: Procedure, tokens: readonly AbstractToken[], name: AbstractToken, receivers: Variable[]): boolean {
    const index = tokens.findIndex(t => t.getStart().equals(name.getStart()));
    if (index < 2 || tokens[index - 1].getStr() !== "->") {
      return false;
    }
    const local = procedure.local(procedure.identifierAt(tokens[index - 2]));
    return local !== undefined && receivers.includes(local) === false;
  }

}
