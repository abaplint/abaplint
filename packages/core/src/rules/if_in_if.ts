import {Issue} from "../issue";
import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject} from "../objects/_abap_object";
import {EditHelper, IEdit} from "../edit_helper";

export class IfInIfConf extends BasicRuleConfig {
}

export class IfInIf extends ABAPRule {

  private conf = new IfInIfConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "if_in_if",
      title: "IF in IF",
      shortDescription: `Detects nested ifs which can be refactored.`,
      extendedInformation: `
Directly nested IFs without ELSE can be refactored to a single condition using AND.

ELSE condtions with directly nested IF refactored to ELSEIF, quickfixes are suggested for this case.

https://docs.abapopenchecks.org/checks/01/
https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#keep-the-nesting-depth-low`,
      badExample: `IF condition1.
  IF condition2.
    ...
  ENDIF.
ENDIF.

IF condition1.
  ...
ELSE.
  IF condition2.
    ...
  ENDIF.
ENDIF.`,
      goodExample: `IF ( condition1 ) AND ( condition2 ).
  ...
ENDIF.

IF condition1.
  ...
ELSEIF condition2.
  ...
ENDIF.

CASE variable.
  WHEN value1.
  ...
  WHEN value2.
    IF condition2.
      ...
    ENDIF.
ENDCASE.`,
      tags: [RuleTag.Styleguide, RuleTag.SingleFile, RuleTag.Quickfix],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: IfInIfConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject) {
    const issues: Issue[] = [];

    if (obj.getType() === "INTF") {
      return [];
    }

    const stru = file.getStructure();
    if (stru === undefined) {
      return [];
    }

    let fixed = false;
    let possible = stru.findAllStructures(Structures.If);
    possible = possible.concat(stru.findAllStructures(Structures.Else));

    for (const i of possible) {
      if (i.findDirectStructures(Structures.ElseIf).length > 0
          || i.findDirectStructures(Structures.Else).length > 0) {
        continue;
      }

      const blist = i.findDirectStructures(Structures.Body);
      if (blist.length === 0) {
        continue;
      }

      const nlist = blist[0].findDirectStructures(Structures.Normal);
      if (nlist.length !== 1) {
        continue;
      }

      const niflist = nlist[0].findDirectStructures(Structures.If);
      if (niflist.length !== 1) {
        continue;
      }

      const nestedIf = niflist[0];
      if (i.get() instanceof Structures.If
          && (nestedIf.findDirectStructures(Structures.ElseIf).length > 0
          || nestedIf.findDirectStructures(Structures.Else).length > 0)) {
        continue;
      }

      let message = "IF in IF. Use IF cond1 AND cond2 instead";

      let fix: IEdit | undefined = undefined;
      if (i.get() instanceof Structures.Else) {
        message = "Change ELSE part to ELSEIF";
        const els = i.findFirstStatement(Statements.Else);
        const iff = i.findFirstStructure(Structures.If)?.findDirectStatement(Statements.If);
        const endif = i.findFirstStructure(Structures.If)?.findDirectStatement(Statements.EndIf);
        if (fixed === false && iff && els && endif) {
          const fix1 = EditHelper.deleteRange(file, els.getLastToken().getStart(), iff?.getFirstToken().getStart());
          const fix2 = EditHelper.deleteStatement(file, endif);
          fix = EditHelper.merge(fix1, fix2);
          // max one fix per file at a time
          fixed = true;
        }
      }

      const token = i.getFirstToken();
      const issue = Issue.atToken(file, token, message, this.getMetadata().key, this.conf.severity, fix);
      issues.push(issue);
    }

    return issues;
  }

}