import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {IRuleMetadata, RuleTag} from "./_irule";
import {StatementNode} from "../abap/nodes/statement_node";
import {Comment, IStatement} from "../abap/2_statements/statements/_statement";
import {ABAPFile} from "../abap/abap_file";
import {EditHelper} from "../edit_helper";

export class CheckSubrcConf extends BasicRuleConfig {
  public openDataset: boolean = true;
  public authorityCheck: boolean = true;
  public selectSingle: boolean = true;
  public selectTable: boolean = true;
  public updateDatabase: boolean = true;
  public insertDatabase: boolean = true;
  public modifyDatabase: boolean = true;
  public deleteDatabase: boolean = true;
  public readTable: boolean = true;
  public assign: boolean = true;
  public find: boolean = true;
  /** CALL FUNCTION with EXCEPTIONS, unless every exception is mapped to 0 */
  public callFunction: boolean = true;
  /** Method call with EXCEPTIONS, unless every exception is mapped to 0 */
  public callMethod: boolean = true;
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

FIND statement with MATCH COUNT is considered okay if subrc is not checked

CALL FUNCTION and method calls are checked if they have an EXCEPTIONS addition that maps an exception to a value other than 0,
including CALL FUNCTION DESTINATION and STARTING NEW TASK. Not checked: calls without EXCEPTIONS, calls where every exception
is mapped to 0, EXCEPTION-TABLE, CALL FUNCTION IN UPDATE TASK and IN BACKGROUND.
For CALL FUNCTION the pragma ##FM_SUBRC_OK is also accepted.

A call of a method with SUBRC in its name, like check_subrc( ), is considered a check.

After ELSE, ELSEIF, WHEN, CATCH and CLEANUP the check continues after the end of the block, as these branches are not run
after the statement`,
      tags: [RuleTag.SingleFile, RuleTag.Quickfix],
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

  private buildFix(file: ABAPFile, statement: StatementNode) {
    return {
      description: "Add ##SUBRC_OK",
      edit: EditHelper.insertAt(file, statement.getLastToken().getStart(), " ##SUBRC_OK"),
    };
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    const statements = file.getStatements();
    const message = "Check sy-subrc";
    const config = this.getConfig();

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      if (statement.getPragmas().some(t => t.getStr() === this.getMetadata().pragma)) {
        continue;
      }

      if (config.openDataset === true
          && statement.get() instanceof Statements.OpenDataset
          && this.isChecked(i, statements) === false) {
// it doesnt make sense to ignore the subrc for open dataset, so no quick fix
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity));
      } else if (config.authorityCheck === true
          && statement.get() instanceof Statements.AuthorityCheck
          && this.isChecked(i, statements) === false) {
// it doesnt make sense to ignore the subrc for authority checks, so no quick fix
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
        const fix = this.buildFix(file, statement);
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity, undefined, [fix]));
      } else if (config.selectTable === true
          && statement.get() instanceof Statements.Select
          && statement.concatTokens().toUpperCase().startsWith("SELECT SINGLE ") === false
          && statement.concatTokens().toUpperCase().startsWith("SELECT COUNT( * ) ") === false
          && statement.concatTokens().toUpperCase().startsWith("SELECT COUNT(*) ") === false
          && this.isChecked(i, statements) === false
          && this.checksDbcnt(i, statements) === false) {
        const fix = this.buildFix(file, statement);
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity, undefined, [fix]));
      } else if (config.updateDatabase === true
          && statement.get() instanceof Statements.UpdateDatabase
          && this.isChecked(i, statements) === false
          && this.checksDbcnt(i, statements) === false) {
        const fix = this.buildFix(file, statement);
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity, undefined, [fix]));
      } else if (config.deleteDatabase === true
          && statement.get() instanceof Statements.DeleteDatabase
          && this.isChecked(i, statements) === false
          && this.checksDbcnt(i, statements) === false) {
        const fix = this.buildFix(file, statement);
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity, undefined, [fix]));
      } else if (config.insertDatabase === true
          && statement.get() instanceof Statements.InsertDatabase
          && this.isChecked(i, statements) === false
          && this.checksDbcnt(i, statements) === false) {
        const fix = this.buildFix(file, statement);
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity, undefined, [fix]));
      } else if (config.modifyDatabase === true
          && statement.get() instanceof Statements.ModifyDatabase
          && this.isChecked(i, statements) === false
          && this.checksDbcnt(i, statements) === false) {
        const fix = this.buildFix(file, statement);
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity, undefined, [fix]));
      } else if (config.readTable === true
          && statement.get() instanceof Statements.ReadTable
          && this.isChecked(i, statements) === false) {
        const fix = this.buildFix(file, statement);
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity, undefined, [fix]));
      } else if (config.assign === true
          && statement.get() instanceof Statements.Assign
          && this.isSimpleAssign(statement) === false
          && this.isChecked(i, statements) === false) {
        const fix = this.buildFix(file, statement);
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity, undefined, [fix]));
      } else if (config.find === true
          && statement.get() instanceof Statements.Find
          && this.isExemptedFind(statement) === false
          && this.isChecked(i, statements) === false) {
        const fix = this.buildFix(file, statement);
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity, undefined, [fix]));
      } else if (config.callFunction === true
          && statement.get() instanceof Statements.CallFunction
          && statement.getPragmas().some(t => t.getStr().toUpperCase() === "##FM_SUBRC_OK") === false
          && this.isUpdateOrBackgroundTask(statement) === false
          && this.mapsExceptionToNonZero(statement) === true
          && this.isChecked(i, statements) === false) {
        const fix = this.buildFix(file, statement);
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity, undefined, [fix]));
      } else if (config.callMethod === true
          && statement.get() instanceof Statements.Call
          && this.mapsExceptionToNonZero(statement) === true
          && this.isChecked(i, statements) === false) {
        const fix = this.buildFix(file, statement);
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity, undefined, [fix]));
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

  /** true if the EXCEPTIONS addition maps an exception to a value other than 0, then the call sets sy-subrc */
  private mapsExceptionToNonZero(statement: StatementNode): boolean {
    for (const list of statement.findAllExpressions(Expressions.ParameterListExceptions)) {
      for (const exception of list.findDirectExpressions(Expressions.ParameterException)) {
        const value = exception.findDirectExpression(Expressions.Integer);
        if (value === undefined || parseInt(value.concatTokens().replace(/\s/g, ""), 10) !== 0) {
          return true;
        }
      }
    }
    return false;
  }

  private isUpdateOrBackgroundTask(statement: StatementNode): boolean {
    const concat = statement.concatTokens().toUpperCase();
    return concat.includes(" IN UPDATE TASK") || concat.includes(" IN BACKGROUND ");
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

  /** index of the end statement that closes the block the statement at index is in */
  private findEnd(index: number, statements: readonly StatementNode[],
                  open: (new () => IStatement)[], close: new () => IStatement): number {
    let depth = 0;
    for (let i = index + 1; i < statements.length; i++) {
      const statement = statements[i].get();
      if (open.some(o => statement instanceof o)) {
        depth++;
      } else if (statement instanceof close) {
        if (depth === 0) {
          return i;
        }
        depth--;
      }
    }
    return statements.length;
  }

  /** a method call like check_subrc( ), the method reads sy-subrc */
  private callsSubrcMethod(statement: StatementNode): boolean {
    return statement.get() instanceof Statements.Call
      && statement.findAllExpressions(Expressions.MethodName).some(m => m.concatTokens().toUpperCase().includes("SUBRC"));
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
          || statement.get() instanceof Statements.EndCase
          || statement.get() instanceof Statements.EndTry
          || statement.get() instanceof Statements.EndTestSeam) {
        continue;
      } else if (statement.get() instanceof Statements.Else
          || statement.get() instanceof Statements.ElseIf) {
// the other branches are not run after this one, continue after ENDIF
        i = this.findEnd(i, statements, [Statements.If], Statements.EndIf);
      } else if (statement.get() instanceof Statements.When
          || statement.get() instanceof Statements.WhenOthers
          || statement.get() instanceof Statements.WhenType) {
        i = this.findEnd(i, statements, [Statements.Case, Statements.CaseType], Statements.EndCase);
      } else if (statement.get() instanceof Statements.Catch
          || statement.get() instanceof Statements.Cleanup) {
        i = this.findEnd(i, statements, [Statements.Try], Statements.EndTry);
      } else {
        if (assigned && concat.includes(assigned)) {
          return true;
        }
        if (assignedn && concat.includes(assignedn)) {
          return true;
        }
        return concat.includes(" SY-SUBRC")
          || concat.includes("CL_ABAP_UNIT_ASSERT=>ASSERT_SUBRC")
          || this.callsSubrcMethod(statement);
      }
    }
    return false;
  }

}