import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {Comment, Empty, MacroContent, Unknown} from "../abap/2_statements/statements/_statement";

export class StatementLengthConf extends BasicRuleConfig {
  /** Maximum length of a statement in characters, measured on the condensed statement */
  public maxLength: number = 28000;
}

export class StatementLength extends ABAPRule {

  private conf = new StatementLengthConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "statement_length",
      title: "Statement length",
      shortDescription: `Detects statements exceeding the provided maximum length.`,
      extendedInformation: `A system refuses a statement that is too long, with the message
"The length of the current statement is greater than the allowed maximum length of 28 kilobytes".
A long method chain with literals reaches that: the file is valid, but cannot be activated.

The length is measured on the condensed statement: the tokens joined with a single space where the source
has whitespace between them, so indentation, line breaks, comments and pragmas do not count.
The content of literals counts as it is written.

The default of 28000 stays below the 28 kilobytes of the message.

For a chained statement each statement of the chain is measured by itself, including the part before the colon.
The content of macro definitions is not checked.`,
      tags: [RuleTag.Syntax, RuleTag.SingleFile],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: StatementLengthConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const statement of file.getStatements()) {
      const type = statement.get();
      if (type instanceof Comment
          || type instanceof Empty
          || type instanceof Unknown
          || type instanceof MacroContent) {
        continue;
      }

      // concatTokens() gives the condensed statement, a comment line inside a statement is a statement of its own
      const length = statement.concatTokens().length;
      if (length > this.conf.maxLength) {
        const message = `Reduce statement length to max ${this.conf.maxLength}, currently ${length}`;
        issues.push(Issue.atToken(file, statement.getFirstToken(), message, this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

}
