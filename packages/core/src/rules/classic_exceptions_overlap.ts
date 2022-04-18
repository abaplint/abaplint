import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Expressions from "../abap/2_statements/expressions";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class ClassicExceptionsOverlapConf extends BasicRuleConfig {
}

export class ClassicExceptionsOverlap extends ABAPRule {
  private conf = new ClassicExceptionsOverlapConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "classic_exceptions_overlap",
      title: "Classic exceptions overlap when catching",
      shortDescription: `Find overlapping classic exceptions`,
      extendedInformation: `When debugging its typically good to know exactly which exception is caught`,
      tags: [RuleTag.SingleFile],
      badExample: `  EXCEPTIONS
    system_failure        = 1 MESSAGE lv_message
    communication_failure = 1 MESSAGE lv_message
    resource_failure      = 1
    OTHERS                = 1.`,
      goodExample: `  EXCEPTIONS
    system_failure        = 1 MESSAGE lv_message
    communication_failure = 2 MESSAGE lv_message
    resource_failure      = 3
    OTHERS                = 4.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ClassicExceptionsOverlapConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const output: Issue[] = [];

    const struc = file.getStructure();
    if (struc === undefined) {
      return []; // syntax error
    }

    for (const p of struc.findAllExpressions(Expressions.ParameterListExceptions)) {
      const set = new Set<string>();
      for (const e of p.findAllExpressions(Expressions.ParameterException)) {
        const text = e.findDirectExpression(Expressions.SimpleName)?.concatTokens().toUpperCase();
        if (text === undefined) {
          continue;
        }
        if (set.has(text)) {
          const message = "Exception overlap, " + text;
          const issue = Issue.atToken(file, e.getFirstToken(), message, this.getMetadata().key, this.getConfig().severity);
          output.push(issue);
          break;
        }
        set.add(text);
      }
    }

    return output;
  }

}