import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Statements from "../abap/2_statements/statements";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {EditHelper, IEdit} from "../edit_helper";
import {StatementNode} from "../abap/nodes";
import {Position} from "../position";
import {IStatement} from "../abap/2_statements/statements/_statement";

export class ChainMainlyDeclarationsConf extends BasicRuleConfig {
  /** Allow definition statements to be chained */
  public definitions: boolean = true;
  /** Allow WRITE statements to be chained */
  public write: boolean = true;
  /** Allow MOVE statements to be chained */
  public move: boolean = true;
  /** Allow REFRESH statements to be chained */
  public refresh: boolean = true;
  /** Allow UNASSIGN statements to be chained */
  public unassign: boolean = true;
  /** Allow CLEAR statements to be chained */
  public clear: boolean = true;
  /** Allow HIDE statements to be chained */
  public hide: boolean = true;
  /** Allow FREE statements to be chained */
  public free: boolean = true;
  /** Allow INCLUDE statements to be chained */
  public include: boolean = true;
  /** Allow CHECK statements to be chained */
  public check: boolean = true;
  /** Allow SORT statements to be chained */
  public sort: boolean = true;
}

export class ChainMainlyDeclarations extends ABAPRule {

  private conf = new ChainMainlyDeclarationsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "chain_mainly_declarations",
      title: "Chain mainly declarations",
      shortDescription: `Chain mainly declarations, allows chaining for the configured statements, reports errors for other statements.`,
      extendedInformation: `
https://docs.abapopenchecks.org/checks/23/

https://help.sap.com/doc/abapdocu_751_index_htm/7.51/en-US/abenchained_statements_guidl.htm
`,
      tags: [RuleTag.SingleFile, RuleTag.Quickfix],
      badExample: `CALL METHOD: bar.`,
      goodExample: `CALL METHOD bar.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ChainMainlyDeclarationsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const structure = file.getStructure();
    if (structure === undefined) {
      return [];
    }

    let previousRow: number | undefined;
    for (const statementNode of structure.findAllStatementNodes()) {
      const colon = statementNode.getColon();
      if (colon === undefined) {
        continue;
      }
      const statement = statementNode.get();

      if (this.conf.definitions === true
          && (statement instanceof Statements.ClassData
          || statement instanceof Statements.ClassDataBegin
          || statement instanceof Statements.ClassDataEnd
          || statement instanceof Statements.Static
          || statement instanceof Statements.StaticBegin
          || statement instanceof Statements.StaticEnd
          || statement instanceof Statements.Local
          || statement instanceof Statements.Constant
          || statement instanceof Statements.ConstantBegin
          || statement instanceof Statements.ConstantEnd
          || statement instanceof Statements.Controls
          || statement instanceof Statements.Parameter
          || statement instanceof Statements.SelectOption
          || statement instanceof Statements.SelectionScreen
          || statement instanceof Statements.Aliases
          || statement instanceof Statements.Tables
          || statement instanceof Statements.MethodDef
          || statement instanceof Statements.InterfaceDef
          || statement instanceof Statements.Type
          || statement instanceof Statements.TypeBegin
          || statement instanceof Statements.TypeEnd
          || statement instanceof Statements.TypeEnumBegin
          || statement instanceof Statements.TypeEnumEnd
          || statement instanceof Statements.TypeEnum
          || statement instanceof Statements.Events
          || statement instanceof Statements.Ranges
          || statement instanceof Statements.TypePools
          || statement instanceof Statements.FieldSymbol
          || statement instanceof Statements.Data
          || statement instanceof Statements.DataBegin
          || statement instanceof Statements.DataEnd)) {
        continue;
      } else if (this.conf.write === true && statement instanceof Statements.Write) {
        continue;
      } else if (this.conf.move === true && statement instanceof Statements.Move) {
        continue;
      } else if (this.conf.refresh === true && statement instanceof Statements.Refresh) {
        continue;
      } else if (this.conf.unassign === true && statement instanceof Statements.Unassign) {
        continue;
      } else if (this.conf.clear === true && statement instanceof Statements.Clear) {
        continue;
      } else if (this.conf.hide === true && statement instanceof Statements.Hide) {
        continue;
      } else if (this.conf.free === true && statement instanceof Statements.Free) {
        continue;
      } else if (this.conf.include === true && statement instanceof Statements.Include) {
        continue;
      } else if (this.conf.check === true && statement instanceof Statements.Check) {
        continue;
      } else if (this.conf.sort === true && statement instanceof Statements.Sort) {
        continue;
      }

      let prevFix: IEdit | undefined;
      if (previousRow === colon.getStart().getRow()) {
        prevFix = issues.pop()?.getFix();
      }

      const fix = this.getFix(file, statement, statementNode, prevFix);

      const message = "Chain mainly declarations";
      issues.push(Issue.atToken(file, statementNode.getFirstToken(), message, this.getMetadata().key, this.conf.severity, fix));

      previousRow = statementNode.getColon()!.getStart().getRow();
    }

    return issues;
  }

  private getFix(file: ABAPFile, statement: IStatement, statementNode: StatementNode, prevFix: IEdit | undefined): IEdit | undefined {
    if (statement instanceof Statements.ClassDataBegin ||
      statement instanceof Statements.ClassDataEnd ||
      statement instanceof Statements.StaticBegin ||
      statement instanceof Statements.StaticEnd ||
      statement instanceof Statements.ConstantBegin ||
      statement instanceof Statements.ConstantEnd ||
      statement instanceof Statements.TypeBegin ||
      statement instanceof Statements.TypeEnd ||
      statement instanceof Statements.TypeEnumBegin ||
      statement instanceof Statements.TypeEnumEnd ||
      statement instanceof Statements.DataBegin ||
      statement instanceof Statements.DataEnd) {
      return undefined;
    }

    let replacement = statementNode.concatTokens();
    replacement = replacement.replace(",", ".");

    let start: Position;
    if (prevFix === undefined) {
      start = statementNode.getStart();
    }
    else {
      start = statementNode.getTokens()[1].getStart();
    }

    let fix = EditHelper.replaceRange(file, start, statementNode.getEnd(), replacement);

    if (prevFix !== undefined) {
      fix = EditHelper.merge(fix, prevFix);
    }

    return fix;
  }
}
