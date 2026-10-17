import * as Expressions from "../abap/2_statements/expressions";
import {ExpressionNode, TokenNode} from "../abap/nodes";
import {ReferenceType} from "../abap/5_syntax/_reference";
import {EditHelper} from "../edit_helper";
import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {ObjectAnalysis, OccurrenceKind, Procedure, dataSource, deleteStatement, mergeEdits, nodeText, plainMove,
  singleField} from "./_procedure_analysis";

export class SingleUseExpressionTempConf extends BasicRuleConfig {
}

/** builtin functions whose result type follows the type of the argument */
const NUMERIC_FUNCTIONS = new Set(["abs", "sign", "ceil", "floor", "trunc", "frac", "ipow", "nmax", "nmin",
  "round", "rescale"]);

/** constructor expressions that can build the result directly in the target */
const IN_PLACE = new Set(["VALUE", "CORRESPONDING", "COND", "SWITCH", "REDUCE", "FILTER"]);

export class SingleUseExpressionTemp implements IRule {
  private reg: IRegistry;
  private conf = new SingleUseExpressionTempConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "single_use_expression_temp",
      title: "Single use expression temporary",
      shortDescription: `Finds DATA(a) = <expression>. directly followed by x = a., assign the expression to x`,
      extendedInformation: `Reports DATA(a) = <expression>. when all of the following hold:

* a is a local variable of a METHOD, FORM or FUNCTION, with no other reference than the next statement,
  which is x = a., in the same block
* the result type of the expression does not depend on the target: no arithmetic or bit operators, no unary
  minus, no numeric functions like abs( ) or trunc( ) whose type follows the argument, no CONV or EXACT,
  no # type inference at the top. String templates, && concatenations, literals, method calls, NEW, CAST,
  constructor expressions with explicit type and table expressions are fine
* x is not referenced in the expression; VALUE, CORRESPONDING, COND, SWITCH, REDUCE and FILTER are only
  inlined into a new or a local variable, as they can build the result directly in the target
* plain data objects are left for unnecessary_copy

Objects with syntax errors, macros or unknown statements are skipped, as are procedures with dynamic code,
INCLUDE, test seams, enhancements or native SQL.

The quick fix deletes the declaration and writes x = <expression>. No release requirement.`,
      tags: [RuleTag.Styleguide, RuleTag.Quickfix, RuleTag.SingleFile],
      badExample: `DATA(lo_conf) = NEW zcl_conf( ).
mo_conf = lo_conf.`,
      goodExample: `mo_conf = NEW zcl_conf( ).`,
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

    const issues: Issue[] = [];
    for (const procedure of analysis.procedures) {
      if (procedure.supported === false) {
        continue;
      }
      for (const variable of procedure.locals()) {
        const declaration = variable.declaration!;
        const move = variable.inline ? plainMove(declaration) : undefined;
        const read = variable.occurrences[0];
        if (move === undefined || move.operator !== "="
            || move.target.getChildren().length !== 1
            || move.target.findDirectExpression(Expressions.InlineData) === undefined
            || variable.occurrences.length !== 1 || read.kind !== OccurrenceKind.Read
            || read.statement !== procedure.statements[procedure.index(declaration) + 1]
            || procedure.block(read.statement) !== procedure.block(declaration)
            || !procedure.isSimple(read.statement)) {
          continue;
        }
        const use = plainMove(read.statement);
        if (use === undefined || use.operator !== "="
            || singleField(use.source)?.getStart().equals(read.token.getStart()) !== true
            || dataSource(procedure, move.source) !== undefined
            || !this.targetIndependent(procedure, move.source)
            || !this.noAliasing(procedure, move.source, use.target)) {
          continue;
        }
        const fix = mergeEdits(procedure.file, [
          EditHelper.replaceToken(procedure.file, read.token, nodeText(procedure.file, move.source)),
          deleteStatement(procedure.file, declaration)]);
        const message = "Assign the expression directly instead of via " + variable.identifier.getName();
        issues.push(Issue.atStatement(procedure.file, declaration, message, this.getMetadata().key, this.conf.severity, fix));
      }
    }
    return issues;
  }

  /** the type of the expression does not depend on where it is assigned to */
  private targetIndependent(procedure: Procedure, source: ExpressionNode): boolean {
    const first = source.getFirstToken().getStr().toUpperCase();
    if (first === "CONV" || first === "EXACT"
        || source.findDirectExpression(Expressions.TypeNameOrInfer)?.concatTokens() === "#"
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

  /** the target is not read while the expression builds its result */
  private noAliasing(procedure: Procedure, source: ExpressionNode, target: ExpressionNode): boolean {
    if (target.findDirectExpression(Expressions.InlineData) !== undefined) {
      return true;
    }
    const field = target.getChildren()[0];
    const base = field instanceof ExpressionNode && field.get() instanceof Expressions.TargetField
      ? procedure.identifierAt(field.getFirstToken()) : undefined;
    if (base === undefined) {
      return false;
    }
    for (const token of source.getTokens()) {
      const identifier = procedure.identifierAt(token);
      if (identifier !== undefined && ObjectAnalysis.key(identifier) === ObjectAnalysis.key(base)) {
        return false;
      }
    }
    const local = procedure.local(base);
    return !IN_PLACE.has(source.getFirstToken().getStr().toUpperCase())
      || (target.getChildren().length === 1 && local !== undefined && !local.escapes());
  }
}
