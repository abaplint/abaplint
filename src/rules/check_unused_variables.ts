import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {Issue} from "..";
import {Data, Method, EndMethod, DataBegin, DataEnd, Constant} from "../abap/statements";
import {Token} from "../abap/tokens/_token";
import {Source, NamespaceSimpleName} from "../abap/expressions";
import {StatementNode} from "../abap/nodes";

export class CheckUnusedVariablesConf extends BasicRuleConfig {
  public checkConstants: boolean = true;
}
export class CheckUnusedVariables extends ABAPRule {

  private conf = new CheckUnusedVariablesConf();

  public getKey(): string {
    return "check_unused_variables";
  }

  private getDescription(variableName: string): string {
    return `Variable ${variableName} is never read.`;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CheckUnusedVariablesConf) {
    this.conf = conf;
  }

  // todo: missing inline data, field-symbols
  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    let variables: Token[] = [];
    let isInDataStructure: boolean = false;
    for (const stat of file.getStatements()) {
      if (stat.get() instanceof Method) {
        variables = [];
      } else if (stat.get() instanceof DataBegin) {
        isInDataStructure = true;
      } else if (stat.get() instanceof DataEnd) {
        isInDataStructure = false;
      } else if (!isInDataStructure && stat.get() instanceof Data && !this.containsPragmaNeeded(stat)) {
        const name = stat.findFirstExpression(NamespaceSimpleName);
        if (name) {
          console.log("Adding variable: " + name.getFirstToken().getStr());
          variables.push(name.getFirstToken());
        }
      } else if (this.conf.checkConstants && !isInDataStructure && stat.get() instanceof Constant && !this.containsPragmaNeeded(stat)) {
        const name = stat.findFirstExpression(NamespaceSimpleName);
        if (name) {
          variables.push(name.getFirstToken());
        }
      } else if (stat.get() instanceof EndMethod) {
        for (const variable of variables) {
          issues.push(Issue.atToken(file, variable, this.getDescription(variable.getStr()), this.getKey()));
        }
      } else {
        const sources = stat.findAllExpressions(Source);
        for (const source of sources) {
          variables = variables.filter((function (token) {
            return token.getStr() !== source.getFirstToken().getStr();
          }));
        }
      }
    }
    return issues;
  }

  private containsPragmaNeeded(statement: StatementNode): boolean {
    for (const t of statement.getPragmas()) {
      if (t.getStr().toUpperCase() === "##NEEDED") {
        return true;
      }
    }
    return false;
  }

}