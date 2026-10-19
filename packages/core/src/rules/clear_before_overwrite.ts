import * as Expressions from "../abap/2_statements/expressions";
import * as Structures from "../abap/3_structures/structures";
import {StatementNode} from "../abap/nodes";
import {TableType} from "../abap/types/basic";
import {IdentifierMeta, TypedIdentifier} from "../abap/types/_typed_identifier";
import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IOccurrence, ObjectAnalysis, Procedure, Variable, deleteStatement, expressionPath, formalParameter,
  identicalTypes, isReferenceType, literalType, plainClear, plainCreateObject, plainMove, singleField,
  singleTarget} from "./_procedure_analysis";

export class ClearBeforeOverwriteConf extends BasicRuleConfig {
}

export class ClearBeforeOverwrite implements IRule {
  private reg: IRegistry;
  private conf = new ClearBeforeOverwriteConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "clear_before_overwrite",
      title: "CLEAR before overwrite",
      shortDescription: `Finds CLEAR of a local variable whose next use overwrites it completely`,
      extendedInformation: `Reports CLEAR v. when all of the following hold:

* v is a local variable of a METHOD, FORM or FUNCTION, its address is never taken: no field symbol,
  REF #( ), GET REFERENCE, and it is not passed to a parameter by reference
* the CLEAR is not chained and has no WITH addition
* the next reference to v is a full overwrite in the same block: v = <expression>., including v = NEW ...,
  or CREATE OBJECT v. with optional TYPE and EXPORTING, where nothing else in the statement references v.
  Not ?=, READ TABLE INTO, offset/length or component writes, CREATE OBJECT with EXCEPTIONS, or other
  statements that can leave v unchanged
* every statement between the CLEAR and the overwrite is a direct statement of the block, not a nested structure,
  and does not reference v
* v is not a table with header line
* if a TRY or CATCH SYSTEM-EXCEPTIONS encloses the CLEAR, nothing from the CLEAR to the overwrite can raise
  an exception, a CATCH could see the old value: the overwrite directly follows the CLEAR and assigns a variable
  or a literal of identical type, or a reference variable

Unlike clear_after_declaration, the CLEAR can be in a loop.
Objects with syntax errors, macros or unknown statements are skipped, as are procedures with dynamic code,
INCLUDE, test seams, enhancements or native SQL.

The quick fix deletes the CLEAR. No release requirement.`,
      tags: [RuleTag.Quickfix],
      badExample: `CLEAR lv_name.
lv_name = iv_name.`,
      goodExample: `lv_name = iv_name.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ClearBeforeOverwriteConf) {
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
        const type = variable.identifier.getType();
        if (variable.escapes() || (type instanceof TableType && type.isWithHeader())
            || this.passedByReference(procedure, variable)) {
          continue;
        }
        const occurrences = variable.occurrences;
        for (let i = 0; i < occurrences.length - 1; i++) {
          const clear = occurrences[i];
          const next = occurrences[i + 1];
          if (plainClear(clear.statement)?.getStart().equals(clear.token.getStart()) !== true
              || clear.statement.getColon() !== undefined
              || occurrences.some(o => o !== next && o.statement === next.statement)
              || !this.overwrites(next)) {
            continue;
          }
          const between = procedure.straightBetween(clear.statement, next.statement);
          if (between === undefined
              || (procedure.enclosedBy(clear.statement, [Structures.Try, Structures.CatchSystemExceptions])
                && (between.length > 0 || !this.cannotRaise(procedure, variable, next.statement)))) {
            continue;
          }
          const message = "CLEAR of " + variable.identifier.getName() + ", which is overwritten before it is read";
          issues.push(Issue.atStatement(procedure.file, clear.statement, message, this.getMetadata().key,
                                        this.conf.severity, deleteStatement(procedure.file, clear.statement)));
        }
      }
    }
    return issues;
  }

  /** passed to a method, NEW, CREATE OBJECT or RAISE EXCEPTION, other than to a pass-by-value parameter;
   * the called code could keep a reference to the parameter */
  private passedByReference(procedure: Procedure, variable: Variable): boolean {
    for (const read of variable.reads()) {
      const path = expressionPath(read.statement, read.token);
      if (!path.some(e => e.get() instanceof Expressions.MethodCallParam || e.get() instanceof Expressions.ParameterListS
          || e.get() instanceof Expressions.MethodParameters)) {
        continue;
      }
      const formal = formalParameter(procedure, read.statement, read.token);
      if (formal?.parameter?.getMeta().includes(IdentifierMeta.PassByValue) !== true) {
        return true;
      }
    }
    return false;
  }

  /** v = <expression>. or CREATE OBJECT v [TYPE c] [EXPORTING ...]. */
  private overwrites(occurrence: IOccurrence): boolean {
    const statement = occurrence.statement;
    const move = plainMove(statement);
    if (move !== undefined) {
      return move.operator === "=" && singleTarget(move.target)?.getStart().equals(occurrence.token.getStart()) === true;
    }
    const create = plainCreateObject(statement);
    return create !== undefined && singleTarget(create.target)?.getStart().equals(occurrence.token.getStart()) === true;
  }

  /** v = w. or v = literal. without conversion */
  private cannotRaise(procedure: Procedure, variable: Variable, statement: StatementNode): boolean {
    const move = plainMove(statement);
    if (move === undefined) {
      return false;
    }
    const type = variable.identifier.getType();
    const field = singleField(move.source);
    const constant = move.source.getChildren().length === 1 ? move.source.findDirectExpression(Expressions.Constant) : undefined;
    const identifier = field === undefined ? undefined : procedure.identifierAt(field);
    const source = identifier instanceof TypedIdentifier ? identifier.getType()
      : constant === undefined ? undefined : literalType(constant);
    return source !== undefined
      && (identicalTypes(source, type) || (isReferenceType(source) && isReferenceType(type) && field !== undefined));
  }
}
