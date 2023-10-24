import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {IRuleMetadata, RuleTag} from "./_irule";
import {StatementNode} from "../abap/nodes/statement_node";
import {Comment} from "../abap/2_statements/statements/_statement";
import {ABAPFile} from "../abap/abap_file";

export class CheckSubrcConf extends BasicRuleConfig {
  public openDataset: boolean = true;
  public authorityCheck: boolean = true;
  public selectSingle: boolean = true;
  public selectTable: boolean = true;
  public updateDatabase: boolean = true;
  public insertDatabase: boolean = true;
  public modifyDatabase: boolean = true;
  public readTable: boolean = true;
  public assign: boolean = true;
  public find: boolean = true;
}

export class CheckSubrc extends ABAPRule {
  private conf = new CheckSubrcConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "check_subrc",
      title: "Check sy-subrc",
      shortDescription: `Check sy-subrc`,
      extendedInformation: `Pseudo comment "#EC CI_SUBRC can be added to suppress findings

If sy-dbcnt is checked after database statements, it is considered okay.

"SELECT SINGLE @abap_true FROM " is considered as an existence check, also "SELECT COUNT( * )" is considered okay

If IS ASSIGNED is checked after assigning, it is considered okay.

FIND statement with MATCH COUNT is considered okay if subrc is not checked`,
      tags: [RuleTag.SingleFile],
      pseudoComment: "EC CI_SUBRC",
      pragma: "##SUBRC_OK",
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CheckSubrcConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    const statements = file.getStatements();
    const message = "Check sy-subrc";
    const config = this.getConfig();

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

// todo: CALL FUNCTION

      if (statement.getPragmas().some(t => t.getStr() === this.getMetadata().pragma)) {
        continue;
      }

      if (config.openDataset === true
          && statement.get() instanceof Statements.OpenDataset
          && this.isChecked(i, statements) === false) {
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity));
      } else if (config.authorityCheck === true
          && statement.get() instanceof Statements.AuthorityCheck
          && this.isChecked(i, statements) === false) {
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity));
      } else if (config.selectSingle === true
          && statement.get() instanceof Statements.Select
          && statement.concatTokens().toUpperCase().startsWith("SELECT SINGLE ")
          && this.isChecked(i, statements) === false
          && this.checksDbcnt(i, statements) === false) {
        const concat = statement.concatTokens().toUpperCase();
        if (concat.startsWith("SELECT SINGLE @ABAP_TRUE FROM ")) {
          continue;
        }
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity));
      } else if (config.selectTable === true
          && statement.get() instanceof Statements.Select
          && statement.concatTokens().toUpperCase().startsWith("SELECT SINGLE ") === false
          && statement.concatTokens().toUpperCase().startsWith("SELECT COUNT( * ) ") === false
          && statement.concatTokens().toUpperCase().startsWith("SELECT COUNT(*) ") === false
          && this.isChecked(i, statements) === false
          && this.checksDbcnt(i, statements) === false) {
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity));
      } else if (config.updateDatabase === true
          && statement.get() instanceof Statements.UpdateDatabase
          && this.isChecked(i, statements) === false
          && this.checksDbcnt(i, statements) === false) {
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity));
      } else if (config.insertDatabase === true
          && statement.get() instanceof Statements.InsertDatabase
          && this.isChecked(i, statements) === false
          && this.checksDbcnt(i, statements) === false) {
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity));
      } else if (config.modifyDatabase === true
          && statement.get() instanceof Statements.ModifyDatabase
          && this.isChecked(i, statements) === false
          && this.checksDbcnt(i, statements) === false) {
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity));
      } else if (config.readTable === true
          && statement.get() instanceof Statements.ReadTable
          && this.isChecked(i, statements) === false) {
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity));
      } else if (config.assign === true
          && statement.get() instanceof Statements.Assign
          && this.isSimpleAssign(statement) === false
          && this.isChecked(i, statements) === false) {
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity));
      } else if (config.find === true
          && statement.get() instanceof Statements.Find
          && this.isExemptedFind(statement) === false
          && this.isChecked(i, statements) === false) {
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

////////////////

  private isSimpleAssign(statement: StatementNode): boolean {
    if (statement.getChildren().length === 5) {
      const source = statement.findDirectExpression(Expressions.AssignSource);
      if (source?.getChildren().length === 1
          && source.findDirectExpression(Expressions.Source) !== undefined) {
        return true;
      }
    }
    return false;
  }

  private isExemptedFind(s: StatementNode): boolean {
// see https://github.com/abaplint/abaplint/issues/2130
    return s.concatTokens().toUpperCase().includes(" MATCH COUNT ") === true;
  }

  private checksDbcnt(index: number, statements: readonly StatementNode[]): boolean {
    for (let i = index + 1; i < statements.length; i++) {
      const statement = statements[i];
      const concat = statement.concatTokens().toUpperCase();
      if (statement.get() instanceof Comment) {
        continue;
      } else if (statement.get() instanceof Statements.EndIf
          || statement.get() instanceof Statements.EndTestSeam) {
        continue;
      } else {
        return concat.includes("SY-DBCNT");
      }
    }
    return false;
  }

  private isChecked(index: number, statements: readonly StatementNode[]): boolean {
    let assigned: string | undefined = undefined;
    let assignedn: string | undefined = undefined;

    if (statements[index].get() instanceof Statements.Assign
        || statements[index].get() instanceof Statements.ReadTable) {
      const fs = statements[index].findFirstExpression(Expressions.FSTarget
      )?.findFirstExpression(Expressions.FieldSymbol)?.getFirstToken().getStr();
      assigned = fs?.toUpperCase() + " IS ASSIGNED";
      assignedn = fs?.toUpperCase() + " IS NOT ASSIGNED";
    }

    for (let i = index + 1; i < statements.length; i++) {
      const statement = statements[i];
      const concat = statement.concatTokens().toUpperCase();
      if (statement.get() instanceof Comment) {
        if (concat.includes("" + this.getMetadata().pseudoComment)) {
          return true;
        }
      } else if (statement.get() instanceof Statements.EndIf
          || statement.get() instanceof Statements.EndTestSeam) {
        continue;
      } else {
        if (assigned && concat.includes(assigned)) {
          return true;
        }
        if (assignedn && concat.includes(assignedn)) {
          return true;
        }
        return concat.includes(" SY-SUBRC")
          || concat.includes("CL_ABAP_UNIT_ASSERT=>ASSERT_SUBRC");
      }
    }
    return false;
  }

}