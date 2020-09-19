import {Issue} from "../issue";
import * as Statements from "../abap/2_statements/statements";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {RuleTag} from "./_irule";

export class NestingConf extends BasicRuleConfig {
  /** Maximum allowed nesting depth */
  public depth: number = 5;
}

export class Nesting extends ABAPRule {

  private conf = new NestingConf();

  public getMetadata() {
    return {
      key: "nesting",
      title: "Check nesting depth",
      shortDescription: `Checks for methods exceeding a maximum nesting depth`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#keep-the-nesting-depth-low
https://docs.abapopenchecks.org/checks/74/`,
      tags: [RuleTag.Styleguide],
    };
  }

  private getDescription(max: string): string {
    return "Reduce nesting depth to max " + max;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: NestingConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    let depth: number = 0;

    for (const statement of file.getStatements()) {
      const type = statement.get();

      if (type instanceof Statements.If
        || type instanceof Statements.Case
        || type instanceof Statements.While
        || type instanceof Statements.Loop
        || type instanceof Statements.SelectLoop
        || type instanceof Statements.Do
        || type instanceof Statements.Try) {
        depth = depth + 1;
      } else if (type instanceof Statements.EndIf
        || type instanceof Statements.EndCase
        || type instanceof Statements.EndWhile
        || type instanceof Statements.EndLoop
        || type instanceof Statements.EndSelect
        || type instanceof Statements.EndDo
        || type instanceof Statements.EndTry) {
        depth = depth - 1;
      }

      if (depth > this.conf.depth) {
        const pos = statement.getFirstToken().getStart();
        const issue = Issue.atPosition(
          file,
          pos,
          this.getDescription(this.conf.depth.toString()),
          this.getMetadata().key,
          this.conf.severity);
        issues.push(issue);
        break; // only one finding per file
      }
    }

    return issues;
  }

}