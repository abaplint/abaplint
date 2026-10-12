import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";

export class GenericRegexConf extends BasicRuleConfig {
  /** List of forbidden regular expressions, case insensitive, checked against each line of every file.
   * Patterns use JavaScript regex syntax without enclosing slashes or flags.
   * @uniqueItems true
   */
  public regexes: string[] = [];
}

export class GenericRegex implements IRule {
  private conf = new GenericRegexConf();
  private regexes: RegExp[] = [];

  public getMetadata(): IRuleMetadata {
    return {
      key: "generic_regex",
      title: "Generic regex",
      shortDescription: "Report an issue for each match of a configured regular expression.",
      extendedInformation: `Checks each line of every object file, including comments, strings, and XML.
Patterns use JavaScript regular expression syntax without enclosing slashes or flags.
Matching is case insensitive and does not span multiple lines. Each non-overlapping match is reported.
Use the standard exclude configuration to skip files.

Example configuration: \`{"generic_regex": {"regexes": ["TODO", "BREAK-POINT"]}}\``,
      tags: [RuleTag.SingleFile],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: GenericRegexConf): void {
    this.conf = Object.assign(new GenericRegexConf(), conf);
    this.conf.regexes = this.conf.regexes ?? [];
  }

  public initialize(_reg: IRegistry) {
    this.regexes = this.conf.regexes.map(pattern => {
      try {
        return new RegExp(pattern, "gi");
      } catch {
        throw new Error(`generic_regex: Invalid regular expression "${pattern}"`);
      }
    });
    return this;
  }

  public run(obj: IObject): Issue[] {
    const issues: Issue[] = [];
    if (this.regexes.length === 0) {
      return issues;
    }

    for (const file of obj.getFiles()) {
      const rows = file.getRawRows();
      for (let row = 0; row < rows.length; row++) {
        const text = rows[row].replace(/\r$/, "");
        for (const regex of this.regexes) {
          regex.lastIndex = 0;
          for (;;) {
            const match = regex.exec(text);
            if (match === null) {
              break;
            }
            const startCol = match.index + 1;
            const message = `Text matches forbidden regular expression "${regex.source}"`;
            issues.push(Issue.atRowRange(file, row + 1, startCol, startCol + match[0].length,
                                         message, this.getMetadata().key, this.conf.severity));
            if (match[0].length === 0) {
              regex.lastIndex++;
            }
          }
        }
      }
    }
    return issues;
  }
}
