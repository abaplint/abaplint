import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import * as Statements from "../abap/2_statements/statements";
import {RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Expressions, Tokens} from "..";

/**
 * By default, this rule only looks for assignments of variables to themselves. The remaining parts are opt-in.
 */
export class StrictAssignmentsConf extends BasicRuleConfig {
  /** Forbid assignment if value can be cut off, for example char length 20 to char length 10.
   * Mark the truncation explicitly by using CONV #( ) or str+offset(length) notation.
  */
  public preventLongerToShorter = true;
  /** Forbid assignment of a structured type to a simple type or vice-versa */
  public preventStructureToSimple = true;
}

/**
 * Forbids potentially problematic assignments between variables.
 */
export class StrictAssignments extends ABAPRule {

  private conf = new StrictAssignmentsConf();

  public getMetadata() {
    return {
      key: "strict_assignments",
      title: "Stricter Assignment Rules",
      shortDescription: `Forbids potentially problematic assignments between variables.`,
      tags: [RuleTag.Syntax, RuleTag.Experimental],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: StrictAssignmentsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const ret: Issue[] = [];
    const statements = file.getStatements();
    const checkOptionalRuleParts = this.conf &&
      (this.conf.preventLongerToShorter || this.conf.preventStructureToSimple);

    for (const statement of statements) {

      if (!(statement.get() instanceof Statements.Move)) {
        continue;
      }

      const tokens = statement.getTokens();
      if (tokens.length === 4
        && tokens[0] instanceof Tokens.Identifier
        && tokens[1].getStr() === "="
        && tokens[2] instanceof Tokens.Identifier) {
        if (tokens[0].getStr() === tokens[2].getStr()) {
          const message = `Variable ${tokens[0].getStr()} is assigned to itself.`;
          ret.push(Issue.atStatement(file, statement, message, this.getMetadata().key));
        }
      }

      const source = statement.findDirectExpression(Expressions.Source);
      const target = statement.findDirectExpression(Expressions.Target);

      if (checkOptionalRuleParts) {

        // todo
        // if source is fixed length, target must be shorter or equal
        if (this.conf.preventLongerToShorter && source === target) {
          const message = "Unsafe assignment between {source} and {target} - value can be truncated.";
          ret.push(Issue.atStatement(file, statement, message, this.getMetadata().key));
        }

        // todo
        // if source is a simple type, target must not be structured or vice-versa
        if (this.conf.preventStructureToSimple && source === target) {

          // if struct = str
          const message = "Suspicious assignment of structured type {struct} to simple type {str}. Perhaps you meant `structure-component = str` instead of `structure = str`?";
          ret.push(Issue.atStatement(file, statement, message, this.getMetadata().key));

          // if str = struct
          const message2 = "Suspicious assignment of simple type {str} to structured type {struct}. Perhaps you meant `str = structure-component` instead of `str = structure`?";
          ret.push(Issue.atStatement(file, statement, message2, this.getMetadata().key));
        }
      }
    }

    return ret;
  }
}