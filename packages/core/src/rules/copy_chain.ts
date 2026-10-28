import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {GenericObjectReferenceType, ObjectReferenceType} from "../abap/types/basic";
import {EditHelper, IEdit} from "../edit_helper";
import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IOccurrence, ObjectAnalysis, Procedure, SourceKind, Variable, dataSource, deleteStatement, identicalTypes,
  initialDeclaration, isReferenceType, mergeEdits, nodeText, plainClear, plainCreateObject, plainMove, singleField,
  singleTarget,
  unchangedBetween} from "./_procedure_analysis";

export class CopyChainConf extends BasicRuleConfig {
}

export class CopyChain implements IRule {
  private reg: IRegistry;
  private conf = new CopyChainConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "copy_chain",
      title: "Copy chain",
      shortDescription: `Finds a local variable that only passes a value on from one variable to another`,
      extendedInformation: `Reports a local variable that only passes a value on, in two cases.

1. DATA v TYPE ... [CLEAR v.] v = src. ... y = v. when all of the following hold:

* v is a local variable of a METHOD, FORM or FUNCTION, declared with DATA without VALUE, or with
  DATA(v) = VALUE t( ). with an explicit type and nothing in the parentheses
* v has exactly one write besides CLEAR: v = src., and all CLEARs are before it
* v has exactly one read, the complete source of y = v.
* src is a local variable, or a pass-by-value or RETURNING parameter of a method or form, its address is never
  taken, and it is not written from v = src. until y = v.
* v = src. is executed before y = v. on every path: y = v. is in the same block or a nested block,
  and both are in the same loop
* v and src are both reference types, or have identical types; for other types the copy into v can convert,
  e.g. truncate a string into a c field. For DATA(y) = v. the types must be identical, else y changes its type
* the declaration, the CLEARs and v = src. are not chained

The quick fix deletes the declaration, the CLEARs and v = src., and changes the read to y = src.

2. DATA a TYPE REF TO c. CREATE OBJECT a. b = a. when all of the following hold:

* a is a local variable, declared with DATA without VALUE and not chained, its address is never taken
* the only other references to a are CREATE OBJECT a. and the complete source of b = a., which is the next
  statement in the same block, apart from declarations like DATA in between
* CREATE OBJECT has at most TYPE and EXPORTING, it is not chained. With EXCEPTIONS, a classic exception in the
  constructor would leave b unchanged instead of initial
* b is a local variable, or a pass-by-value or RETURNING parameter, whose address is never taken, it is
  declared before the CREATE OBJECT and not used in its parameters, so the constructor cannot see b
* b = a. passes the syntax check, so the static type of b accepts the class of a

The quick fix deletes the declaration of a and b = a., and creates the object in b, keeping TYPE and EXPORTING.
If the static types of a and b differ, it adds TYPE with the class of a.

Objects with syntax errors, macros or unknown statements are skipped, as are procedures with dynamic code,
INCLUDE, test seams, enhancements or native SQL. No release requirement.`,
      tags: [RuleTag.Quickfix],
      badExample: `DATA lo_copy TYPE REF TO zcl_node.
lo_copy = lo_node.
ro_result = lo_copy.
DATA lo_new TYPE REF TO zcl_node.
CREATE OBJECT lo_new.
ro_other = lo_new.`,
      goodExample: `ro_result = lo_node.
CREATE OBJECT ro_other.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CopyChainConf) {
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
        if (initialDeclaration(variable) === undefined || declaration.getColon() !== undefined
            || variable.escapes()) {
          continue;
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
          continue;
        }
        const write = writes[0];
        const read = reads[0];
        if (write.statement.get() instanceof Statements.CreateObject) {
          const issue = clears.length === 0 ? this.createObject(procedure, variable, write, read) : undefined;
          if (issue !== undefined) {
            issues.push(issue);
          }
          continue;
        }
        const assign = plainMove(write.statement);
        const use = plainMove(read.statement);
        if (assign === undefined || use === undefined || assign.operator !== "=" || use.operator !== "="
            || singleTarget(assign.target)?.getStart().equals(write.token.getStart()) !== true
            || singleField(use.source)?.getStart().equals(read.token.getStart()) !== true
            || clears.some(c => c.index > write.index)
            || !procedure.dominates(write.statement, read.statement)
            || !procedure.sameLoop(write.statement, read.statement)) {
          continue;
        }
        const source = dataSource(procedure, assign.source);
        if (source === undefined || source.kind !== SourceKind.Local || source.base === variable
            || singleField(assign.source) === undefined
            || !unchangedBetween(procedure, source, write.statement, read.statement)) {
          continue;
        }
        // an inline declaration DATA(y) = v. would get the type of src instead of the type of v
        const type = variable.identifier.getType();
        const inline = use.target.findFirstExpression(Expressions.InlineData) !== undefined;
        if (!identicalTypes(type, source.type) && (inline || !isReferenceType(type) || !isReferenceType(source.type))) {
          continue;
        }

        const edits: IEdit[] = [
          deleteStatement(procedure.file, declaration),
          deleteStatement(procedure.file, write.statement),
          EditHelper.replaceToken(procedure.file, read.token, source.text)];
        for (const clear of clears) {
          edits.push(deleteStatement(procedure.file, clear.statement));
        }
        const fix = mergeEdits(procedure.file, edits);
        const message = "Copy chain via " + variable.identifier.getName() + ", assign " + source.text + " directly";
        issues.push(Issue.atStatement(procedure.file, read.statement, message, this.getMetadata().key, this.conf.severity, fix));
      }
    }
    return issues;
  }

  /** DATA a TYPE REF TO c. CREATE OBJECT a. b = a. */
  private createObject(procedure: Procedure, variable: Variable, write: IOccurrence, read: IOccurrence): Issue | undefined {
    const create = plainCreateObject(write.statement);
    const use = plainMove(read.statement);
    const token = use === undefined ? undefined : singleTarget(use.target);
    const target = token === undefined ? undefined : procedure.private(procedure.identifierAt(token));
    if (create === undefined || use === undefined || use.operator !== "=" || target === undefined
        || singleTarget(create.target)?.getStart().equals(write.token.getStart()) !== true
        || singleField(use.source)?.getStart().equals(read.token.getStart()) !== true
        || read.statement !== procedure.nextExecuted(write.statement) || !procedure.isSimple(read.statement)
        || target.occurrences.some(o => o.statement === write.statement)
        || (target.declaration !== undefined && procedure.index(target.declaration) > write.index)) {
      return undefined;
    }

    const type = variable.identifier.getType();
    const targetType = target.identifier.getType();
    let text = nodeText(procedure.file, use.target);
    if (!(type instanceof ObjectReferenceType)
        || !(targetType instanceof ObjectReferenceType || targetType instanceof GenericObjectReferenceType)) {
      return undefined;
    } else if (create.type === undefined && !identicalTypes(type, targetType)) {
      // the class of a, as written in its declaration
      const declared = variable.declaration!.findDirectExpression(Expressions.DataDefinition)
        ?.findDirectExpression(Expressions.Type);
      const name = declared?.findDirectExpression(Expressions.TypeName);
      if (name === undefined || declared?.getTokens().length !== 4) {
        return undefined;
      }
      text = text + " TYPE " + nodeText(procedure.file, name);
    }

    const fix = mergeEdits(procedure.file, [
      deleteStatement(procedure.file, variable.declaration!),
      EditHelper.replaceToken(procedure.file, write.token, text),
      deleteStatement(procedure.file, read.statement)]);
    const message = "Copy chain via " + variable.identifier.getName() + ", create the object in "
      + nodeText(procedure.file, use.target) + " directly";
    return Issue.atStatement(procedure.file, read.statement, message, this.getMetadata().key, this.conf.severity, fix);
  }
}
