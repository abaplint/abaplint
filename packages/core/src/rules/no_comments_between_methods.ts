import * as Statements from "../abap/2_statements/statements";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IObject} from "../objects/_iobject";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {Class} from "../objects";
import {Comment} from "../abap/2_statements/statements/_statement";

export class NoCommentsBetweenMethodsConf extends BasicRuleConfig {
}

export class NoCommentsBetweenMethods extends ABAPRule {

  private conf = new NoCommentsBetweenMethodsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "no_comments_between_methods",
      title: "No comments between methods in global classes",
      shortDescription: `Its not possible to have comments between methods in global classes.`,
      tags: [RuleTag.SingleFile, RuleTag.Syntax],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: NoCommentsBetweenMethodsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: IObject) {
    const issues: Issue[] = [];

    if (!(obj instanceof Class)) {
      return [];
    } else if (file !== obj.getMainABAPFile()) {
      return [];
    }

    let inMethod = false;
    let inClassImpl = false;
    for (const statement of file.getStatements()) {
      const statementType = statement.get();
      if (statementType instanceof Statements.ClassImplementation) {
        inClassImpl = true;
      } else if (statementType instanceof Statements.EndClass) {
        inClassImpl = false;
      } else if (statementType instanceof Statements.MethodImplementation) {
        inMethod = true;
      } else if (statementType instanceof Statements.EndMethod) {
        inMethod = false;
      } else if (inClassImpl === true && inMethod === false && statementType instanceof Comment) {
        issues.push(Issue.atStatement(file, statement, "Comment between methods in global class implementation", this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

}