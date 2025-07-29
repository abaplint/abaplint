/* eslint-disable max-len */
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class MixReturningConf extends BasicRuleConfig {
}

export class MixReturning extends ABAPRule {

  private conf = new MixReturningConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "mix_returning",
      title: "Mix of returning and exporting",
      shortDescription: `Checks that methods don't have a mixture of returning and exporting/changing parameters`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#use-either-returning-or-exporting-or-changing-but-not-a-combination

This syntax is not allowed on versions earlier than 740sp02, https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-us/abennews-740-abap_objects.htm#!ABAP_MODIFICATION_1@1@`,
      tags: [RuleTag.Styleguide, RuleTag.SingleFile, RuleTag.Syntax],
      badExample: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS
      foobar
        EXPORTING foo TYPE i
        RETURNING VALUE(rv_string) TYPE string.
ENDCLASS.`,
    };
  }

  private getMessage(): string {
    return "Don't mix RETURNING and EXPORTING/CHANGING parameters in a single method.";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: MixReturningConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const ret: Issue[] = [];
    const stru = file.getStructure();
    if (stru === undefined) {
      return [];
    }

    for (const def of stru.findAllStatements(Statements.MethodDef)) {
      if (!def.findFirstExpression(Expressions.MethodDefReturning)) {
        continue;
      }
      if (def.findFirstExpression(Expressions.MethodDefExporting)
          || def.findFirstExpression(Expressions.MethodDefChanging)) {
        const token = def.getFirstToken();
        const issue = Issue.atToken(file, token, this.getMessage(), this.getMetadata().key, this.conf.severity);
        ret.push(issue);
      }
    }

    return ret;
  }

}

