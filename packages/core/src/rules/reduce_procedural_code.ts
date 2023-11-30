import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {IRuleMetadata, RuleTag} from "./_irule";
import * as Statements from "../abap/2_statements/statements";
import {ABAPFile} from "../abap/abap_file";
import {Issue} from "../issue";
import {StatementNode} from "../abap/nodes";

export class ReduceProceduralCodeConf extends BasicRuleConfig {
  public maxStatements: number = 10;
}
export class ReduceProceduralCode extends ABAPRule {

  private conf = new ReduceProceduralCodeConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "reduce_procedural_code",
      title: "Reduce procedural code",
      shortDescription: `Checks FORM and FUNCTION-MODULE have few statements`,
      extendedInformation: `Delegate logic to a class method instead of using FORM or FUNCTION-MODULE.

Only one issue is reported per include/file.

https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#prefer-object-orientation-to-procedural-programming`,
      tags: [RuleTag.SingleFile, RuleTag.Styleguide],
      badExample: `FORM foo.
  DATA lv_bar TYPE i.
  lv_bar = 2 + 2.
  IF lv_bar = 4.
    WRITE 'hello world'.
  ENDIF.
  DATA lv_bar TYPE i.
  lv_bar = 2 + 2.
  IF lv_bar = 4.
    WRITE 'hello world'.
  ENDIF.
ENDFORM.`,
      goodExample: `FORM foo.
  NEW zcl_global_class( )->run_logic( ).
ENDFORM.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ReduceProceduralCodeConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    if (file.getStructure() === undefined) {
      // constains syntax errors, skip this check
      return issues;
    }

    let doCount: StatementNode | undefined = undefined;
    let count = 0;
    for (const statement of file.getStatements()) {
      if (statement.get() instanceof Statements.Form || statement.get() instanceof Statements.FunctionModule) {
        doCount = statement;
        count = 0;
      } else if (statement.get() instanceof Statements.EndForm || statement.get() instanceof Statements.EndFunction) {
        if (count >= this.conf.maxStatements && doCount !== undefined) {
          const message = "Reduce procedural code, max " + this.conf.maxStatements + " statements";
          const issue = Issue.atStatement(file, doCount, message, this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }
        doCount = undefined;
      } else if (doCount !== undefined) {
        count = count + 1;
      }
    }

    return issues;
  }

}