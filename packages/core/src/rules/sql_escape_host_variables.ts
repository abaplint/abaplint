import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Version} from "../version";
import {RuleTag, IRuleMetadata} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject} from "../objects/_abap_object";

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

    if (obj.getType() === "INTF") {
      return [];
    }

    if (this.reg.getConfig().getVersion() < Version.v740sp02
        && this.reg.getConfig().getVersion() !== Version.Cloud) {
      return [];
    }

    for (const s of file.getStatements()) {
      const str = s.concatTokens().toUpperCase();
      if (s.get() instanceof Statements.Select
          || s.get() instanceof Statements.SelectLoop) {
// this is not completely correct and does not catch all, but okay for now
// todo: replace with logic from "else if" branch below, when/if it proves to work
        if (str.includes(" INTO ( @")
            || str.includes(" INTO (@")
            || str.includes(" INTO @")
            || str.includes(" INTO TABLE @")
            || str.includes(" INTO CORRESPONDING FIELDS OF @")
            || str.includes(" INTO CORRESPONDING FIELDS OF TABLE @")
            || str.includes(" APPENDING TABLE @")
            || ( str.includes(" APPENDING ") === false && str.includes(" INTO ") === false )
            || str.includes(" APPENDING CORRESPONDING FIELDS OF TABLE @")) {
          continue;
        } else {
          const message = "Escape SQL host variables";
          const issue = Issue.atToken(file, s.getFirstToken(), message, this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }
      } else if (s.get() instanceof Statements.UpdateDatabase
          || s.get() instanceof Statements.ModifyDatabase
          || s.get() instanceof Statements.InsertDatabase
          || s.get() instanceof Statements.DeleteDatabase) {
        for (const o of s.findAllExpressions(Expressions.SQLSource)) {
          const first = o.getFirstChild();
          if ((first?.get() instanceof Expressions.Source && first.getChildren()[0].get() instanceof Expressions.FieldChain)
              || (first?.get() instanceof Expressions.SimpleSource3 && first.getChildren()[0].get() instanceof Expressions.FieldChain)) {
            const message = "Escape SQL host variables";
            const issue = Issue.atToken(file, first.getFirstToken(), message, this.getMetadata().key, this.conf.severity);
            issues.push(issue);
            break;
          }
        }
      }
    }

    return issues;
  }
}