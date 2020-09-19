import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Select} from "../abap/2_statements/statements";
import {Version} from "../version";
import {RuleTag, IRuleMetadata} from "./_irule";

export class SQLEscapeHostVariablesConf extends BasicRuleConfig {
}

export class SQLEscapeHostVariables extends ABAPRule {
  private conf = new SQLEscapeHostVariablesConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "sql_escape_host_variables",
      title: "Escape SQL host variables",
      shortDescription: `Escape SQL host variables, from 740sp05`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#avoid-obsolete-language-elements`,
      tags: [RuleTag.Upport, RuleTag.Styleguide],
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

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    if (this.reg.getConfig().getVersion() < Version.v740sp02) {
      return [];
    }

    for (const s of file.getStatements()) {
      if (!(s.get() instanceof Select)) {
        continue;
      }

      const str = s.concatTokens().toUpperCase();
// this is not completely correct and does not catch all, but okay for now
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
    }

    return issues;
  }
}