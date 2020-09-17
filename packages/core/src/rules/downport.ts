import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {ABAPFile, MemoryFile} from "../files";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPParser} from "../abap/abap_parser";
import {Unknown} from "../abap/2_statements/statements/_statement";
import {StatementNode} from "../abap/nodes";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {IEdit, EditHelper} from "../edit_helper";
import {VirtualPosition} from "../position";

export class DownportConf extends BasicRuleConfig {
}

export class Downport extends ABAPRule {

  private conf = new DownportConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "downport",
      title: "Downport statement",
      shortDescription: `Experimental downport functionality`,
      extendedInformation: `
Much like the 'commented_code' rule this rule loops through unknown statements and tries parsing with
a higher level language version. If successful, various rules are applied to downport the statement.

Current rules:
* NEW transformed to CREATE OBJECT

The target version is the overall target version set in the main configuration file as syntax.version

Only one transformation is applied to a statement at a time, so multiple steps might be required to do the full downport.`,
      tags: [RuleTag.Experimental, RuleTag.Downport, RuleTag.Quickfix],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: DownportConf): void {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): readonly Issue[] {
    const ret: Issue[] = [];

    for (const s of file.getStatements()) {
      if (s.get() instanceof Unknown) {
        const issue = this.checkStatement(s, file);
        if (issue) {
          ret.push(issue);
        }
      }
    }

    return ret;
  }

////////////////////

  private checkStatement(s: StatementNode, file: ABAPFile): Issue | undefined {
    if (s.getFirstToken().getStart() instanceof VirtualPosition) {
      return undefined;
    }

    const code = new MemoryFile("_downport.prog.abap", this.buildCode(s));
    // note that this will take the default langauge vesion
    const abapFile = new ABAPParser().parse([code]).output[0];
    const statementNodes = abapFile.getStatements();
    if (statementNodes.length !== 1 || statementNodes[0].get() instanceof Unknown) {
      return;
    }

    const node = statementNodes[0];

    let found = this.newToCreateObject(node, file);
    if (found) {
      return found;
    }
    found = this.outlineData(node, file);
    if (found) {
      return found;
    }
    // todo, add more rules here

    return undefined;
  }

//////////////////////////////////////////

  private buildCode(s: StatementNode): string {
    // the tokens must be at the same position as the original file for easy reporting and building quick fix

    const rows: string[] = [];
    for(let i = 0; i < s.getLastToken().getRow(); i++){
      rows.push("");
    }

    for (const t of s.getTokens()) {
      const length = rows[t.getRow() - 1].length;
      rows[t.getRow() - 1] = rows[t.getRow() - 1] + " ".repeat(t.getCol() - length - 1);
      rows[t.getRow() - 1] = rows[t.getRow() - 1] + t.getStr();
    }

    const code = rows.join("\n");
    return code;
  }

  private outlineData(_node: StatementNode, _file: ABAPFile): Issue | undefined {
// todo
    return undefined;
  }

  private newToCreateObject(node: StatementNode, file: ABAPFile): Issue | undefined {
    if (node.get() instanceof Statements.Move) {
      const target = node.findDirectExpression(Expressions.Target);
      const source = node.findDirectExpression(Expressions.Source);
      const found = source?.findFirstExpression(Expressions.NewObject);

      let fix: IEdit | undefined = undefined;
      // must be at top level of the source for quickfix to work(todo: handle more scenarios)
      // todo, assumption: the target is not an inline definition
      if (source && target && found && source.getFirstToken().getStart().equals(found.getFirstToken().getStart())) {
        const type = found.findDirectExpression(Expressions.TypeNameOrInfer);
        let extra = type?.concatTokens() === "#" ? "" : " TYPE " + type?.concatTokens();

        const parameters = found.findFirstExpression(Expressions.ParameterListS);
        extra = parameters ? extra + " EXPORTING " + parameters.concatTokens() : extra;

        const abap = `CREATE OBJECT ${target.concatTokens()}${extra}.`;
        fix = EditHelper.replaceRange(file, node.getFirstToken().getStart(), node.getLastToken().getEnd(), abap);
      }

      if (found) {
        return Issue.atToken(file, node.getFirstToken(), "Use CREATE OBJECT instead of NEW", this.getMetadata().key, this.conf.severity, fix);
      }
    }

    return undefined;
  }

}