import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../abap/abap_file";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Position} from "../position";
import {IRuleMetadata, RuleTag} from "./_irule";
import {Version} from "../version";
import {EditHelper, IEdit} from "../edit_helper";
import {IStatement} from "../abap/2_statements/statements/_statement";
import {ExpressionNode, StatementNode} from "../abap/nodes";
import {SourceFieldSymbol} from "../abap/2_statements/expressions";


export class ObsoleteStatementConf extends BasicRuleConfig {
  /** Check for REFRESH statement */
  public refresh: boolean = true;
  /** Check for COMPUTE statement */
  public compute: boolean = true;
  /** Check for ADD statement */
  public add: boolean = true;
  /** Check for SUBTRACT statement */
  public subtract: boolean = true;
  /** Check for MULTIPLY statement */
  public multiply: boolean = true;
  /** Check for DIVIDE statement */
  public divide: boolean = true;
  /** Check for MOVE statement */
  public move: boolean = true;
  /** Checks for usages of IS REQUESTED */
  public requested: boolean = true;
  /** Checks for usages of OCCURS */
  public occurs: boolean = true;
  /** Checks for SET EXTENDED CHECK */
  public setExtended: boolean = true;
  /** Checks for WITH HEADER LINE */
  public withHeaderLine: boolean = true;
  /** Checks for FIELD-SYMBOLS ... STRUCTURE */
  public fieldSymbolStructure: boolean = true;
  /** Checks for TYPE-POOLS */
  public typePools: boolean = true;
  /** Checks for addition LOAD */
  public load: boolean = true;
  /** Checks for PARAMETER */
  public parameter: boolean = true;
  /** Checks for RANGES */
  public ranges: boolean = true;
  /** Checks for COMMUNICATION */
  public communication: boolean = true;
  /** Checks for PACK */
  public pack: boolean = true;
  /** Checks for SELECT without INTO */
  public selectWithoutInto: boolean = true;
  /** FREE MEMORY, without ID */
  public freeMemory: boolean = true;
  /** Checks for EXIT FROM SQL */
  public exitFromSQL: boolean = true;
  /** Checks for SORT itab BY <fs> */
  public sortByFS: boolean = true;
  /** Checks for CALL TRANSFORMATION OBJECTS */
  public callTransformation: boolean = true;
  /** Check for POSIX REGEX usage */
  public regex: boolean = true;
  /** Check for OCCURENCES vs OCCURRENCES usage */
  public occurences: boolean = true;
}

export class ObsoleteStatement extends ABAPRule {

  private conf = new ObsoleteStatementConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "obsolete_statement",
      title: "Obsolete statements",
      shortDescription: `Checks for usages of certain obsolete statements`,
      tags: [RuleTag.SingleFile, RuleTag.Styleguide, RuleTag.Quickfix],
      extendedInformation: `
https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#prefer-functional-to-procedural-language-constructs

https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#avoid-obsolete-language-elements

SET EXTENDED CHECK: https://help.sap.com/doc/abapdocu_751_index_htm/7.51/en-us/abapset_extended_check.htm

IS REQUESTED: https://help.sap.com/doc/abapdocu_750_index_htm/7.50/en-US/abenlogexp_requested.htm

WITH HEADER LINE: https://help.sap.com/doc/abapdocu_750_index_htm/7.50/en-US/abapdata_header_line.htm

FIELD-SYMBOLS STRUCTURE: https://help.sap.com/doc/abapdocu_751_index_htm/7.51/en-us/abapfield-symbols_obsolete_typing.htm

TYPE-POOLS: from 702, https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-US/abennews-71-program_load.htm

LOAD addition: from 702, https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-US/abennews-71-program_load.htm

COMMUICATION: https://help.sap.com/doc/abapdocu_751_index_htm/7.51/en-us/abapcommunication.htm

OCCURS: https://help.sap.com/doc/abapdocu_751_index_htm/7.51/en-us/abapdata_occurs.htm

PARAMETER: https://help.sap.com/doc/abapdocu_751_index_htm/7.51/en-US/abapparameter.htm

RANGES: https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-US/abapranges.htm

PACK: https://help.sap.com/doc/abapdocu_751_index_htm/7.51/en-us/abappack.htm

SELECT without INTO: https://help.sap.com/doc/abapdocu_731_index_htm/7.31/en-US/abapselect_obsolete.htm
SELECT COUNT(*) is considered okay

FREE MEMORY: https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-us/abapfree_mem_id_obsolete.htm

SORT BY FS: https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-US/abapsort_itab_obsolete.htm

CALL TRANSFORMATION OBJECTS: https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-US/abapcall_transformation_objects.htm

POSIX REGEX: https://help.sap.com/doc/abapdocu_755_index_htm/7.55/en-US/index.htm`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ObsoleteStatementConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const statements = file.getStatements();
    let prev: Position | undefined = undefined;
    const configVersion = this.reg.getConfig().getVersion();

