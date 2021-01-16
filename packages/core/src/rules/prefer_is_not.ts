import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import * as Expressions from "../abap/2_statements/expressions";
import {BasicRuleConfig} from "./_basic_rule_config";
import {EditHelper, IEdit} from "../edit_helper";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {Position} from "../position";

export class PreferIsNotConf extends BasicRuleConfig {
}

export class PreferIsNot extends ABAPRule {

  private conf = new PreferIsNotConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "prefer_is_not",
      title: "Prefer IS NOT to NOT IS",
      shortDescription: `Prefer IS NOT to NOT IS`,
      extendedInformation: `
https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#prefer-is-not-to-not-is

"if not is_valid( )." examples are skipped`,
      tags: [RuleTag.Styleguide, RuleTag.Quickfix, RuleTag.SingleFile],
      goodExample: `IF variable IS NOT INITIAL.
IF variable NP 'TODO*'.
IF variable <> 42.`,
      badExample: `IF NOT variable IS INITIAL.
IF NOT variable CP 'TODO*'.
IF NOT variable = 42.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: PreferIsNotConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];

    for (const s of file.getStatements()) {
      for (const c of s.findAllExpressions(Expressions.Compare)) {
        if (c.concatTokens().toUpperCase().startsWith("NOT ") === false) {
          continue;
        } else if (c.getChildren().length === 2 && c.getChildren()[1].get() instanceof Expressions.MethodCallChain) {
          continue;
        }

        const message = "Prefer expresion NOT to NOT expresion";

        let insertFix: IEdit;
        const lengthOfNOT = 3;

        if (c.getChildren()[2].getFirstToken().getStr().toUpperCase() === "IS")
        {
          const tokenPositionBeforeDelete = c.getChildren()[2].getLastToken().getEnd();
          const tokenPosition = new Position(tokenPositionBeforeDelete.getRow(), tokenPositionBeforeDelete.getCol() - lengthOfNOT);
          insertFix = EditHelper.insertAt(file, tokenPosition, "NOT " );
        }
        else if(c.getChildren()[2].getFirstToken().getStr().toUpperCase() === "IN" || c.getChildren()[2].getFirstToken().getStr().toUpperCase() === "BETWEEN")
        {
          const tokenPositionBeforeDelete = c.getChildren()[1].getLastToken().getEnd();
          const tokenPosition = new Position(tokenPositionBeforeDelete.getRow(), tokenPositionBeforeDelete.getCol() - lengthOfNOT);
          insertFix = EditHelper.insertAt(file, tokenPosition, "NOT " );
        }
        else
        {
          issues.push(Issue.atToken(file, c.getFirstToken(), message, this.getMetadata().key, this.conf.severity));
          continue;
        }

        const endCol = c.getChildren()[0].getFirstToken().getEnd().getCol() + 1;
        const endPosition = new Position(c.getChildren()[0].getFirstToken().getEnd().getRow(), endCol);
        const deleteFix = EditHelper.deleteRange(file, c.getChildren()[0].getFirstToken().getStart(), endPosition);
        const finalFix = EditHelper.merge(deleteFix, insertFix);

        issues.push(Issue.atToken(file, c.getFirstToken(), message, this.getMetadata().key, this.conf.severity, finalFix));
      }
    }

    return issues;
  }

}
