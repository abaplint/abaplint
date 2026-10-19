import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {AbstractToken} from "../abap/1_lexer/tokens/abstract_token";
import {ExpressionNode, StatementNode, TokenNode} from "../abap/nodes";
import {ReferenceType} from "../abap/5_syntax/_reference";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {EditHelper, IEdit} from "../edit_helper";
import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {LanguageVersion, Release, releaseAtLeast} from "../version";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IOccurrence, NUMERIC_FUNCTIONS, ObjectAnalysis, OccurrenceKind, Procedure, SourceKind, Variable,
  characterConstant, dataSource, deleteStatement, expressionPath, expressionType, formalParameter, identicalTypes,
  isCondition, isImmutable, isReferenceType, literalType, mergeEdits, nodeText, plainClear, plainData, plainMove,
  singleField, singleTarget, targetType, unchangedBetween} from "./_procedure_analysis";

export class SingleUseExpressionTempConf extends BasicRuleConfig {
}

/** constructor expressions that can build the result directly in the target */
const IN_PLACE = new Set(["VALUE", "CORRESPONDING", "COND", "SWITCH", "REDUCE", "FILTER"]);

/** constructor expressions with an explicit type: KEYWORD type( ... ) */
const CONSTRUCTORS = new Set(["VALUE", "CORRESPONDING", "COND", "SWITCH", "REDUCE", "FILTER", "CONV", "EXACT", "REF"]);

/** types that an integer literal converts to without an exception */
const LITERAL_CONVERSIONS = new Set(["I", "INT8", "F", "DECFLOAT16", "DECFLOAT34", "STRING"]);

/** where the variable is read */
enum Placement {
  /** y = v. */
  Move = "move",
  /** v->m( ) or v->attr */
  Receiver = "receiver",
  /** m( v ), m( p = v ), CALL METHOD m EXPORTING p = v, NEW c( p = v ), CREATE OBJECT o EXPORTING p = v */
  Parameter = "parameter",
  /** APPEND v TO itab. */
  Append = "append",
  /** IF v = x., ELSEIF v = x., xsdbool( v = x ) */
  Comparison = "comparison",
  /** |{ v }| */
  Template = "template",
}

enum ExpressionKind {
  /** literal, string template without embeddings, CONV t( literal ) or a constant: the same value everywhere */
  Constant = "constant",
  /** reads only private variables and constants, cannot raise an exception or run other code */
  Pure = "pure",
  /** a data object that other code can change */
  Data = "data",
  /** method calls, NEW and everything else */
  Other = "other",
}

interface ITemp {
  variable: Variable;
  /** the statement that assigns the expression to the variable */
  write: StatementNode;
  /** the expression */
  source: ExpressionNode;
  /** the statements that the quick fix deletes */
  remove: StatementNode[];
}

