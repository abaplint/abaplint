import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Statement, Comment, MacroContent} from "../abap/statements/_statement";
import * as Statements from "../abap/statements/";

export class UnreachableCodeConf extends BasicRuleConfig {
}

export class UnreachableCode extends ABAPRule {
  private conf = new UnreachableCodeConf();

  public getKey(): string {
    return "unreachable_code";
  }

  public getDescription(): string {
    return "Unreachable code";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UnreachableCodeConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const output: Issue[] = [];
    let exit = false;

    for (const node of file.getStatements()) {
      if (node.get() instanceof Comment
          || node.get() instanceof MacroContent) {
        continue;
      } else if (this.isExit(node.get())) {
        exit = true;
        continue;
      } else if (this.isStructure(node.get())) {
        exit = false;
        continue;
      }
      if (exit === true) {
        output.push(new Issue({file, message: this.getDescription(), key: this.getKey(), start: node.getFirstToken().getPos()}));
      }
    }

    return output;
  }

  private isExit(s: Statement): boolean {
    // todo, RESUMABLE exception, AND RETURN
    if (s instanceof Statements.Return
        || s instanceof Statements.Continue
        || s instanceof Statements.Exit
        || s instanceof Statements.Leave
        || s instanceof Statements.Submit
        || s instanceof Statements.Raise) {
      return true;
    }
    return false;
  }

  private isStructure(s: Statement): boolean {
    if (s instanceof Statements.EndIf
        || s instanceof Statements.Else
        || s instanceof Statements.EndLoop
        || s instanceof Statements.EndTry
        || s instanceof Statements.EndMethod
        || s instanceof Statements.EndCase
        || s instanceof Statements.EndWhile
        || s instanceof Statements.EndDo
        || s instanceof Statements.When
        || s instanceof Statements.Catch
        || s instanceof Statements.ElseIf) {
      return true;
    }
    return false;
  }

}
