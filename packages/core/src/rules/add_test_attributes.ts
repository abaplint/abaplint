import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class AddTestAttributesConf extends BasicRuleConfig {
}

export class AddTestAttributes extends ABAPRule {

  private conf = new AddTestAttributesConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "add_test_attributes",
      title: "Add test attributes for tests classes with test methods",
      shortDescription: `Add test attributes DURATION and RISK LEVEL for tests classes with test methods`,
      tags: [RuleTag.SingleFile],
      badExample: `CLASS ltcl_test DEFINITION FINAL FOR TESTING.
  PUBLIC SECTION.
  PROTECTED SECTION.
  PRIVATE SECTION.
    METHODS test FOR TESTING RAISING cx_static_check.
ENDCLASS.

CLASS ltcl_test IMPLEMENTATION.
  METHOD test.
  ENDMETHOD.
ENDCLASS.`,
      goodExample: `CLASS ltcl_test DEFINITION FINAL FOR TESTING DURATION SHORT RISK LEVEL HARMLESS.
  PUBLIC SECTION.
  PROTECTED SECTION.
  PRIVATE SECTION.
    METHODS test FOR TESTING RAISING cx_static_check.
ENDCLASS.

CLASS ltcl_test IMPLEMENTATION.
  METHOD test.
  ENDMETHOD.
ENDCLASS.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: AddTestAttributesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return [];
    }

    for (const classStructure of stru.findAllStructures(Structures.ClassDefinition)) {
      const cdef = classStructure.findFirstStatement(Statements.ClassDefinition);
      if (cdef === undefined) {
        continue;
      }

      const cdefConcat = cdef?.concatTokens().toUpperCase();
      if (cdefConcat?.includes(" FOR TESTING") === false) {
        continue;
      }

      const hasDuration = cdefConcat?.includes(" DURATION ");
      const hasRiskLevel = cdefConcat?.includes(" RISK LEVEL ");
      if (hasDuration === true && hasRiskLevel === true) {
        continue;
      }

      let hasTestMethod = false;
      for (const mdef of classStructure.findAllStatements(Statements.MethodDef)) {
        const concat = mdef.concatTokens().toUpperCase();
        if (concat.includes(" FOR TESTING")) {
          hasTestMethod = true;
        }
      }

      if (hasTestMethod === false) {
        continue;
      }

      if (hasDuration === false) {
        issues.push(Issue.atStatement(file, cdef, "Add DURATION", this.getMetadata().key, this.getConfig().severity));
      }
      if (hasRiskLevel === false) {
        issues.push(Issue.atStatement(file, cdef, "Add RISK LEVEL", this.getMetadata().key, this.getConfig().severity));
      }
    }

    return issues;
  }

}
