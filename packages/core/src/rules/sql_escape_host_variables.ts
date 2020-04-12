import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Select} from "../abap/2_statements/statements";
import {IRegistry} from "../_iregistry";
import {Version} from "../version";

export class SQLEscapeHostVariablesConf extends BasicRuleConfig {
}

export class SQLEscapeHostVariables extends ABAPRule {
  private conf = new SQLEscapeHostVariablesConf();

  public getMetadata() {
    return {
      key: "sql_escape_host_variables",
      title: "Escape SQL host variables",
      quickfix: false,
      shortDescription: `Escape SQL host variables, from 740sp05 `,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SQLEscapeHostVariablesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, reg: IRegistry) {
    const issues: Issue[] = [];

    if (reg.getConfig().getVersion() < Version.v740sp02) {
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
          || str.includes(" APPENDING CORRESPONDING FIELDS OF TABLE @")) {
        continue;
      } else {
        const message = "Escape SQL host variables";
        const issue = Issue.atToken(file, s.getFirstToken(), message, this.getMetadata().key);
        issues.push(issue);
      }
    }

    return issues;
  }
}