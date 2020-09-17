import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {Issue} from "../issue";
import * as Statements from "../abap/2_statements/statements";
import {StatementNode} from "../abap/nodes/statement_node";
import {Type, TypeTable, NamespaceSimpleName, DefinitionName} from "../abap/2_statements/expressions";
import {IRuleMetadata} from "./_irule";

export class FullyTypeConsantsConf extends BasicRuleConfig {
  /** Add check for implicit data definition, require full typing. */
  public checkData: boolean = true;
}

export class FullyTypeConstants extends ABAPRule {
  private conf = new FullyTypeConsantsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "fully_type_constants",
      title: "Fully type constants",
      shortDescription: `Checks constants for full typing - no implicit typing allowed.`,
      badExample: "CONSTANTS foo VALUE 'a'.",
      goodExample: "CONSTANTS foo TYPE c LENGTH 1 VALUE 'a'.",
    };
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

        let token = stat.findFirstExpression(NamespaceSimpleName)?.getFirstToken();
        if (token === undefined) {
          token = stat.findFirstExpression(DefinitionName)?.getFirstToken();
        }
        if (token === undefined) {
          throw new Error("fully type constants, unexpected node");
        }

        issues.push(
          Issue.atToken(
            file,
            token,
            this.getDescription(type),
            this.getMetadata().key,
            this.conf.severity));
      }
    }
    return issues;
  }

  private isTyped(stat: StatementNode) {
    return (stat.findFirstExpression(Type) || stat.findFirstExpression(TypeTable));
  }
}