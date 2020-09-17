import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Class} from "../objects";
import {InfoClassDefinition} from "../abap/4_file_information/_abap_file_information";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPObject} from "../objects/_abap_object";
import {DDIC} from "../ddic";

export class FunctionalWritingConf extends BasicRuleConfig {
  /** Ignore functional writing in exception classes, local + global */
  public ignoreExceptions: boolean = true;
}

export class FunctionalWriting extends ABAPRule {

  private conf = new FunctionalWritingConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "functional_writing",
      title: "Use functional writing",
      shortDescription: `Detects usage of call method when functional style calls can be used.`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#prefer-functional-to-procedural-calls
https://docs.abapopenchecks.org/checks/07/`,
      tags: [RuleTag.Styleguide],
      badExample: `CALL METHOD zcl_class=>method( ).`,
      goodExample: `zcl_class=>method( ).`,
    };
  }

  private getMessage(): string {
    return "Use functional writing style for method calls.";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: FunctionalWritingConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject): readonly Issue[] {
    const issues: Issue[] = [];
    let exception = false;

    let definition: InfoClassDefinition | undefined = undefined;
    if (obj instanceof Class) {
      definition = obj.getClassDefinition();
    }

    const ddic = new DDIC(this.reg);

    for (const statement of file.getStatements()) {
      if (statement.get() instanceof Statements.ClassImplementation
          && definition
          && ddic.isException(definition, obj)
          && this.conf.ignoreExceptions) {
        exception = true;
      } else if (statement.get() instanceof Statements.EndClass) {
        exception = false;
      } else if (exception === false && statement.get() instanceof Statements.Call) {
        if (statement.getFirstChild()?.get() instanceof Expressions.MethodCallChain) {
          continue;
        }

        const dynamic = statement.findDirectExpression(Expressions.MethodSource)?.findDirectExpression(Expressions.Dynamic);
        if (dynamic !== undefined) {
          continue;
        }

        const issue = Issue.atStatement(file, statement, this.getMessage(), this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }

    return issues;
  }

}