import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {ABAPFile} from "../abap/abap_file";
import {StatementNode} from "../abap/nodes/statement_node";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";

export class NoMandtInDatabaseOperationsConf extends BasicRuleConfig {
}

export class NoMandtInDatabaseOperations extends ABAPRule {
  private conf = new NoMandtInDatabaseOperationsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "no_mandt_in_database_operations",
      title: "No MANDT in database operations",
      shortDescription: "Do not specify the client in database operations; the ABAP runtime handles it automatically.",
      extendedInformation: "Only check for the name MANDT, not for the field type. The rule does not check for dynamic SQL.",
      tags: [RuleTag.SingleFile],
      badExample: `SELECT * FROM zcustomers
  CLIENT SPECIFIED
  WHERE mandt = @sy-mandt
  INTO TABLE @DATA(customers).`,
      goodExample: `SELECT * FROM zcustomers
  INTO TABLE @DATA(customers).`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: NoMandtInDatabaseOperationsConf): void {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): readonly Issue[] {
    const issues: Issue[] = [];

    for (const statement of file.getStatements()) {
      if (this.isDatabaseOperation(statement) === false) {
        continue;
      }

      const mandt = this.findMandtInCondition(statement);
      if (mandt !== undefined) {
        const issue = Issue.atToken(file, mandt.getFirstToken(), this.getMetadata().title,
                                    this.getMetadata().key, this.conf.severity);
        issues.push(issue);
        continue;
      }

      const explicitClient = this.findExplicitClient(statement);
      if (explicitClient !== undefined) {
        const issue = Issue.atToken(file, explicitClient, this.getMetadata().title,
                                    this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }

    return issues;
  }

  private isDatabaseOperation(statement: StatementNode): boolean {
    const type = statement.get();
    return type instanceof Statements.DeleteDatabase
      || type instanceof Statements.InsertDatabase
      || type instanceof Statements.MergeDatabase
      || type instanceof Statements.ModifyDatabase
      || type instanceof Statements.OpenCursor
      || type instanceof Statements.Select
      || type instanceof Statements.SelectLoop
      || type instanceof Statements.UpdateDatabase
      || type instanceof Statements.With
      || type instanceof Statements.WithLoop;
  }

  private findMandtInCondition(statement: StatementNode) {
    for (const condition of statement.findAllExpressions(Expressions.SQLCond)) {
      for (const field of condition.findAllExpressions(Expressions.SQLFieldName)) {
        const name = field.concatTokens().toUpperCase();
        if (name === "MANDT" || name.endsWith("~MANDT")) {
          return field;
        }
      }
    }
    return undefined;
  }

  private findExplicitClient(statement: StatementNode) {
    const tokens = statement.getTokens();
    for (let index = 0; index < tokens.length; index++) {
      const current = tokens[index].getStr().toUpperCase();
      const next = tokens[index + 1]?.getStr().toUpperCase();
      const afterNext = tokens[index + 2]?.getStr().toUpperCase();

      if ((current === "CLIENT" && next === "SPECIFIED")
          || (current === "USING" && (next === "CLIENT" || next === "CLIENTS"))
          || (current === "USING" && next === "ALL" && afterNext === "CLIENTS")) {
        return current === "CLIENT" ? tokens[index] : tokens[index + (next === "ALL" ? 2 : 1)];
      }
    }
    return undefined;
  }
}
