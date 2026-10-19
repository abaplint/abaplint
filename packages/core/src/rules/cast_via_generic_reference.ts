import * as Expressions from "../abap/2_statements/expressions";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {GenericObjectReferenceType, ObjectReferenceType} from "../abap/types/basic";
import {InterfaceDefinition} from "../abap/types/interface_definition";
import {EditHelper} from "../edit_helper";
import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {Hierarchy, ObjectAnalysis, dataSource, deleteStatement, mergeEdits, plainData, plainMove, singleField,
  singleTarget, targetType, unchangedBetween} from "./_procedure_analysis";

export class CastViaGenericReferenceConf extends BasicRuleConfig {
}

export class CastViaGenericReference implements IRule {
  private reg: IRegistry;
  private conf = new CastViaGenericReferenceConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "cast_via_generic_reference",
      title: "Cast via generic reference",
      shortDescription: `Finds a down cast from a local reference variable that only holds a copy of another reference`,
      extendedInformation: `Reports DATA o TYPE REF TO object. o = r. ... x ?= o. when all of the following hold:

* o is a local variable of a METHOD, FORM or FUNCTION, declared with DATA without VALUE and not chained,
  typed REF TO object, or REF TO a class or interface that is the static type of r or a supertype of it
* o has exactly one write, o = r., exactly one read, the complete source of x ?= o., and its address is never
  taken. x is not an inline declaration
* r is a plain object reference: a variable, or a chain of attributes and components without calls,
  offsets, table expressions, field symbols or ->*
* r keeps its value from o = r. until the read, as in unnecessary_copy: for a local r, no write to it and its
  address is never taken; for other r, in addition no method, function or form call and no write except to
  local variables, by value parameters and RETURNING in between
* o = r. is executed before x ?= o. on every path: the read is in the same block or a nested block, and both
  are in the same loop
* x ?= r. is valid: x or r is typed REF TO object or an interface, or the class of x and the class of r
  are in the same inheritance line

The object is the same, so the cast succeeds or raises cx_sy_move_cast_error the same way.
try_cast_empty_catch can then replace a TRY around the cast.
Objects with syntax errors, macros or unknown statements are skipped, as are procedures with dynamic code,
INCLUDE, test seams, enhancements or native SQL.

The quick fix deletes the declaration and o = r., and casts r directly. No release requirement.`,
      tags: [RuleTag.Quickfix],
      badExample: `DATA lo_object TYPE REF TO object.
lo_object = io_node.
TRY.
    lo_leaf ?= lo_object.
  CATCH cx_sy_move_cast_error.
ENDTRY.`,
      goodExample: `TRY.
    lo_leaf ?= io_node.
  CATCH cx_sy_move_cast_error.
ENDTRY.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CastViaGenericReferenceConf) {
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
      const hierarchy = new Hierarchy(this.reg, procedure);
      for (const variable of procedure.locals()) {
        const declaration = variable.declaration!;
        const type = variable.identifier.getType();
        const writes = variable.writes();
        const reads = variable.reads();
        if (variable.inline || !plainData(declaration) || declaration.getColon() !== undefined || variable.escapes()
            || !this.isObjectReference(type) || writes.length !== 1 || reads.length !== 1) {
          continue;
        }
        const write = writes[0];
        const read = reads[0];
        const assign = plainMove(write.statement);
        const cast = plainMove(read.statement);
        if (assign === undefined || cast === undefined || assign.operator !== "=" || cast.operator !== "?="
            || singleTarget(assign.target)?.getStart().equals(write.token.getStart()) !== true
            || singleField(cast.source)?.getStart().equals(read.token.getStart()) !== true
            || cast.target.findFirstExpression(Expressions.InlineData) !== undefined
            || !procedure.dominates(write.statement, read.statement)
            || !procedure.sameLoop(write.statement, read.statement)) {
          continue;
        }
        const source = dataSource(procedure, assign.source);
        const target = targetType(procedure, cast.target);
        if (source === undefined || source.base === variable || target === undefined
            || !this.isObjectReference(source.type)
            || !this.isSupertype(hierarchy, type, source.type)
            || !this.castable(hierarchy, source.type, target)
            || !unchangedBetween(procedure, source, write.statement, read.statement, read.token)) {
          continue;
        }

        const fix = mergeEdits(procedure.file, [
          deleteStatement(procedure.file, declaration),
          deleteStatement(procedure.file, write.statement),
          EditHelper.replaceToken(procedure.file, read.token, source.text)]);
        const message = "Cast " + source.text + " directly instead of via " + variable.identifier.getName();
        issues.push(Issue.atStatement(procedure.file, read.statement, message, this.getMetadata().key, this.conf.severity, fix));
      }
    }
    return issues;
  }

  private isObjectReference(type: AbstractType): boolean {
    return type instanceof GenericObjectReferenceType || type instanceof ObjectReferenceType;
  }

  /** every reference of type sub can be assigned to type sup without a cast */
  private isSupertype(hierarchy: Hierarchy, sup: AbstractType, sub: AbstractType): boolean {
    if (sup instanceof GenericObjectReferenceType) {
      return true;
    } else if (!(sup instanceof ObjectReferenceType) || !(sub instanceof ObjectReferenceType)) {
      return false;
    }
    return hierarchy.isSubtype(sub.getIdentifierName(), sup.getIdentifierName());
  }

  /** target ?= source. is statically valid */
  private castable(hierarchy: Hierarchy, source: AbstractType, target: AbstractType): boolean {
    if (source instanceof GenericObjectReferenceType || target instanceof GenericObjectReferenceType) {
      return true;
    } else if (!(source instanceof ObjectReferenceType) || !(target instanceof ObjectReferenceType)) {
      return false;
    }
    const sourceDefinition = hierarchy.definition(source);
    const targetDefinition = hierarchy.definition(target);
    if (sourceDefinition === undefined || targetDefinition === undefined) {
      return false;
    } else if (sourceDefinition instanceof InterfaceDefinition || targetDefinition instanceof InterfaceDefinition) {
      return true;
    }
    return hierarchy.isSubtype(source.getIdentifierName(), target.getIdentifierName())
      || hierarchy.isSubtype(target.getIdentifierName(), source.getIdentifierName());
  }
}
