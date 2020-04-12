import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import * as Statements from "../abap/2_statements/statements";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {IObject} from "../objects/_iobject";
import {Class} from "../objects";
import {IClassDefinition} from "../abap/types/_class_definition";

export class FunctionalWritingConf extends BasicRuleConfig {
  public ignoreExceptions: boolean = true;
}

export class FunctionalWriting extends ABAPRule {

  private conf = new FunctionalWritingConf();

  public getMetadata() {
    return {
      key: "functional_writing",
      title: "Use functional writing",
      quickfix: false,
      shortDescription: `Detects usage of call method when functional style calls can be used.`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#prefer-functional-to-procedural-calls
https://docs.abapopenchecks.org/checks/07/`,
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

  public runParsed(file: ABAPFile, _reg: IRegistry, obj: IObject) {
    const issues: Issue[] = [];
    let exception = false;

    let definition: IClassDefinition | undefined = undefined;
    if (obj instanceof Class) {
      definition = obj.getClassDefinition();
    }

    for (const statement of file.getStatements()) {
      const code = statement.concatTokens().toUpperCase();

      if (statement.get() instanceof Statements.ClassImplementation
          && definition
          && definition.isException()
          && this.conf.ignoreExceptions) {
        exception = true;
      } else if (statement.get() instanceof Statements.EndClass) {
        exception = false;
      } else if (exception === false && this.startsWith(code, "CALL METHOD ")) {
        if (/\)[=-]>/.test(code) === true
            || /[=-]>\(/.test(code) === true
            || this.startsWith(code, "CALL METHOD (")) {
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