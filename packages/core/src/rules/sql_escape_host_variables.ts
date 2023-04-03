import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Version} from "../version";
import {RuleTag, IRuleMetadata} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject} from "../objects/_abap_object";
import {EditHelper} from "../edit_helper";

export class SQLEscapeHostVariablesConf extends BasicRuleConfig {
}

export class SQLEscapeHostVariables extends ABAPRule {
  private conf = new SQLEscapeHostVariablesConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "sql_escape_host_variables",
      title: "Escape SQL host variables",
      shortDescription: `Escape SQL host variables, from 740sp05`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#avoid-obsolete-language-elements`,
      tags: [RuleTag.Upport, RuleTag.Styleguide, RuleTag.Quickfix],
      badExample: `SELECT * FROM tab INTO TABLE res WHERE field = val.`,
      goodExample: `SELECT * FROM tab INTO TABLE @res WHERE field = @val.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SQLEscapeHostVariablesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject) {
    const issues: Issue[] = [];

    const type = obj.getType();
    if (type === "INTF" || type === "TYPE") {
      return [];
    }

    if (this.reg.getConfig().getVersion() < Version.v740sp02
        && this.reg.getConfig().getVersion() !== Version.Cloud) {
      return [];
    }

    for (const s of file.getStatements()) {
      if (s.get() instanceof Statements.UpdateDatabase
          || s.get() instanceof Statements.ModifyDatabase
          || s.get() instanceof Statements.Select
          || s.get() instanceof Statements.SelectLoop
          || s.get() instanceof Statements.InsertDatabase
          || s.get() instanceof Statements.DeleteDatabase) {

        for (const o of s.findAllExpressions(Expressions.SQLSource)) {
          const first = o.getFirstChild();
          if ((first?.get() instanceof Expressions.Source && first.getChildren()[0].get() instanceof Expressions.FieldChain)
              || (first?.get() instanceof Expressions.SimpleSource3 && first.getChildren()[0].get() instanceof Expressions.FieldChain)) {
            const message = "Escape SQL host variables";
            const firstToken = o.getFirstChild()!.getFirstToken();
            const fix = EditHelper.replaceToken(file, firstToken, "@" + firstToken?.getStr());
            const issue = Issue.atToken(file, first.getFirstToken(), message, this.getMetadata().key, this.conf.severity, fix);
            issues.push(issue);
            break;
          }
        }

        for (const o of s.findAllExpressions(Expressions.SQLTarget)) {
          const escaped = o.findDirectTokenByText("@");
          if (escaped !== undefined) {
            continue;
          }

          const message = "Escape SQL host variables";
          const firstToken = o.getFirstChild()!.getFirstToken();
          const fix = EditHelper.replaceToken(file, firstToken, "@" + firstToken?.getStr());
          const issue = Issue.atToken(file, o.getFirstToken(), message, this.getMetadata().key, this.conf.severity, fix);
          issues.push(issue);
          break;
        }
      }
    }

    return issues;
  }
}