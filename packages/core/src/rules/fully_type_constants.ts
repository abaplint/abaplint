import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {Issue} from "../issue";
import * as Statements from "../abap/2_statements/statements";
import {StatementNode} from "../abap/nodes/statement_node";
import {Type, TypeTable, NamespaceSimpleName, DefinitionName, ConstantFieldLength} from "../abap/2_statements/expressions";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class FullyTypeConsantsConf extends BasicRuleConfig {
  /** Add check for implicit data definition, require full typing. */
  public checkData: boolean = true;
  /** Check that the LENGTH keyword is used instead of the obsolete field length in parentheses. */
  public checkLength: boolean = true;
}

export class FullyTypeConstants extends ABAPRule {
  private conf = new FullyTypeConsantsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "fully_type_constants",
      title: "Fully type constants and data",
      shortDescription: `Checks constants, data and types for full typing - no implicit typing allowed.
Also checks that the LENGTH keyword is used instead of the obsolete field length in parentheses.`,
      badExample: `CONSTANTS foo VALUE 'a'.
DATA bar(1) TYPE c.
TYPES moo(1) TYPE c.`,
      goodExample: `CONSTANTS foo TYPE c LENGTH 1 VALUE 'a'.
DATA bar TYPE c LENGTH 1.
TYPES moo TYPE c LENGTH 1.`,
      tags: [RuleTag.SingleFile],
    };
  }

  private getDescription(type: string): string {
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
          && !this.isTyped(stat)) {
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

      if (this.conf.checkLength === true && this.isDefinition(stat)) {
        for (const l of stat.findAllExpressions(ConstantFieldLength)) {
          issues.push(
            Issue.atToken(
              file,
              l.getFirstToken(),
              "Use the LENGTH keyword instead of the field length in parentheses",
              this.getMetadata().key,
              this.conf.severity));
        }
      }
    }
    return issues;
  }

  private isDefinition(stat: StatementNode): boolean {
    const g = stat.get();
    return g instanceof Statements.Constant
      || g instanceof Statements.Data
      || g instanceof Statements.ClassData
      || g instanceof Statements.Static
      || g instanceof Statements.Type;
  }

  private isTyped(stat: StatementNode) {
    return stat.findFirstExpression(Type) || stat.findFirstExpression(TypeTable);
  }
}