    for (const staNode of statements) {
      const sta = staNode.get();
      if ((sta instanceof Statements.Refresh && this.conf.refresh)
          || (sta instanceof Statements.Compute && this.conf.compute)
          || (sta instanceof Statements.Add && this.conf.add)
          || (sta instanceof Statements.Subtract && this.conf.subtract)
          || (sta instanceof Statements.ClassDefinitionLoad && this.conf.load && configVersion >= Version.v702)
          || (sta instanceof Statements.InterfaceLoad && this.conf.load && configVersion >= Version.v702)
          || (sta instanceof Statements.Multiply && this.conf.multiply)
          || (sta instanceof Statements.Divide && this.conf.divide)
          || (sta instanceof Statements.Move && this.conf.move
          && staNode.getTokens()[0].getStr().toUpperCase() === "MOVE"
          && staNode.getTokens()[1].getStr() !== "-"
          && staNode.getTokens()[1].getStr().toUpperCase() !== "EXACT") ) {
        if (prev === undefined || staNode.getStart().getCol() !== prev.getCol() || staNode.getStart().getRow() !== prev.getRow()) {
          const message = "Statement \"" + staNode.getFirstToken().getStr() + "\" is obsolete";
          const fix = this.getFix(file, sta, staNode);
          const issue = Issue.atStatement(file, staNode, message, this.getMetadata().key, this.conf.severity, fix);
          issues.push(issue);
        }
        prev = staNode.getStart();
      }

      if (this.conf.setExtended && sta instanceof Statements.SetExtendedCheck) {
        const issue = Issue.atStatement(file, staNode, "SET EXTENDED CHECK is obsolete", this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }

      if (this.conf.communication && sta instanceof Statements.Communication) {
        const issue = Issue.atStatement(file, staNode, "COMMUNICATION is obsolete", this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }

      if (this.conf.pack && sta instanceof Statements.Pack) {
        const issue = Issue.atStatement(file, staNode, "PACK is obsolete", this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }

      if (this.conf.parameter && sta instanceof Statements.Parameter) {
        const token = staNode.getFirstToken();

        if (token.getStr().toUpperCase() === "PARAMETER") {
          const fix = EditHelper.replaceToken(file, token, "PARAMETERS");
          const issue = Issue.atStatement(file, staNode, "Use PARAMETERS instead of PARAMETER", this.getMetadata().key, this.conf.severity, fix);
          issues.push(issue);
        }
      }

      if (this.conf.ranges && sta instanceof Statements.Ranges) {
        const children = staNode.getChildren();
        let fix = undefined;
        if (children.length === 5) {
          const simpleNameString = children[1].concatTokens();
          const fieldSubString = children[3].concatTokens();
          const replacement = "TYPES " + simpleNameString + " LIKE RANGE OF " + fieldSubString + ".";
          fix = EditHelper.replaceRange(file, staNode.getStart(), staNode.getEnd(), replacement);
        }

        const issue = Issue.atStatement(file, staNode, "Use LIKE RANGE OF instead of RANGES", this.getMetadata().key, this.conf.severity, fix);
        issues.push(issue);
      }

      if (this.conf.selectWithoutInto
          && (sta instanceof Statements.Select || sta instanceof Statements.SelectLoop)
          && staNode.findFirstExpression(Expressions.SQLIntoStructure) === undefined
          && staNode.findFirstExpression(Expressions.SQLIntoTable) === undefined) {
        const concat = staNode.findFirstExpression(Expressions.SQLFieldList)?.concatTokens().toUpperCase();
        if (concat !== "COUNT(*)" && concat !== "COUNT( * )") {
          const issue = Issue.atStatement(file, staNode, "SELECT without INTO", this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }
      }

      if (this.conf.requested && sta instanceof Statements.If) {
        for (const compare of staNode.findAllExpressions(Expressions.Compare)) {
          const token = compare.findDirectTokenByText("REQUESTED");
          if (token) {
            const fix = EditHelper.replaceToken(file, token, "SUPPLIED");
            const issue = Issue.atToken(file, token, "IS REQUESTED is obsolete", this.getMetadata().key, this.conf.severity, fix);
            issues.push(issue);
          }
        }
      }

      if (this.conf.occurs) {
        if ((sta instanceof Statements.Describe)
          || (sta instanceof Statements.Ranges)
          || (sta instanceof Statements.DataBegin)
          || (sta instanceof Statements.TypeBegin)) {
          const token = staNode.findDirectTokenByText("OCCURS");
          if (token) {
            const issue = Issue.atToken(file, token, "OCCURS is obsolete", this.getMetadata().key, this.conf.severity);
            issues.push(issue);
          }
        }

        for (const dataDef of staNode.findAllExpressions(Expressions.DataDefinition)) {
          const token = dataDef.findDirectExpression(Expressions.TypeTable)?.findDirectTokenByText("OCCURS");
          if (token) {
            const issue = Issue.atToken(file, token, "OCCURS is obsolete", this.getMetadata().key, this.conf.severity);
            issues.push(issue);
          }
        }
      }

      if (this.conf.withHeaderLine === true && sta instanceof Statements.Data) {
        if (staNode.concatTokens().toUpperCase().includes("WITH HEADER LINE")) {
          const token = staNode.getFirstToken();
          if (token) {
            const issue = Issue.atToken(file, token, "WITH HEADER LINE is obsolete", this.getMetadata().key, this.conf.severity);
            issues.push(issue);
          }
        }
      }

      if (this.conf.fieldSymbolStructure && sta instanceof Statements.FieldSymbol){
        const token = staNode.findDirectTokenByText("STRUCTURE");
        if (token) {
          const issue = Issue.atToken(file, token, "FIELD-SYMBOLS ... STRUCTURE is obsolete", this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }
      }

      if (this.conf.typePools && sta instanceof Statements.TypePools && configVersion >= Version.v702){
        const fix = EditHelper.deleteStatement(file, staNode);
        const issue = Issue.atStatement(file, staNode, "Statement \"TYPE-POOLS\" is obsolete", this.getMetadata().key, this.conf.severity, fix);
        issues.push(issue);
      }

      if (this.conf.freeMemory && sta instanceof Statements.FreeMemory) {
        const concat = staNode.concatTokens().toUpperCase();
        if (concat === "FREE MEMORY.") {
          const issue = Issue.atStatement(file, staNode, "Statement \"FREE MEMORY\" without ID is obsolete", this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }
      }

      if (this.conf.exitFromSQL && sta instanceof Statements.Exit) {
        const concat = staNode.concatTokens().toUpperCase();
        if (concat === "EXIT FROM SQL.") {
          const issue = Issue.atStatement(file, staNode, "Statement \"EXIT FROM SQL\" is obsolete", this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }
      }

      if (this.conf.sortByFS && sta instanceof Statements.Sort) {
        const afterBy = staNode.findExpressionAfterToken("BY");

        if (afterBy instanceof ExpressionNode && afterBy.get() instanceof SourceFieldSymbol) {
          const issue = Issue.atStatement(file, staNode, "Statement \"SORT itab BY <fs>\" is obsolete", this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }
      }

      if (this.conf.callTransformation && sta instanceof Statements.CallTransformation) {
        const objects = staNode.findExpressionAfterToken("OBJECTS");

        if (objects) {
          const issue = Issue.atStatement(file, staNode, "Use PARAMETERS instead of OBJECTS", this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }
      }

      if (this.conf.occurences && sta instanceof Statements.Replace) {
        const concat = staNode.concatTokens().toUpperCase();
        if (concat.includes(" OCCURENCES ")) {
          const issue = Issue.atStatement(file, staNode, "Use \"OCCURRENCES\"", this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }
      }

      if (configVersion >= Version.v756 && this.conf.regex) {
        if (sta instanceof Statements.Find || sta instanceof Statements.Replace) {
          if (staNode.findFirstExpression(Expressions.FindType)?.concatTokens().includes("REGEX")) {
            const issue = Issue.atStatement(file, staNode, "REGEX obsolete, use PCRE", this.getMetadata().key, this.conf.severity);
            issues.push(issue);
          }
        }
        else {
          const classNameExpression = staNode.findAllExpressions(Expressions.ClassName);
          const methodNameExpression = staNode.findAllExpressions(Expressions.MethodName);

          if (classNameExpression.length !== 0 && methodNameExpression.length !== 0) {
            const className = classNameExpression[0].concatTokens();
            const methodName = methodNameExpression[0].concatTokens();

            if (className === "cl_abap_regex") {
              if (methodName === "create_posix") {
                const issue = Issue.atStatement(file, staNode, "create_posix obsolete, use create_pcre", this.getMetadata().key, this.conf.severity);
                issues.push(issue);
              }
            }
            else if (className === "cl_abap_matcher") {
              if (methodName.includes("posix")) {
                const issue = Issue.atStatement(file, staNode, "posix methods obsolete, use pcre methods", this.getMetadata().key, this.conf.severity);
                issues.push(issue);
              }
            }
          }
        }
      }
    }
    return issues;
  }

  private getFix(file: ABAPFile, statement: IStatement, statementNode: StatementNode): IEdit | undefined {
    if (statement instanceof Statements.Refresh) {
      if (statementNode.getChildren().length === 6) {
        return undefined;
      }

      return EditHelper.replaceToken(file, statementNode.getFirstToken(), "CLEAR");
    }
    else if (statement instanceof Statements.Compute) {
      const children = statementNode.getChildren();
      if (children.length === 5) {
        const tokenForDeletion = statementNode.getFirstToken();
        let endPosition = tokenForDeletion.getEnd();
        endPosition = new Position(endPosition.getRow(), endPosition.getCol() + 1);
        return EditHelper.deleteRange(file, tokenForDeletion.getStart(), endPosition);
      }
      else {
        const targetString = children[2].concatTokens();
        const sourceString = children[4].concatTokens();
        const replacement = targetString + " = EXACT #( " + sourceString + " ).";
        return EditHelper.replaceRange(file, statementNode.getStart(), statementNode.getEnd(), replacement);
      }
    }
    else if (statement instanceof Statements.Add ||
            statement instanceof Statements.Subtract) {
      const children = statementNode.getChildren();
      const sourceString = children[1].concatTokens();
      const targetString = children[3].concatTokens();
      let replacement = "";

      if (statement instanceof Statements.Add) {
        replacement = targetString + " = " + targetString + " + " + sourceString + ".";
      }
      else if (statement instanceof Statements.Subtract) {
        replacement = targetString + " = " + targetString + " - " + sourceString + ".";
      }

      return EditHelper.replaceRange(file, statementNode.getStart(), statementNode.getEnd(), replacement);
    }
    else if (statement instanceof Statements.Multiply ||
          statement instanceof Statements.Divide) {
      const children = statementNode.getChildren();
      const targetString = children[1].concatTokens();
      const sourceString = children[3].concatTokens();
      let replacement = "";

      if (statement instanceof Statements.Multiply) {
        replacement = targetString + " = " + targetString + " * " + sourceString + ".";
      }
      else if (statement instanceof Statements.Divide) {
        replacement = targetString + " = " + targetString + " / " + sourceString + ".";
      }

      return EditHelper.replaceRange(file, statementNode.getStart(), statementNode.getEnd(), replacement);
    }
    else if (statement instanceof Statements.Move) {
      if (statementNode.getColon() !== undefined) {
        return undefined;
      }

      const children = statementNode.getChildren();
      const sourceString = children[1].concatTokens();
      const targetString = children[3].concatTokens();

      let operator = children[2].concatTokens();
      if (operator === "TO") {
        operator = " = ";
      }
      else {
        operator = " ?= ";
      }

      const replacement = targetString + operator + sourceString + ".";

      return EditHelper.replaceRange(file, statementNode.getStart(), statementNode.getEnd(), replacement);
    }
    else if (statement instanceof Statements.ClassDefinitionLoad ||
            statement instanceof Statements.InterfaceLoad) {

      let token = undefined;
      if (statement instanceof Statements.ClassDefinitionLoad) {
        token = statementNode.getChildren()[3].getFirstToken();
      }
      else {
        token = statementNode.getChildren()[2].getFirstToken();
      }

      let startPosition = token.getStart();
      startPosition = new Position(startPosition.getRow(), startPosition.getCol() - 1);
      return EditHelper.deleteRange(file, startPosition, token.getEnd());
    }

    return undefined;
  }
}
