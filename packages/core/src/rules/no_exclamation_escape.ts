import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {EditHelper} from "../edit_helper";
import {Identifier} from "../abap/1_lexer/tokens";
import {ArtifactsABAP} from "../abap/artifacts";
import {Combi} from "../abap/2_statements/combi";

let keywords: Set<string> | undefined = undefined;

/** every word of the statement and expression grammar, upper case */
function getKeywords(): Set<string> {
  if (keywords === undefined) {
    const list: string[] = [];
    for (const stat of ArtifactsABAP.getStatements()) {
      list.push(...Combi.listKeywords(stat.getMatcher()));
    }
    for (const expr of ArtifactsABAP.getExpressions()) {
      list.push(...Combi.listKeywords(new expr().getRunnable()));
    }
    keywords = new Set<string>();
    for (const words of list) {
      // a WordSequence lists eg. "PREFERRED PARAMETER" or "IS-INITIAL" as one entry
      for (const word of words.replace(/-/g, " ").split(" ")) {
        if (word !== "") {
          keywords.add(word.toUpperCase());
        }
      }
    }
  }
  return keywords;
}

export class NoExclamationEscapeConf extends BasicRuleConfig {
}

export class NoExclamationEscape extends ABAPRule {
  private conf = new NoExclamationEscapeConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "no_exclamation_escape",
      title: "No exclamation escape",
      shortDescription: `Detects and removes exclamation marks (!) used to escape identifiers`,
      extendedInformation: `Exclamation marks are not needed when the identifier is not a keyword, or could be avoided by renaming.

An identifier named like an ABAP keyword is allowed to be escaped, eg. a method parameter "!default",
which the system otherwise reads as the DEFAULT addition of the parameter before it.`,
      tags: [RuleTag.SingleFile, RuleTag.Quickfix],
      badExample: "methods CONVERT changing !CO_sdf type ref to ZCL_sdf optional.",
      goodExample: "methods CONVERT changing CO_sdf type ref to ZCL_sdf optional.",
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: NoExclamationEscapeConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];

    for (const token of file.getTokens()) {
      if (token instanceof Identifier) {
        const str = token.getStr();
        if (str.startsWith("!")) {
          const replacement = str.substring(1);
          if (getKeywords().has(replacement.toUpperCase())) {
            continue;
          }
          const fix = EditHelper.replaceToken(file, token, replacement);
          issues.push(Issue.atToken(file, token, "Do not use exclamation mark to escape identifiers", this.getMetadata().key, this.conf.severity, fix));
        }
      }
    }

    return issues;
  }
}
