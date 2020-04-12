import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {Issue} from "../issue";
import * as Statements from "../abap/2_statements/statements";
import {StatementNode} from "../abap/nodes/statement_node";
import {Type, TypeTable, NamespaceSimpleName} from "../abap/2_statements/expressions";

/** Checks constants for full typing - no implicit typing allowed. */
export class FullyTypeConsantsConf extends BasicRuleConfig {
  /** Add check for implicit data definition, require full typing. */
  public checkData: boolean = true;
}

export class FullyTypeConstants extends ABAPRule {
  private conf = new FullyTypeConsantsConf();

  public getMetadata() {
    return {key: "fully_type_constants"};
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

        const token = stat.findFirstExpression(NamespaceSimpleName)?.getFirstToken();
        if (token === undefined) {
          throw new Error("fully type constants, unexpected node");
        }

        issues.push(
          Issue.atToken(
            file,
            token,
            this.getDescription(type),
            this.getMetadata().key));
      }
    }
    return issues;
  }

  private isTyped(stat: StatementNode) {
    return (stat.findFirstExpression(Type) || stat.findFirstExpression(TypeTable));
  }
}