import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import * as Structures from "../abap/3_structures/structures";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ClassName, MethodCall, InterfaceName, TypeName} from "../abap/2_statements/expressions";
import {Position} from "../position";
import {EditHelper} from "../edit_helper";
import {RuleTag} from "./_irule";

export class PrefixIsCurrentClassConf extends BasicRuleConfig {
  /**
   * Checks usages of self references with 'me' when calling instance methods
   */
  public omitMeInstanceCalls: boolean = true;
}

export class PrefixIsCurrentClass extends ABAPRule {
  private conf = new PrefixIsCurrentClassConf();

  public getMetadata() {
    return {
      key: "prefix_is_current_class",
      title: "Prefix is current class",
      shortDescription: `Reports errors if the current class or interface references itself with "current_class=>"`,
      // eslint-disable-next-line max-len
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#omit-the-self-reference-me-when-calling-an-instance-method`,
      tags: [RuleTag.Styleguide, RuleTag.Quickfix],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: PrefixIsCurrentClassConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    return this.checkClasses(file).concat(this.checkInterfaces(file));
  }

  private checkInterfaces(file: ABAPFile): Issue[] {
    const struc = file.getStructure();
    if (struc === undefined) {
      return [];
    }

    const issues: Issue[] = [];

    for (const s of struc.findDirectStructures(Structures.Interface)) {
      const name = s.findFirstExpression(InterfaceName)?.getFirstToken().getStr().toUpperCase();
      if (name === undefined) {
        continue;
      }

      for (const e of s.findAllExpressions(TypeName)) {
        if (e.concatTokens().toUpperCase().startsWith(name + "=>")) {
          issues.push(Issue.atToken(
            file,
            e.getFirstToken(),
            "Reference to current interface can be omitted",
            this.getMetadata().key,
            this.conf.severity));
        }
      }

    }

    return issues;
  }

  private checkClasses(file: ABAPFile): Issue[] {
    const struc = file.getStructure();
    if (struc === undefined) {
      return [];
    }

    const issues: Issue[] = [];
    let classStructures = struc.findDirectStructures(Structures.ClassImplementation);
    classStructures = classStructures.concat(struc.findDirectStructures(Structures.ClassDefinition));
    const meAccess = "ME->";

    for (const c of classStructures) {
      const className = c.findFirstExpression(ClassName)!.getFirstToken().getStr().toUpperCase();
      const staticAccess = className + "=>";

      for (const s of c.findAllStatementNodes()) {
        if (s.concatTokensWithoutStringsAndComments().toUpperCase().includes(staticAccess)) {
          const tokenPos = s.findTokenSequencePosition(className, "=>");
          if (tokenPos) {
            const end = new Position(tokenPos.getRow(), tokenPos.getCol() + className.length + 2);
            const fix = EditHelper.deleteRange(file, tokenPos, end);
            issues.push(Issue.atRange(
              file,
              tokenPos, end,
              "Reference to current class can be omitted: \"" + staticAccess + "\"",
              this.getMetadata().key,
              this.conf.severity,
              fix));
          }
        } else if (this.conf.omitMeInstanceCalls === true
            && s.concatTokensWithoutStringsAndComments().toUpperCase().includes(meAccess)
            && s.findFirstExpression(MethodCall)) {
          const tokenPos = s.findTokenSequencePosition("me", "->");
          if (tokenPos) {
            const end = new Position(tokenPos.getRow(), tokenPos.getCol() + 4);
            const fix = EditHelper.deleteRange(file, tokenPos, end);
            issues.push(Issue.atRange(
              file,
              tokenPos, end,
              "Omit 'me->' in instance calls",
              this.getMetadata().key, this.conf.severity, fix));
          }
        }
      }
    }
    return issues;
  }
}