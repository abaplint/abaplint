import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {EditHelper, IEdit} from "../edit_helper";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {Statements, Version} from "..";
import {StatementNode} from "../abap/nodes/statement_node";

export class PreferRaiseExceptionNewConf extends BasicRuleConfig {
}

export class PreferRaiseExceptionNew extends ABAPRule {

  private conf = new PreferRaiseExceptionNewConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "prefer_raise_exception_new",
      title: "Prefer RAISE EXCEPTION NEW to RAISE EXCEPTION TYPE",
      shortDescription: `Prefer RAISE EXCEPTION NEW to RAISE EXCEPTION TYPE`,
      extendedInformation: `
      https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#prefer-raise-exception-new-to-raise-exception-type`,
      tags: [RuleTag.Styleguide, RuleTag.SingleFile, RuleTag.Quickfix],
      goodExample: `RAISE EXCEPTION NEW cx_generation_error( previous = exception ).`,
      badExample: `RAISE EXCEPTION TYPE cx_generation_error
  EXPORTING
    previous = exception.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: PreferRaiseExceptionNewConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    if (this.reg.getConfig().getVersion() < Version.v752) {
      return[];
    }

    const issues: Issue[] = [];

    for (const statement of file.getStatements()) {
      if (statement.get() instanceof Statements.Raise) {
        const concat = statement.concatTokens().toUpperCase();
        if (concat.includes(" MESSAGE")) {
          continue;
        }
        if (concat.startsWith("RAISE EXCEPTION TYPE ")) {
          const message = "Prefer RAISE EXCEPTION NEW to RAISE EXCEPTION TYPE";

          const fix = this.getFix(file, statement, concat.includes(" EXPORTING" ) ? true : false);

          issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity, fix));
        }
      }
    }

    return issues;
  }

  private getFix(file: ABAPFile, statement: StatementNode, withExporting: boolean): IEdit {
    const children = statement.getChildren();

    let contentFix = undefined;
    if (withExporting) {
      const fixText = "( " + children[5].concatTokens() + " ).";
      contentFix = EditHelper.replaceRange(file, children[3].getLastToken().getEnd(), statement.getEnd(), fixText);
    }
    else {
      contentFix = EditHelper.replaceRange(file, children[3].getLastToken().getEnd(), statement.getEnd(), "( ).");
    }

    const replaceType = EditHelper.replaceToken(file, children[2].getFirstToken(), "NEW");
    return EditHelper.merge(contentFix, replaceType);
  }
}