export class SingleUseExpressionTemp implements IRule {
  private reg: IRegistry;
  private conf = new SingleUseExpressionTempConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "single_use_expression_temp",
      title: "Single use expression temporary",
      shortDescription: `Finds a local variable that only passes the value of an expression on to its single use`,
      extendedInformation: `Reports DATA(v) = <expression>. and DATA v TYPE t. [CLEAR v.] v = <expression>.
when all of the following hold:

* v is a local variable of a METHOD, FORM or FUNCTION, its address is never taken. DATA(v) has no other
  reference than its single read; DATA v TYPE t. without VALUE and not chained has exactly one write besides
  CLEARs, v = <expression>., all CLEARs are before it, and exactly one read after it
* the read is one of
  * the complete source of y = v.
  * the receiver of a method call or attribute access: v->m( ), v->attr
  * an actual parameter for an importing parameter: m( v ), m( p = v ), CALL METHOD m EXPORTING p = v,
    NEW c( p = v ) or CREATE OBJECT o EXPORTING p = v
  * APPEND v TO itab.
  * an operand of a comparison with =, <>, <, >, <=, >= or their word forms, in IF, ELSEIF or xsdbool( )
  * an embedding in a string template: |{ v }|
* the read is in the statement directly after the assignment, in the same block, ignoring declarations like
  DATA and TYPES in between, unless the expression is
  constant: a literal, a string template without embeddings, CONV t( <integer literal> ) to a type that cannot
  overflow, or a constant. Then the assignment must be executed before the read on every path: the read is in
  the block of the assignment or a nested block
* the result type of the expression does not depend on the target: no arithmetic or bit operators, no unary
  minus, no numeric functions like abs( ) or trunc( ) whose type follows the argument, no CONV or EXACT except
  the constant CONV t( literal ), no # type inference at the top. String templates, && concatenations, literals, method calls, NEW, CAST,
  constructor expressions with explicit type and table expressions are fine
* for DATA v TYPE t., the static type of the expression is identical to t. Into y = v. also a reference whose
  static type is a subtype of t, unless y is an inline declaration, and an expression whose type depends on the
  target, like arithmetic, if y has a type identical to t
* VALUE, CORRESPONDING, COND, SWITCH, REDUCE and FILTER can build their result directly in the target,
  they are only moved into a new variable, or a local variable that they do not read and whose address
  is never taken
* the order of evaluation does not change: if the expression is not constant, nothing that is evaluated before the
  read in the same statement calls a method or function, constructs an object, accesses a table or an attribute
  via a reference, does arithmetic, or reads data other than local variables, pass-by-value parameters and
  constants; the read is not inside COND, SWITCH, VALUE or other constructor expressions except NEW, and not
  after AND, OR or EQUIV, where it might not be evaluated. This does not apply to expressions that only read
  local variables and cannot raise an exception
* a data object that other code can change is only moved if it keeps its value until the read, see
  unnecessary_copy, a data object read by DATA(v) = <data object>. is left for unnecessary_copy, and a local
  variable copied into y = v. for copy_chain
* a character constant in IF, ELSEIF, WHILE, CHECK, CASE or WHEN is left for constant_condition

Objects with syntax errors, macros or unknown statements are skipped, as are procedures with dynamic code,
INCLUDE, test seams, enhancements or native SQL.

The quick fix deletes the declaration, the CLEARs and the assignment, and replaces the read of v with the
expression. Moving the expression of DATA v TYPE t. into other places than y = v. requires 7.40 SP02 or above,
ABAP Cloud or open-abap.`,
      tags: [RuleTag.Quickfix],
      badExample: `DATA(lo_conf) = NEW zcl_conf( ).
mo_conf = lo_conf.
DATA lv_key TYPE string.
lv_key = |abapdoc|.
lo_meta = NEW zcl_meta( iv_key = lv_key ).`,
      goodExample: `mo_conf = NEW zcl_conf( ).
lo_meta = NEW zcl_meta( iv_key = |abapdoc| ).`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SingleUseExpressionTempConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): readonly Issue[] {
    const analysis = ObjectAnalysis.run(this.reg, obj);
    if (analysis === undefined) {
      return [];
    }
    const config = this.reg.getConfig();
    const expressions = releaseAtLeast(config.getRelease(), Release.v740sp02)
      || config.getLanguageVersion() === LanguageVersion.Cloud || config.isOpenABAP();

    const issues: Issue[] = [];
    for (const procedure of analysis.procedures) {
      if (procedure.supported === false) {
        continue;
      }
      for (const variable of procedure.locals()) {
        const temp = variable.inline ? this.inlineTemp(procedure, variable) : this.declaredTemp(variable);
        const read = variable.reads()[0];
        if (temp === undefined || read === undefined) {
          continue;
        }
        const placement = this.placement(procedure, read.statement, read.token);
        if (placement === undefined
            || (!variable.inline && placement !== Placement.Move && expressions === false)
            || !this.valid(procedure, temp, read, placement)) {
          continue;
        }
        const edits: IEdit[] = [EditHelper.replaceToken(procedure.file, read.token, nodeText(procedure.file, temp.source))];
        for (const statement of temp.remove) {
          edits.push(deleteStatement(procedure.file, statement));
        }
        const fix = mergeEdits(procedure.file, edits);
        const message = "Use the expression directly instead of via " + variable.identifier.getName();
        issues.push(Issue.atStatement(procedure.file, temp.write, message, this.getMetadata().key, this.conf.severity, fix));
      }
    }
    return issues;
  }

  /** DATA(v) = <expression>. with a single read, plain data objects are left for unnecessary_copy */
  private inlineTemp(procedure: Procedure, variable: Variable): ITemp | undefined {
    const declaration = variable.declaration!;
    const move = plainMove(declaration);
    if (move === undefined || move.operator !== "="
        || move.target.getChildren().length !== 1
        || move.target.findDirectExpression(Expressions.InlineData) === undefined
        || variable.occurrences.length !== 1 || variable.occurrences[0].kind !== OccurrenceKind.Read
        || dataSource(procedure, move.source) !== undefined
        || !this.targetIndependent(procedure, move.source)) {
      return undefined;
    }
    return {variable, write: declaration, source: move.source, remove: [declaration]};
  }

  /** DATA v TYPE t. [CLEAR v.] v = <expression>. with a single read after it */
  private declaredTemp(variable: Variable): ITemp | undefined {
    const declaration = variable.declaration!;
    if (!plainData(declaration) || declaration.getColon() !== undefined || variable.escapes()) {
      return undefined;
    }
    const clears: IOccurrence[] = [];
    const writes: IOccurrence[] = [];
    for (const write of variable.writes()) {
      if (plainClear(write.statement)?.getStart().equals(write.token.getStart()) === true
          && write.statement.getColon() === undefined) {
        clears.push(write);
      } else {
        writes.push(write);
      }
    }
    const reads = variable.reads();
    if (writes.length !== 1 || reads.length !== 1) {
      return undefined;
    }
    const write = writes[0];
    const move = plainMove(write.statement);
    if (move === undefined || move.operator !== "="
        || singleTarget(move.target)?.getStart().equals(write.token.getStart()) !== true
        || clears.some(c => c.index > write.index)
        || reads[0].index <= write.index) {
      return undefined;
    }
    return {variable, write: write.statement, source: move.source,
      remove: [declaration, ...clears.map(c => c.statement), write.statement]};
  }

  private placement(procedure: Procedure, statement: StatementNode, token: AbstractToken): Placement | undefined {
    if (statement.getColon() !== undefined) {
      return undefined;
    }
    const move = plainMove(statement);
    if (move !== undefined && move.operator === "=" && singleField(move.source)?.getStart().equals(token.getStart()) === true) {
      return Placement.Move;
    }
    const path = expressionPath(statement, token);
    if (path.some(e => e.get() instanceof Expressions.Target || e.get() instanceof Expressions.MethodSource
        || e.get() instanceof Expressions.Dereference)) {
      return undefined;
    }
    const tokens = procedure.tokensOf(statement);
    const index = tokens.findIndex(t => t.getStart().equals(token.getStart()));
    if (tokens[index + 1]?.getStr() === "->") {
      return tokens[index + 2]?.getStr() === "*" ? undefined : Placement.Receiver;
    }

    let sourceIndex = path.length - 1;
    while (sourceIndex >= 0 && !(path[sourceIndex].get() instanceof Expressions.Source)
        && !(path[sourceIndex].get() instanceof Expressions.SimpleSource4)) {
      sourceIndex--;
    }
    const source = path[sourceIndex];
    if (source === undefined || source.countTokens() !== 1
        || source.findDirectExpression(Expressions.FieldChain) === undefined) {
      return undefined;
    }
    const parent = path[sourceIndex - 1];
    if (parent === undefined) {
      return statement.get() instanceof Statements.Append && statement.getChildren()[1] === source
        ? Placement.Append : undefined;
    } else if (parent.get() instanceof Expressions.StringTemplateSource) {
      return Placement.Template;
    } else if (parent.get() instanceof Expressions.Compare) {
      if (parent.findDirectExpression(Expressions.CompareOperator) === undefined) {
        return undefined;
      }
      let owner = sourceIndex - 2;
      while (path[owner]?.get() instanceof Expressions.Cond) {
        owner--;
      }
      if (owner === sourceIndex - 2) {
        return undefined;
      } else if (owner < 0) {
        const type = statement.get();
        return type instanceof Statements.If || type instanceof Statements.ElseIf ? Placement.Comparison : undefined;
      }
      const keyword = path[owner].getFirstToken().getStr().toUpperCase();
      return path[owner].get() instanceof Expressions.Source && (keyword === "XSDBOOL" || keyword === "BOOLC")
        ? Placement.Comparison : undefined;
    }
    return formalParameter(procedure, statement, token) !== undefined ? Placement.Parameter : undefined;
  }

  private valid(procedure: Procedure, temp: ITemp, read: IOccurrence, placement: Placement): boolean {
    const statement = read.statement;
    const kind = this.kind(procedure, temp.source);
    if (kind === ExpressionKind.Constant) {
      if (!procedure.dominates(temp.write, statement)
          || (temp.variable.inline && isCondition(statement) && characterConstant(procedure, temp.source) !== undefined)) {
        return false;
      }
    } else if (statement !== procedure.nextExecuted(temp.write)
        || !(procedure.isSimple(statement) || statement.get() instanceof Statements.If)) {
      return false;
    }

    if (!this.typeMatches(procedure, temp, statement, placement)) {
      return false;
    } else if (placement === Placement.Receiver && !this.chainable(temp.source)) {
      return false;
    }

    const data = dataSource(procedure, temp.source);
    if (kind === ExpressionKind.Constant) {
      return true;
    } else if (data?.kind === SourceKind.Local && singleField(temp.source) !== undefined && placement === Placement.Move) {
      // left for copy_chain
      return false;
    } else if (!this.notWrittenIn(procedure, temp.source, statement)) {
      return false;
    } else if (kind === ExpressionKind.Pure) {
      return true;
    } else if (!this.evaluatedFirst(procedure, statement, read.token) || !this.alwaysEvaluated(statement, read.token)) {
      return false;
    }
    return data === undefined || unchangedBetween(procedure, data, temp.write, statement, read.token);
  }

  private kind(procedure: Procedure, source: ExpressionNode): ExpressionKind {
    const data = dataSource(procedure, source);
    if (this.constant(source) || data?.kind === SourceKind.Immutable) {
      return ExpressionKind.Constant;
    } else if ((data?.kind === SourceKind.Local && data.base?.escapes() === false) || this.pure(procedure, source)) {
      return ExpressionKind.Pure;
    } else if (data !== undefined) {
      return ExpressionKind.Data;
    }
    return ExpressionKind.Other;
  }

  /** a literal, a string template without embeddings, or CONV t( literal ) that cannot raise an exception */
  private constant(source: ExpressionNode): boolean {
    const children = source.getChildren();
    const first = children[0];
    if (children.length === 1 && first instanceof ExpressionNode) {
      return first.get() instanceof Expressions.Constant
        || (first.get() instanceof Expressions.StringTemplate
          && first.findDirectExpression(Expressions.StringTemplateSource) === undefined);
    }
    if (children.length !== 5 || source.getFirstToken().getStr().toUpperCase() !== "CONV") {
      return false;
    }
    const type = source.findDirectExpression(Expressions.TypeNameOrInfer)?.concatTokens().toUpperCase() || "";
    const body = source.findDirectExpression(Expressions.ConvBody);
    const value = body?.getChildren().length === 1 ? body.findDirectExpression(Expressions.Source) : undefined;
    const literal = value?.getChildren().length === 1 ? value.findDirectExpression(Expressions.Constant) : undefined;
    return literal !== undefined && LITERAL_CONVERSIONS.has(type)
      && (literal.findDirectExpression(Expressions.Integer) !== undefined || type === "STRING");
  }

  /** reads only private variables and constants, and cannot raise an exception: string templates and
   * concatenations of such fields, xsdbool( ) and boolc( ) of IS INITIAL, IS BOUND, IS INSTANCE OF and
   * comparisons without conversion */
  private pure(procedure: Procedure, source: ExpressionNode): boolean {
    const children = source.getChildren();
    const first = children[0];
    const keyword = first instanceof TokenNode ? first.getFirstToken().getStr().toUpperCase() : "";
    if (children.length === 1 && first instanceof ExpressionNode) {
      return this.pureOperand(procedure, first);
    } else if (children.length === 3 && children[1] instanceof TokenNode && children[1].getFirstToken().getStr() === "&&"
        && children[0] instanceof ExpressionNode && children[2] instanceof ExpressionNode) {
      return this.pureOperand(procedure, children[0]) && this.pure(procedure, children[2]);
    } else if (children.length === 4 && (keyword === "XSDBOOL" || keyword === "BOOLC")) {
      const cond = source.findDirectExpression(Expressions.Cond);
      return cond !== undefined && this.pureCondition(procedure, cond);
    }
    return false;
  }

  /** a literal, a private variable or constant, or a string template that embeds only those, without formatting */
  private pureOperand(procedure: Procedure, operand: ExpressionNode): boolean {
    if (operand.get() instanceof Expressions.Constant) {
      return true;
    } else if (operand.get() instanceof Expressions.FieldChain) {
      return operand.countTokens() === 1 && this.privateField(procedure, operand.getFirstToken());
    } else if (operand.get() instanceof Expressions.StringTemplate) {
      return operand.findDirectExpressions(Expressions.StringTemplateSource).every(s => s.getChildren().length === 1
        && this.operandType(procedure, s.findDirectExpression(Expressions.Source)!) !== undefined);
    }
    return false;
  }

  private pureCondition(procedure: Procedure, cond: ExpressionNode): boolean {
    for (const child of cond.getChildren()) {
      if (child instanceof TokenNode) {
        continue;
      } else if (child.get() instanceof Expressions.Cond) {
        if (!this.pureCondition(procedure, child)) {
          return false;
        }
      } else if (child.get() instanceof Expressions.Compare) {
        const operands = child.findDirectExpressions(Expressions.Source);
        const words = child.getChildren().filter(c => c instanceof TokenNode).map(c => c.getFirstToken().getStr().toUpperCase());
        const operator = child.findDirectExpression(Expressions.CompareOperator);
        const types = operands.map(o => this.operandType(procedure, o));
        if (types.some(t => t === undefined)) {
          return false;
        } else if (operands.length === 1 && words[words.length - 1] !== "SUPPLIED" && words[words.length - 1] !== "REQUESTED"
            && words.includes("IS") && child.findDirectExpression(Expressions.CompareOperator) === undefined) {
          // IS [NOT] INITIAL, IS [NOT] BOUND, IS [NOT] INSTANCE OF
          continue;
        } else if (operands.length === 2 && operator !== undefined
            && (identicalTypes(types[0]!, types[1]!) || (isReferenceType(types[0]!) && isReferenceType(types[1]!)))) {
          continue;
        }
        return false;
      } else {
        return false;
      }
    }
    return true;
  }

  /** type of a private variable, a constant or a literal, which can be read without side effects */
  private operandType(procedure: Procedure, source: ExpressionNode): AbstractType | undefined {
    if (source.getChildren().length !== 1 || source.countTokens() !== 1) {
      return undefined;
    }
    const constant = source.findDirectExpression(Expressions.Constant);
    if (constant !== undefined) {
      return literalType(constant);
    }
    const field = singleField(source);
    if (field === undefined || !this.privateField(procedure, field)) {
      return undefined;
    }
    return (procedure.identifierAt(field) as TypedIdentifier).getType();
  }

  private privateField(procedure: Procedure, token: AbstractToken): boolean {
    const identifier = procedure.identifierAt(token);
    return isImmutable(identifier) || procedure.private(identifier) !== undefined;
  }

  /** the variables read by the expression are not changed by the statement that reads the temporary,
   * except as the target of a move, which is written after its source is evaluated */
  private notWrittenIn(procedure: Procedure, source: ExpressionNode, statement: StatementNode): boolean {
    const target = plainMove(statement)?.target;
    const inTarget = (token: AbstractToken) => target !== undefined
      && !token.getStart().isBefore(target.getFirstToken().getStart()) && !target.getLastToken().getStart().isBefore(token.getStart());
    for (const token of source.getTokens()) {
      const variable = procedure.variable(procedure.identifierAt(token));
      if (variable?.occurrences.some(o => o.statement === statement && o.kind !== OccurrenceKind.Read && !inTarget(o.token)) === true) {
        return false;
      }
    }
    return true;
  }

  /** nothing evaluated before the token in the statement can run other code, raise an exception or read data that
   * other code changes. The target of a move is evaluated after its source */
  private evaluatedFirst(procedure: Procedure, statement: StatementNode, token: AbstractToken): boolean {
    const position = token.getStart();
    const before = (node: ExpressionNode) => node.getLastToken().getStart().isBefore(position);
    for (const type of [Expressions.MethodCall, Expressions.NewObject, Expressions.Cast, Expressions.TableExpression,
      Expressions.ArithOperator, Expressions.Dereference]) {
      if (statement.findAllExpressionsRecursive(type).some(before)) {
        return false;
      }
    }
    for (const source of statement.findAllExpressionsRecursive(Expressions.Source)) {
      const keyword = source.getFirstToken().getStr().toUpperCase();
      if (before(source) && CONSTRUCTORS.has(keyword) && source.findDirectExpression(Expressions.TypeNameOrInfer) !== undefined) {
        return false;
      }
    }

    // the target of a move or CREATE OBJECT is written after the source and the parameters are evaluated
    let target = plainMove(statement)?.target;
    if (statement.get() instanceof Statements.CreateObject) {
      target = statement.findDirectExpression(Expressions.Target);
      if (target?.countTokens() !== 1) {
        return false;
      }
    }
    const tokens = procedure.tokensOf(statement);
    for (let i = 0; i < tokens.length && tokens[i].getStart().isBefore(position); i++) {
      if (target !== undefined && !tokens[i].getStart().isBefore(target.getFirstToken().getStart())
          && !target.getLastToken().getStart().isBefore(tokens[i].getStart())) {
        continue;
      }
      const references = procedure.analysis.referencesAt(procedure.file.getFilename(), tokens[i]);
      if (references.some(r => r.referenceType === ReferenceType.DataReadReference
          || r.referenceType === ReferenceType.DataWriteReference)) {
        // a private variable or constant, and a reference only to call a method: v->m( ... token ... )
        if (!this.privateField(procedure, tokens[i])
            || (tokens[i + 1]?.getStr() === "->"
              && (tokens[i + 2] === undefined || procedure.methodAt(tokens[i + 2]) === undefined))) {
          return false;
        }
      }
    }
    return true;
  }

  /** the token is evaluated whenever the statement is: not in a branch of COND or SWITCH, not in an iteration of
   * VALUE, REDUCE or FILTER, and not after AND, OR or EQUIV */
  private alwaysEvaluated(statement: StatementNode, token: AbstractToken): boolean {
    const position = token.getStart();
    for (const node of expressionPath(statement, token)) {
      if (node.get() instanceof Expressions.Source) {
        const keyword = node.getFirstToken().getStr().toUpperCase();
        if (CONSTRUCTORS.has(keyword) && node.findDirectExpression(Expressions.TypeNameOrInfer) !== undefined) {
          return false;
        }
      } else if (node.get() instanceof Expressions.Cond) {
        for (const child of node.getChildren()) {
          const word = child.getFirstToken().getStr().toUpperCase();
          if (child instanceof TokenNode && child.getFirstToken().getStart().isBefore(position)
              && (word === "AND" || word === "OR" || word === "EQUIV")) {
            return false;
          }
        }
      } else if (node.get() instanceof Expressions.For || node.get() instanceof Expressions.Let) {
        return false;
      }
    }
    return true;
  }

  /** the expression can be followed by -> */
  private chainable(source: ExpressionNode): boolean {
    const children = source.getChildren();
    return children.length === 1 && (children[0].get() instanceof Expressions.FieldChain
      || children[0].get() instanceof Expressions.MethodCallChain);
  }

  private typeMatches(procedure: Procedure, temp: ITemp, statement: StatementNode, placement: Placement): boolean {
    const use = placement === Placement.Move ? plainMove(statement)! : undefined;
    if (use !== undefined && !this.noAliasing(procedure, temp.source, use.target)) {
      return false;
    } else if (temp.variable.inline) {
      // the variable has the type of the expression
      return true;
    }

    const type = temp.variable.identifier.getType();
    const independent = this.targetIndependent(procedure, temp.source);
    if (use === undefined) {
      return independent && this.sameType(procedure, temp, type);
    }
    const inline = use.target.findFirstExpression(Expressions.InlineData) !== undefined;
    if (independent) {
      if (this.sameType(procedure, temp, type)) {
        return true;
      }
      // an up cast into v, and v into y, is an up cast into y
      const expression = expressionType(procedure, temp.source);
      const constructed = this.constructedType(temp.source);
      const reference = expression === undefined ? constructed?.reference === true && constructed.name !== "#"
        : isReferenceType(expression);
      return inline === false && reference && isReferenceType(type);
    }
    // the type of the expression follows the target
    const target = inline ? undefined : targetType(procedure, use.target);
    return target !== undefined && identicalTypes(target, type);
  }

  /** the expression has exactly the type of the declaration DATA v TYPE t. */
  private sameType(procedure: Procedure, temp: ITemp, type: AbstractType): boolean {
    const expression = expressionType(procedure, temp.source);
    if (expression !== undefined) {
      return identicalTypes(expression, type);
    }
    // constructor expressions with an explicit type, compared by the name of the type
    const declared = temp.variable.declaration!.findDirectExpression(Expressions.DataDefinition)
      ?.findDirectExpression(Expressions.Type);
    const declaredName = declared?.findDirectExpression(Expressions.TypeName)?.concatTokens().toUpperCase();
    const words = declared?.getTokens().map(t => t.getStr().toUpperCase()).join(" ");
    const constructed = this.constructedType(temp.source);
    if (declaredName === undefined || constructed === undefined || constructed.name !== declaredName
        || constructed.name === "#") {
      return false;
    }
    return words === (constructed.reference ? "TYPE REF TO " : "TYPE ") + declaredName;
  }

  /** VALUE t( ... ), CONV t( ... ) etc., NEW c( ... ) and CAST c( ... ) with an explicit type */
  private constructedType(source: ExpressionNode): {name: string, reference: boolean} | undefined {
    const children = source.getChildren();
    const last = children[children.length - 1];
    const keyword = source.getFirstToken().getStr().toUpperCase();
    let name: ExpressionNode | undefined;
    let reference = false;
    if (CONSTRUCTORS.has(keyword) && keyword !== "REF" && last instanceof TokenNode && last.getFirstToken().getStr() === ")") {
      name = source.findDirectExpression(Expressions.TypeNameOrInfer);
    } else if (children.length === 1 && children[0].get() instanceof Expressions.MethodCallChain
        && children[0].getChildren().length === 1) {
      const constructor = (children[0] as ExpressionNode).getChildren()[0] as ExpressionNode;
      if (constructor.get() instanceof Expressions.NewObject || constructor.get() instanceof Expressions.Cast) {
        name = constructor.findDirectExpression(Expressions.TypeNameOrInfer);
        reference = true;
      }
    }
    const text = name?.concatTokens().toUpperCase();
    return text === undefined ? undefined : {name: text, reference};
  }

  /** the type of the expression does not depend on where it is assigned to */
  private targetIndependent(procedure: Procedure, source: ExpressionNode): boolean {
    const first = source.getFirstToken().getStr().toUpperCase();
    if (this.constant(source)) {
      return true;
    } else if (first === "CONV" || first === "EXACT"
        || source.findDirectExpression(Expressions.TypeNameOrInfer)?.concatTokens() === "#"
        || this.constructedType(source)?.name === "#"
        || source.findFirstExpression(Expressions.ArithOperator) !== undefined
        || source.getTokens().some(t => t.getStr().toUpperCase().startsWith("BIT-"))
        || !this.concatenationOnly(source)) {
      return false;
    }
    for (const call of source.findAllExpressionsRecursive(Expressions.MethodCall)) {
      const name = call.findDirectExpression(Expressions.MethodName)?.getFirstToken();
      if (name === undefined) {
        return false;
      }
      const builtin = procedure.analysis.referencesAt(procedure.file.getFilename(), name)
        .some(r => r.referenceType === ReferenceType.BuiltinMethodReference);
      if (builtin && NUMERIC_FUNCTIONS.has(name.getStr().toLowerCase())) {
        return false;
      }
    }
    return true;
  }

  /** one operand, or operands joined by && */
  private concatenationOnly(source: ExpressionNode): boolean {
    const children = source.getChildren();
    if (children.length === 1) {
      return true;
    }
    if (children.length === 3 && children[1] instanceof TokenNode && children[1].getFirstToken().getStr() === "&&"
        && children[0] instanceof ExpressionNode && children[2] instanceof ExpressionNode
        && children[2].get() instanceof Expressions.Source) {
      return !(children[0].get() instanceof Expressions.Source) && this.concatenationOnly(children[2]);
    }
    const first = children[0] instanceof TokenNode ? children[0].getFirstToken().getStr().toUpperCase() : "";
    if ((first === "XSDBOOL" || first === "BOOLC") && source.findDirectExpression(Expressions.Cond) !== undefined) {
      return true;
    }
    // constructor expressions: KEYWORD type( ... )
    return first !== "" && first !== "-"
      && children[1] instanceof ExpressionNode && children[1].get() instanceof Expressions.TypeNameOrInfer;
  }

  /** constructor expressions that build their result directly in the target are only inlined into a new
   * variable, or into a local variable which the expression does not read and which nothing else can reach */
  private noAliasing(procedure: Procedure, source: ExpressionNode, target: ExpressionNode): boolean {
    if (!IN_PLACE.has(source.getFirstToken().getStr().toUpperCase())
        || target.findDirectExpression(Expressions.InlineData) !== undefined) {
      return true;
    }
    const field = target.getChildren()[0];
    const local = target.getChildren().length === 1 && field instanceof ExpressionNode
      && field.get() instanceof Expressions.TargetField
      ? procedure.local(procedure.identifierAt(field.getFirstToken())) : undefined;
    if (local === undefined || local.escapes()) {
      return false;
    }
    const key = ObjectAnalysis.key(local.identifier);
    return source.getTokens().every(t => {
      const identifier = procedure.identifierAt(t);
      return identifier === undefined || ObjectAnalysis.key(identifier) !== key;
    });
  }
}
