import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IObject} from "../objects/_iobject";
import {Class} from "../objects";
import {InfoClassDefinition} from "../abap/4_file_information/_abap_file_information";
import {RuleTag} from "./_irule";

export class FunctionalWritingConf extends BasicRuleConfig {
  /** Ignore functional writing in exception classes, local + global */
  public ignoreExceptions: boolean = true;
}

export class FunctionalWriting extends ABAPRule {

  private conf = new FunctionalWritingConf();

  public getMetadata() {
    return {
      key: "functional_writing",
      title: "Use functional writing",
      shortDescription: `Detects usage of call method when functional style calls can be used.`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#prefer-functional-to-procedural-calls
https://docs.abapopenchecks.org/checks/07/`,
      tags: [RuleTag.Styleguide],
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

  public runParsed(file: ABAPFile, obj: IObject) {
    const issues: Issue[] = [];
    let exception = false;

    let definition: InfoClassDefinition | undefined = undefined;
    if (obj instanceof Class) {
      definition = obj.getClassDefinition();
    }

    for (const statement of file.getStatements()) {
      const code = statement.concatTokens().toUpperCase();

      if (statement.get() instanceof Statements.ClassImplementation
          && definition
          && definition.isException
          && this.conf.ignoreExceptions) {
        exception = true;
      } else if (statement.get() instanceof Statements.EndClass) {
        exception = false;
      } else if (exception === false && this.startsWith(code, "CALL METHOD ")) {
        const dynamic = statement.findDirectExpression(Expressions.MethodSource)?.findDirectExpression(Expressions.Dynamic);
        if (dynamic !== undefined) {
          continue;
        }

        const issue = Issue.atStatement(file, statement, this.getMessage(), this.getMetadata().key);
        issues.push(issue);
      }
    }

    return issues;
  }

  private startsWith(str: string, value: string): boolean {
    return str.substr(0, value.length) === value;
  }

}