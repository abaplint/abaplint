import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {Issue} from "..";
import * as Statements from "../abap/statements";
import {StatementNode} from "../abap/nodes/statement_node";
import {Type, TypeTable} from "../abap/expressions";

/** Checks constants for full typing - no implicit typing allowed. */
export class FullyTypeConsantsConf extends BasicRuleConfig {
  /** Add check for implicit data definition, require full typing. */
  public checkData: boolean = true;
}

export class FullyTypeConstants extends ABAPRule {
  private conf = new FullyTypeConsantsConf();

  public getKey(): string {
    return "fully_type_constants";
  }

  public getDescription(type: string): string {
    return `Fully type ${type}, no implicit typing`;
  }

  public getConfig(): FullyTypeConsantsConf {
    return this.conf;
  }

  public setConfig(conf: FullyTypeConsantsConf): void {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];

    for (const stat of file.getStatements()) {
      if ((stat.get() instanceof Statements.Constant
        || (this.conf.checkData === true && stat.get() instanceof Statements.Data))
        && (!this.isTyped(stat))) {
        const type = stat.get() instanceof Statements.Constant ? "constant definition" : "data definition";
        issues.push(
          Issue.atStatement(
            file,
            stat,
            this.getDescription(type),
            this.getKey()));
      }
    }
    return issues;
  }

  private isTyped(stat: StatementNode) {
    return (stat.findFirstExpression(Type) || stat.findFirstExpression(TypeTable));
  }
}