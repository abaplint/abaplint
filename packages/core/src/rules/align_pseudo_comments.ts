import {ABAPFile} from "../abap/abap_file";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {Issue} from "../issue";
import {Comment} from "../abap/2_statements/statements/_statement";
import {Position} from "../position";
import {EditHelper, IEdit} from "../edit_helper";

export class AlignPseudoCommentsConf extends BasicRuleConfig {
}

export class AlignPseudoComments extends ABAPRule {
  private conf = new AlignPseudoCommentsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "align_pseudo_comments",
      title: "Align pseudo comments",
      shortDescription: `Align code inspector pseudo comments in statements`,
      tags: [RuleTag.SingleFile, RuleTag.Whitespace, RuleTag.Quickfix],
      badExample: `WRITE 'sdf'. "#EC sdf`,
      goodExample: `WRITE 'sdf'.                                                "#EC sdf`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: AlignPseudoCommentsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    let previousEnd: Position | undefined = undefined;

    for (const statement of file.getStatements()) {
      if (!(statement.get() instanceof Comment)) {
        previousEnd = statement.getLastToken().getEnd();
        continue;
      }
      const commentLength = statement.concatTokens().length;
      const firstCommentToken = statement.getFirstToken();
      if (firstCommentToken.getStr().startsWith(`"#`) === false) {
        continue;
      } else if (previousEnd === undefined) {
        continue;
      }

      let expectedColumn = 61;
      if (commentLength > 10) {
        expectedColumn = 72 - commentLength;
      }

      const col = firstCommentToken.getStart().getCol();
      if (previousEnd.getCol() < expectedColumn && col !== expectedColumn) {
        let fix: IEdit | undefined = undefined;
        if (col < expectedColumn) {
          fix = EditHelper.insertAt(file, firstCommentToken.getStart(), " ".repeat(expectedColumn - col));
        } else {
          const from = new Position(firstCommentToken.getStart().getRow(), expectedColumn);
          fix = EditHelper.deleteRange(file, from, firstCommentToken.getStart());
        }
        const message = "Align pseudo comment to column " + expectedColumn;
        issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity, fix));
      }
    }

    return issues;
  }

}
