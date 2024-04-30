import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {IRuleMetadata, RuleTag} from "./_irule";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {ABAPFile} from "../abap/abap_file";
import {Issue} from "../issue";

export class UseClassBasedExceptionsConf extends BasicRuleConfig {
}
export class UseClassBasedExceptions extends ABAPRule {

  private conf = new UseClassBasedExceptionsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "use_class_based_exceptions",
      title: "Use class based exceptions",
      shortDescription: `Use class based exceptions, checks interface and class definitions`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#use-class-based-exceptions`,
      tags: [RuleTag.Styleguide, RuleTag.SingleFile],
      badExample: `INTERFACE lif.
  METHODS load_data
    EXCEPTIONS
      invalid_parameter.
ENDINTERFACE.`,
      goodExample: `INTERFACE lif.
  METHODS load_data
    RAISING
      cx_something.
ENDINTERFACE.`,
    };
  }

  private getMessage(): string {
    return "Use class based exceptions";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UseClassBasedExceptionsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const s of file.getStructure()?.findAllStatements(Statements.MethodDef) || []) {
      if (s.findDirectExpression(Expressions.MethodDefExceptions)) {
        issues.push(Issue.atStatement(file, s, this.getMessage(), this.getMetadata().key));
      }
    }
    return issues;
  }

}