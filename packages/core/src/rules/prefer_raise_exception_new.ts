import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class PreferRaiseExceptionNewConf extends BasicRuleConfig {
}

export class PreferRaiseExceptionNew extends ABAPRule {

  private conf = new PreferRaiseExceptionNewConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "prefer_raise_exception_new",
      title: "Prefer RAISE EXCEPTION NEW to RAISE EXCEPTION TYPE",
      shortDescription: `Prefer RAISE EXCEPTION NEW to RAISE EXCEPTION TYPE`,
      extendedInformation: `
      https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#prefer-raise-exception-new-to-raise-exception-type`,
      tags: [RuleTag.Styleguide, RuleTag.SingleFile],
      goodExample: `RAISE EXCEPTION NEW cx_generation_error( previous = exception ).`,
      badExample: `RAISE EXCEPTION TYPE cx_generation_error
      EXPORTING
        previous = exception.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: PreferRaiseExceptionNewConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];

    for (const statement of file.getStatements()) {
      if (statement.concatTokens().toString().toUpperCase().startsWith("RAISE EXCEPTION TYPE ")) {
        const message = "Prefer RAISE EXCEPTION NEW to RAISE EXCEPTION TYPE";

        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }
}
