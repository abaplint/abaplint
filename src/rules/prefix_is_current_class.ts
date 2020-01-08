import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import * as Structures from "../abap/structures";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ClassName, MethodCall} from "../abap/expressions";


/** Reports errors if the current class references itself with "current_class=>"
 *  https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#omit-the-self-reference-me-when-calling-an-instance-method
 */
export class PrefixIsCurrentClassConf extends BasicRuleConfig {
  /**
   * Checks usages of self references with 'me' when calling instance methods
   */
  public omitMeInstanceCalls: boolean = true;
}

export class PrefixIsCurrentClass extends ABAPRule {
  private conf = new PrefixIsCurrentClassConf();

  public getKey(): string {
    return "prefix_is_current_class";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: PrefixIsCurrentClassConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];
    const struc = file.getStructure();
    if (struc === undefined) {
      return [];
    }

    let classStructures = struc.findAllStructures(Structures.ClassImplementation);
    classStructures = classStructures.concat(struc.findAllStructures(Structures.ClassDefinition));
    const meAccess = "ME->";

    for (const c of classStructures) {
      const className = c.findFirstExpression(ClassName)!.getFirstToken().getStr().toUpperCase();
      const staticAccess = className + "=>";

      for (const s of c.findAllStatementNodes()) {
        if (s.concatTokensWithoutStringsAndComments().toUpperCase().includes(staticAccess)) {
          const tokenPos = s.findTokenSequencePosition(className, "=>");
          if (tokenPos) {
            issues.push(Issue.atPosition(
              file,
              tokenPos,
              "Reference to current class can be omitted: \"" + staticAccess + "\"",
              this.getKey()));
          }
        } else if (this.conf.omitMeInstanceCalls === true
            && s.concatTokensWithoutStringsAndComments().toUpperCase().includes(meAccess)
            && s.findFirstExpression(MethodCall)) {
          const tokenPos = s.findTokenSequencePosition("me", "->");
          if (tokenPos) {
            issues.push(Issue.atPosition(
              file,
              tokenPos,
              "Omit 'me->' in instance calls",
              this.getKey()));
          }
        }
      }
    }

    return issues;
  }

}
