import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {ABAPFile, MemoryFile} from "../files";
import {IRegistry} from "../_iregistry";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPParser} from "../abap/abap_parser";
import {Unknown} from "../abap/2_statements/statements/_statement";
import {StatementNode} from "../abap/nodes";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";

export class DownportConf extends BasicRuleConfig {
}

export class Downport extends ABAPRule {

  private conf = new DownportConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "downport",
      title: "Downport statement",
      quickfix: false,
      shortDescription: `Experimental downport functionality`,
      extendedInformation: `
Much like the commented_code rule this rule loops through unknown statements and tries parsing with
a higher level language version. If successful, various rules are applied to downport the statement.`,
      tags: [RuleTag.Experimental, RuleTag.Downport],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: DownportConf): void {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _reg: IRegistry): readonly Issue[] {
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

    const code = s.concatTokens();

    const commented = new MemoryFile("_downport.prog.abap", code);
    const abapFile = new ABAPParser().parse([commented]).output[0];
    const statementNodes = abapFile.getStatements();
    if (statementNodes.length !== 1 || statementNodes[0].get() instanceof Unknown) {
      return;
    }

    const node = statementNodes[0];

    if (node.get() instanceof Statements.Move) {
      const found = node.findDirectExpression(Expressions.Source)?.findFirstExpression(Expressions.NewObject);
      if(found) {
        return Issue.atToken(file, s.getFirstToken(), "Use CREATE OBJECT instead of NEW", this.getMetadata().key);
      }
    }

    return undefined;
  }

}