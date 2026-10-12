import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {IRuleMetadata, RuleTag} from "./_irule";
import {StatementNode} from "../abap/nodes/statement_node";
import {TokenNode} from "../abap/nodes/token_node";
import {Comment} from "../abap/2_statements/statements/_statement";
import {ABAPFile} from "../abap/abap_file";

export class DeleteIndexInLoopConf extends BasicRuleConfig {
}

export class DeleteIndexInLoop extends ABAPRule {
  private conf = new DeleteIndexInLoopConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "delete_index_in_loop",
      title: "DELETE INDEX sy-tabix inside a LOOP over the same table",
      shortDescription: `Reports DELETE itab INDEX sy-tabix inside a LOOP AT the same table`,
      extendedInformation: `sy-tabix is the index of the loop's current row only until another statement writes it.
READ TABLE, APPEND, INSERT, COLLECT, a nested LOOP and any method called in the loop body
all set sy-tabix. After that the DELETE removes a different row, and if sy-tabix is 0 it
raises the runtime error TABLE_INVALID_INDEX.

Use DELETE itab WHERE ..., or collect the rows to keep in a second table.

Not reported: DELETE itab INDEX sy-tabix directly after READ TABLE itab, where sy-tabix
is the index the READ just set.`,
      tags: [RuleTag.SingleFile],
      badExample: `LOOP AT tab INTO row.
  IF row-flag = abap_true.
    DELETE tab INDEX sy-tabix.
  ENDIF.
ENDLOOP.`,
      goodExample: `DELETE tab WHERE flag = abap_true.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: DeleteIndexInLoopConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    const statements = file.getStatements();

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!(statement.get() instanceof Statements.DeleteInternal) || this.byTabix(statement) === false) {
        continue;
      }

      // DELETE TABLE and DELETE ADJACENT DUPLICATES have a keyword before the target
      const target = statement.findDirectExpression(Expressions.Target);
      if (target === undefined || statement.getChildren()[1] !== target) {
        continue;
      }
      const table = target.concatTokens().toUpperCase();

      if (this.previousReadsTable(i, statements, table) === true
          || this.enclosingLoopTables(i, statements).includes(table) === false) {
        continue;
      }

      const message = `DELETE ${target.concatTokens()} INDEX sy-tabix inside LOOP AT the same table,`
        + ` sy-tabix might not be the loop's current row`;
      issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity));
    }

    return issues;
  }

////////////////

  private byTabix(statement: StatementNode): boolean {
    const children = statement.getChildren();
    for (let i = 0; i < children.length - 1; i++) {
      const child = children[i];
      if (child instanceof TokenNode && child.getFirstToken().getStr().toUpperCase() === "INDEX") {
        return children[i + 1].concatTokens().toUpperCase() === "SY-TABIX";
      }
    }
    return false;
  }

  private previousReadsTable(index: number, statements: readonly StatementNode[], table: string): boolean {
    for (let i = index - 1; i >= 0; i--) {
      const statement = statements[i];
      if (statement.get() instanceof Comment) {
        continue;
      }
      if (!(statement.get() instanceof Statements.ReadTable)) {
        return false;
      }
      const read = statement.findDirectExpression(Expressions.SimpleSource2)
        ?? statement.findDirectExpression(Expressions.Source);
      return read?.concatTokens().toUpperCase() === table;
    }
    return false;
  }

  private enclosingLoopTables(index: number, statements: readonly StatementNode[]): string[] {
    const tables: string[] = [];
    let depth = 0;
    for (let i = index - 1; i >= 0; i--) {
      const statement = statements[i];
      const s = statement.get();
      if (s instanceof Statements.EndLoop) {
        depth++;
      } else if (s instanceof Statements.Loop) {
        if (depth === 0) {
          const source = statement.findDirectExpression(Expressions.LoopSource);
          if (source !== undefined) {
            tables.push(source.concatTokens().toUpperCase());
          }
        } else {
          depth--;
        }
      } else if (s instanceof Statements.MethodImplementation
          || s instanceof Statements.Form
          || s instanceof Statements.FunctionModule
          || s instanceof Statements.Module) {
        break;
      }
    }
    return tables;
  }

}
