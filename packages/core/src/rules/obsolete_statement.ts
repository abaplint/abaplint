import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Position} from "../position";
import {IRuleMetadata} from "./_irule";

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
  /** Check for MOVE statement */
  public move: boolean = true;
  /** Check for DIVIDE statement */
  public divide: boolean = true;
  /** Checks for usages of IS REQUESTED */
  public requested: boolean = true;
  /** Checks for usages of OCCURS */
  public occurs: boolean = true;
  /** Checks for SET EXTENDED CHECK, https://help.sap.com/doc/abapdocu_751_index_htm/7.51/en-us/abapset_extended_check.htm */
  public setExtended: boolean = true;
  /** Checks for WITH HEADER LINE */
  public withHeaderLine: boolean = true;
  /** Checks for FIELD-SYMBOL ... STRUCTURE */
  public fieldSymbolStructure: boolean = true;
}

export class ObsoleteStatement extends ABAPRule {

  private conf = new ObsoleteStatementConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "obsolete_statement",
      title: "Obsolete statements",
      shortDescription: `Checks for usages of certain obsolete statements`,
      extendedInformation:
      `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#prefer-functional-to-procedural-language-constructs`,
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

    for (const staNode of statements) {
      const sta = staNode.get();
      if ((sta instanceof Statements.Refresh && this.conf.refresh)
          || (sta instanceof Statements.Compute && this.conf.compute)
          || (sta instanceof Statements.Add && this.conf.add)
          || (sta instanceof Statements.Subtract && this.conf.subtract)
          || (sta instanceof Statements.Multiply && this.conf.multiply)
          || (sta instanceof Statements.Move && this.conf.move
          && staNode.getTokens()[0].getStr().toUpperCase() === "MOVE"
          && staNode.getTokens()[1].getStr() !== "-"
          && staNode.getTokens()[1].getStr().toUpperCase() !== "EXACT")
          || (sta instanceof Statements.Divide && this.conf.divide)) {
        if (prev === undefined || staNode.getStart().getCol() !== prev.getCol() || staNode.getStart().getRow() !== prev.getRow()) {
          const message = "Statement \"" + staNode.getFirstToken().getStr() + "\" is obsolete";
          const issue = Issue.atStatement(file, staNode, message, this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }
        prev = staNode.getStart();
      }

      if (this.conf.setExtended && sta instanceof Statements.SetExtendedCheck) {
        const issue = Issue.atStatement(file, staNode, "SET EXTENDED CHECK is obsolete", this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }

      if (this.conf.requested && sta instanceof Statements.If) {
        for (const compare of staNode.findAllExpressions(Expressions.Compare)) {
          const token = compare.findDirectTokenByText("REQUESTED");
          if (token) {
            const issue = Issue.atToken(file, token, "IS REQUESTED is obsolete", this.getMetadata().key, this.conf.severity);
            issues.push(issue);
          }
        }
      }

      if (this.conf.occurs) {
        if ((sta instanceof Statements.Describe)
          || (sta instanceof Statements.Ranges)) {
          const token = staNode.findDirectTokenByText("OCCURS");
          if (token) {
            const issue = Issue.atToken(file, token, "OCCURS is obsolete", this.getMetadata().key, this.conf.severity);
            issues.push(issue);
          }
        }

        for (const dataDef of staNode.findAllExpressions(Expressions.DataDefinition)) {
          const token = dataDef.findDirectTokenByText("OCCURS");
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
          const issue = Issue.atToken(file, token, "FIELD-SYMBOL ... STRUCTURE is obsolete", this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }
      }
    }
    return issues;
  }
}
