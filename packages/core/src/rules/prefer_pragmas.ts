import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {Comment} from "../abap/2_statements/statements/_statement";

export class PreferPragmasConf extends BasicRuleConfig {
  public check: {pseudo: string, pragma: string}[] = [
    {
      pseudo: "#EC CI_SUBRC",
      pragma: "SUBRC_OK",
    },
    {
      pseudo: "#EC NEEDED",
      pragma: "NEEDED",
    },
    {
      pseudo: "#EC NOTEXT",
      pragma: "NO_TEXT",
    },
    {
      pseudo: "#EC NO_HANDLER",
      pragma: "NO_HANDLER",
    },
  ];
}

export class PreferPragmas extends ABAPRule {
  private conf = new PreferPragmasConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "prefer_pragmas",
      title: "prefer pragmas over pseudo comments ",
      shortDescription: `prefer pragmas over pseudo comments `,
      extendedInformation: `https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#prefer-pragmas-to-pseudo-comments`,
      tags: [RuleTag.SingleFile, RuleTag.Styleguide],
      badExample: `DATA foo1 TYPE i. "#EC NEEDED`,
      goodExample: `DATA foo2 TYPE i ##NEEDED.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: PreferPragmasConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const config = this.getConfig();

    for (const statement of file.getStatements()) {
      if (!(statement.get() instanceof Comment)) {
        continue;
      }

      const concat = statement.concatTokens().toUpperCase();
      if (concat.includes("#EC") === false) {
        continue;
      }

      for (const check of config.check) {
        if (concat.includes(check.pseudo.toUpperCase())) {
          const message = `Prefer pragma ${check.pragma}`;
          issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.getConfig().severity));
        }
      }
    }

    return issues;
  }

}