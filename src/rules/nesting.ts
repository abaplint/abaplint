import {Issue} from "../issue";
import * as Statements from "../abap/statements";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";

/** Checks for methods exceeding a maximum nesting depth */
export class NestingConf extends BasicRuleConfig {
  /** Maximum allowed nesting depth */
  public depth: number = 5;
}

export class Nesting extends ABAPRule {

  private conf = new NestingConf();

  public getKey(): string {
    return "nesting";
  }

  public getDescription(max: string): string {
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
        const issue = new Issue({file, message: this.getDescription(this.conf.depth.toString()), key: this.getKey(), start: pos});
        issues.push(issue);
        break; // only one finding per file
      }
    }

    return issues;
  }

}