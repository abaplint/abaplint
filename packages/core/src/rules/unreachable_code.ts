import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IStatement, Comment, MacroContent, Empty} from "../abap/2_statements/statements/_statement";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {StatementNode} from "../abap/nodes";
import {IRuleMetadata} from "./_irule";

export class UnreachableCodeConf extends BasicRuleConfig {
}

export class UnreachableCode extends ABAPRule {
  private conf = new UnreachableCodeConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "unreachable_code",
      title: "Unreachable code",
      shortDescription: `Checks for unreachable code.`,
      badExample: `RETURN.\nWRITE 'hello'.`,
      goodExample: `WRITE 'hello'.\nRETURN.`,
    };
  }

  private getMessage(): string {
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
          || node.get() instanceof MacroContent
          || node.get() instanceof Empty) {
        continue;
      } else if (this.isExit(node)) {
        exit = true;
        continue;
      } else if (this.isStructure(node.get())) {
        exit = false;
        continue;
      }
      if (exit === true) {
        const token = node.getFirstToken();
        const issue = Issue.atToken(file, token, this.getMessage(), this.getMetadata().key, this.conf.severity);
        output.push(issue);
      }
    }

    return output;
  }

  private isExit(n: StatementNode): boolean {
    const s = n.get();
    // todo, RESUMABLE exception
    if (s instanceof Statements.Submit && n.findFirstExpression(Expressions.AndReturn) === undefined) {
      return true;
    } else if (s instanceof Statements.Leave && n.findFirstExpression(Expressions.AndReturn) === undefined) {
      return true;
    } else if (s instanceof Statements.Return
        || s instanceof Statements.Continue
        || s instanceof Statements.Exit
        || s instanceof Statements.Raise) {
      return true;
    }
    return false;
  }

  private isStructure(s: IStatement): boolean {
    if (s instanceof Statements.EndIf
        || s instanceof Statements.Else
        || s instanceof Statements.EndLoop
        || s instanceof Statements.EndTry
        || s instanceof Statements.EndMethod
        || s instanceof Statements.EndModule
        || s instanceof Statements.EndForm
        || s instanceof Statements.EndAt
        || s instanceof Statements.EndSelect
        || s instanceof Statements.AtSelectionScreen
        || s instanceof Statements.EndFunction
        || s instanceof Statements.EndCase
        || s instanceof Statements.EndWhile
        || s instanceof Statements.EndDo
        || s instanceof Statements.Cleanup
        || s instanceof Statements.When
        || s instanceof Statements.WhenOthers
        || s instanceof Statements.WhenType
        || s instanceof Statements.Catch
        || s instanceof Statements.ElseIf) {
      return true;
    }
    return false;
  }

}
