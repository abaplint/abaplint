import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import * as Statements from "../abap/2_statements/statements";
import {EditHelper} from "../edit_helper";
import {Comment} from "../abap/2_statements/statements/_statement";

export class UnnecessaryReturnConf extends BasicRuleConfig {
  /** Allow empty METHODs + FORMs + FUNCTION-MODULEs */
  public allowEmpty = false;
}

export class UnnecessaryReturn extends ABAPRule {
  private conf = new UnnecessaryReturnConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "unnecessary_return",
      title: "Unnecessary Return",
      shortDescription: `Finds unnecessary RETURN statements`,
      extendedInformation: `Finds unnecessary RETURN statements`,
      tags: [RuleTag.SingleFile, RuleTag.Quickfix],
      badExample: `FORM hello1.
  WRITE 'world'.
  RETURN.
ENDFORM.

FORM foo.
  IF 1 = 2.
    RETURN.
  ENDIF.
ENDFORM.`,
      goodExample: `FORM hello2.
  WRITE 'world'.
ENDFORM.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UnnecessaryReturnConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const structure = file.getStructure();
    if (structure === undefined) {
      return [];
    }

    const message = "Unnecessary RETURN";

    const statements = file.getStatements();
    let statementCounter = 0;

    for (let i = 0; i < statements.length; i++) {
      const node = statements[i];
      const nodeType = node.get();
      if ((nodeType instanceof Statements.MethodImplementation
          || nodeType instanceof Statements.Form
          || nodeType instanceof Statements.FunctionModule)) {
        statementCounter = 0;
        continue;
      }

      if (!(nodeType instanceof Comment)) {
        statementCounter++;
      }

      if (!(nodeType instanceof Statements.EndMethod
          || nodeType instanceof Statements.EndForm
          || nodeType instanceof Statements.EndFunction)) {
        continue;
      }

      const prev = statements[i - 1];
      if (prev && prev.get() instanceof Statements.Return) {
        if (this.conf.allowEmpty === true && statementCounter === 2) {
          continue;
        }

        const fix = EditHelper.deleteStatement(file, prev);
        issues.push(Issue.atStatement(file, prev, message, this.getMetadata().key, this.getConfig().severity, fix));
      }

      // note: ENDTRY is not checked, it will usually just make it an empty catch handler, which is also bad
      const prevprev = statements[i - 2];
      if (prev && prevprev
          && prevprev.get() instanceof Statements.Return
          && prev.get() instanceof Statements.EndIf) {
        const fix = EditHelper.deleteStatement(file, prevprev);
        issues.push(Issue.atStatement(file, prevprev, message, this.getMetadata().key, this.getConfig().severity, fix));
      }
    }

    return issues;
  }

}