import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {StatementNode, StructureNode} from "../abap/nodes";
import {ObjectReferenceType} from "../abap/types/basic";
import {EditHelper} from "../edit_helper";
import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {LanguageVersion, Release, releaseAtLeast} from "../version";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {ObjectAnalysis, Procedure, dataSource, deleteStatement, mergeEdits, plainMove, targetType} from "./_procedure_analysis";

export class TryCastEmptyCatchConf extends BasicRuleConfig {
}

export class TryCastEmptyCatch implements IRule {
  private reg: IRegistry;
  private conf = new TryCastEmptyCatchConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "try_cast_empty_catch",
      title: "TRY around cast with empty CATCH",
      shortDescription: `Finds a down cast in TRY with an empty CATCH cx_sy_move_cast_error, use IS INSTANCE OF`,
      extendedInformation: `Reports TRY. a ?= b. CATCH cx_sy_move_cast_error. ENDTRY. when all of the following hold:

* the cast is the only statement of the TRY block, there is exactly one CATCH, for cx_sy_move_cast_error only,
  without INTO or BEFORE UNWIND, its block is empty, and there is no CLEANUP
* the static type of a is a class or interface, not a generic REF TO object
* b is a plain data object: variable, attribute or a chain of components and attributes, without calls,
  so evaluating it again has no side effects

a ?= b. also succeeds when b is initial, and then clears a, while b IS INSTANCE OF is false for an initial b,
so the quick fix replaces the TRY with IF b IS INSTANCE OF <type of a> OR b IS INITIAL. a ?= b. ENDIF.

Requires IS INSTANCE OF, ie. 7.50 or above, ABAP Cloud or open-abap.
Objects with syntax errors, macros or unknown statements are skipped, as are procedures with dynamic code,
INCLUDE, test seams, enhancements or native SQL.`,
      tags: [RuleTag.Styleguide, RuleTag.Quickfix, RuleTag.SingleFile],
      badExample: `TRY.
    lo_node ?= io_object.
  CATCH cx_sy_move_cast_error.
ENDTRY.`,
      goodExample: `IF io_object IS INSTANCE OF zcl_node OR io_object IS INITIAL.
  lo_node ?= io_object.
ENDIF.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: TryCastEmptyCatchConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): readonly Issue[] {
    const config = this.reg.getConfig();
    if (!releaseAtLeast(config.getRelease(), Release.v750)
        && config.getLanguageVersion() !== LanguageVersion.Cloud
        && !config.isOpenABAP()) {
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
      for (const structure of procedure.structure.findAllStructuresRecursive(Structures.Try)) {
        this.check(procedure, structure, issues);
      }
    }
    return issues;
  }

  private check(procedure: Procedure, structure: StructureNode, issues: Issue[]) {
    const children = structure.getChildren();
    const tryStatement = children[0];
    const body = children[1];
    const catchStructure = children[2];
    const endTry = children[3];
    if (children.length !== 4
        || !(tryStatement instanceof StatementNode) || tryStatement.getColon() !== undefined
        || !(body instanceof StructureNode) || !(body.get() instanceof Structures.Body)
        || !(catchStructure instanceof StructureNode) || !(catchStructure.get() instanceof Structures.Catch)
        || !(endTry instanceof StatementNode) || !(endTry.get() instanceof Statements.EndTry)
        || endTry.getColon() !== undefined) {
      return;
    }
    const statements = body.findAllStatementNodes();
    const catchStatements = catchStructure.findAllStatementNodes();
    const catchStatement = catchStatements[0];
    const tokens = catchStatement?.getTokens().map(t => t.getStr().toUpperCase());
    if (statements.length !== 1 || catchStatements.length !== 1 || catchStatement.getColon() !== undefined
        || tokens?.join(" ") !== "CATCH CX_SY_MOVE_CAST_ERROR .") {
      return;
    }
    const cast = statements[0];
    const move = plainMove(cast);
    const target = move === undefined ? undefined : targetType(procedure, move.target);
    const source = move === undefined ? undefined : dataSource(procedure, move.source);
    if (move === undefined || move.operator !== "?=" || source === undefined
        || !(target instanceof ObjectReferenceType)
        || target.getIdentifierName().toUpperCase() === "OBJECT"
        || procedure.hasComment(tryStatement.getStart(), endTry.getEnd())) {
      return;
    }

    const condition = "IF " + source.text + " IS INSTANCE OF " + target.getIdentifierName()
      + " OR " + source.text + " IS INITIAL.";
    const fix = mergeEdits(procedure.file, [
      EditHelper.replaceRange(procedure.file, tryStatement.getStart(), tryStatement.getEnd(), condition),
      deleteStatement(procedure.file, catchStatement),
      EditHelper.replaceToken(procedure.file, endTry.getFirstToken(), "ENDIF")]);
    const message = "Check with IS INSTANCE OF instead of catching cx_sy_move_cast_error";
    issues.push(Issue.atStatement(procedure.file, tryStatement, message, this.getMetadata().key, this.conf.severity, fix));
  }
}
