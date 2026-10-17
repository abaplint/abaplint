import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {ExpressionNode, StatementNode} from "../abap/nodes";
import {CharacterType} from "../abap/types/basic";
import {EditHelper, IEdit} from "../edit_helper";
import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {LanguageVersion, Release, releaseAtLeast} from "../version";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {ObjectAnalysis, OccurrenceKind, Procedure, characterConstant, deleteStatement, ifBranches,
  mergeEdits, nodeText, plainData, plainMove, sameCharacters, singleTarget} from "./_procedure_analysis";

export class BooleanFlagViaIfConf extends BasicRuleConfig {
}

export class BooleanFlagViaIf implements IRule {
  private reg: IRegistry;
  private conf = new BooleanFlagViaIfConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "boolean_flag_via_if",
      title: "Boolean flag via IF",
      shortDescription: `Finds a flag that is initialized to false and set to true in a single IF, use xsdbool`,
      extendedInformation: `Reports DATA(f) = VALUE abap_bool( )., DATA(f) = abap_false. or DATA f TYPE abap_bool.,
later followed by IF cond. f = abap_true. ENDIF., when all of the following hold:

* f is a local variable of a METHOD, FORM or FUNCTION, of type c LENGTH 1, its address is never taken
* the IF has no ELSEIF and no ELSE, its only statement is f = abap_true. and it contains no comments
* f has no other write, and is not read before the IF
* the IF is in the same block and the same loop as the declaration; DATA f TYPE abap_bool. is not
  executed per loop iteration, so neither it nor the IF may be in a loop

Requires xsdbool, ie. 7.40 SP08 or above, ABAP Cloud or open-abap.
Objects with syntax errors, macros or unknown statements are skipped, as are procedures with dynamic code,
INCLUDE, test seams, enhancements or native SQL.

The quick fix deletes an inline declaration and replaces the IF with DATA(f) = xsdbool( cond ).,
or keeps DATA f TYPE abap_bool. and replaces the IF with f = xsdbool( cond ).

use_bool_expression covers IF with an ELSE branch, without looking at the declaration and the other uses.`,
      tags: [RuleTag.Quickfix],
      badExample: `DATA(lv_found) = abap_false.
IF line_exists( lt_rows[ id = lv_id ] ).
  lv_found = abap_true.
ENDIF.`,
      goodExample: `DATA(lv_found) = xsdbool( line_exists( lt_rows[ id = lv_id ] ) ).`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: BooleanFlagViaIfConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): readonly Issue[] {
    const config = this.reg.getConfig();
    if (!releaseAtLeast(config.getRelease(), Release.v740sp08)
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
      for (const variable of procedure.locals()) {
        const declaration = variable.declaration!;
        const type = variable.identifier.getType();
        const writes = variable.writes();
        if (!(type instanceof CharacterType) || type.getLength() !== 1 || variable.escapes()
            || writes.length !== 1 || !this.initiallyFalse(procedure, variable.inline, declaration)) {
          continue;
        }
        const write = writes[0];
        const move = plainMove(write.statement);
        const value = move === undefined ? undefined : characterConstant(procedure, move.source);
        const check = procedure.statements[write.index - 1];
        const structure = procedure.ifStructure(check);
        const branches = structure === undefined ? undefined : ifBranches(structure);
        const endIf = structure?.findDirectStatement(Statements.EndIf);
        if (move === undefined || move.operator !== "=" || value === undefined || !sameCharacters(value, "X")
            || singleTarget(move.target)?.getStart().equals(write.token.getStart()) !== true
            || !(check?.get() instanceof Statements.If) || check.getColon() !== undefined
            || structure === undefined || endIf === undefined || branches?.length !== 1
            || branches[0].body?.findAllStatementNodes().length !== 1
            || procedure.block(check) !== procedure.block(declaration)
            || !procedure.sameLoop(check, declaration)
            || (!variable.inline && (procedure.loop(check) !== undefined || procedure.loop(declaration) !== undefined))
            || variable.occurrences.some(o => o.kind === OccurrenceKind.Read && o.index <= procedure.index(endIf))
            || procedure.hasComment(check.getStart(), endIf.getEnd())) {
          continue;
        }
        const cond = check.findDirectExpression(Expressions.Cond);
        if (cond === undefined) {
          continue;
        }

        const name = write.token.getStr();
        const assignment = (variable.inline ? "DATA(" + name + ")" : name) + " = xsdbool( " + nodeText(procedure.file, cond) + " ).";
        const edits: IEdit[] = [EditHelper.replaceRange(procedure.file, check.getStart(), endIf.getEnd(), assignment)];
        if (variable.inline) {
          edits.push(deleteStatement(procedure.file, declaration));
        }
        const fix = mergeEdits(procedure.file, edits);
        issues.push(Issue.atStatement(procedure.file, check, "Use xsdbool to set " + name,
                                      this.getMetadata().key, this.conf.severity, fix));
      }
    }
    return issues;
  }

  /** DATA(f) = VALUE abap_bool( ). DATA(f) = abap_false. or DATA f TYPE abap_bool. */
  private initiallyFalse(procedure: Procedure, inline: boolean, declaration: StatementNode): boolean {
    if (inline === false) {
      return plainData(declaration) && declaration.getColon() === undefined;
    }
    const move = plainMove(declaration);
    if (move === undefined || move.operator !== "=" || move.target.getChildren().length !== 1
        || move.target.findDirectExpression(Expressions.InlineData) === undefined) {
      return false;
    }
    const constant = characterConstant(procedure, move.source);
    return (constant !== undefined && sameCharacters(constant, "")) || this.initialValue(move.source);
  }

  /** VALUE type( ) */
  private initialValue(source: ExpressionNode): boolean {
    const tokens = source.getTokens();
    return tokens.length === 4 && tokens[0].getStr().toUpperCase() === "VALUE"
      && source.findDirectExpression(Expressions.TypeNameOrInfer) !== undefined
      && tokens[1].getStr() !== "#" && tokens[2].getStr() === "(" && tokens[3].getStr() === ")";
  }
}
