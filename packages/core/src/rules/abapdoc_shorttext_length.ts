import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {Comment} from "../abap/2_statements/statements/_statement";
import {AbstractToken} from "../abap/1_lexer/tokens/abstract_token";

export class AbapdocShorttextLengthConf extends BasicRuleConfig {
}

const MAX_LENGTH = 60;

export class AbapdocShorttextLength extends ABAPRule {

  private conf = new AbapdocShorttextLengthConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "abapdoc_shorttext_length",
      title: "ABAP Doc shorttext too long",
      shortDescription: `Reports ABAP Doc shorttexts longer than 60 characters.`,
      extendedInformation: `A shorttext is written as <p class="shorttext">...</p> or
<p class="shorttext synchronized">...</p>, the system warns "Shorttext must not exceed 60 characters."
if the text is longer.

The text may span several "! lines, line breaks count as one blank. Leading and trailing blanks are not counted,
an entity like &lt; counts as one character.`,
      tags: [RuleTag.SingleFile],
      badExample: `INTERFACE zif_foo PUBLIC.
  "! <p class="shorttext synchronized">Returns the name of the selected row in the table of the view</p>
  METHODS name RETURNING VALUE(result) TYPE string.
ENDINTERFACE.`,
      goodExample: `INTERFACE zif_foo PUBLIC.
  "! <p class="shorttext synchronized">Returns the name of the selected row</p>
  METHODS name RETURNING VALUE(result) TYPE string.
ENDINTERFACE.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: AbapdocShorttextLengthConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];

    let block: AbstractToken[] = [];
    for (const statement of file.getStatements()) {
      const token = statement.getFirstToken();
      const doc = statement.get() instanceof Comment && token.getStr().startsWith(`"!`);
      const previous = block[block.length - 1];
      if (doc === false || (previous !== undefined && token.getStart().getRow() !== previous.getStart().getRow() + 1)) {
        issues.push(...this.checkBlock(file, block));
        block = [];
      }
      if (doc === true) {
        block.push(token);
      }
    }
    issues.push(...this.checkBlock(file, block));

    return issues;
  }

  private checkBlock(file: ABAPFile, block: AbstractToken[]): Issue[] {
    const issues: Issue[] = [];
    if (block.length === 0) {
      return issues;
    }

    const text = block.map(t => t.getStr().substring(2)).join("\n");
    const regex = /<p\s[^>]*class\s*=\s*"shorttext(?:\s+synchronized)?"[^>]*>([\s\S]*?)<\/p>/gi;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const length = this.decode(match[1].replace(/\s+/g, " ").trim()).length;
      if (length <= MAX_LENGTH) {
        continue;
      }
      const token = block[text.substring(0, match.index).split("\n").length - 1];
      const message = `Shorttext must not exceed ${MAX_LENGTH} characters, found ${length}`;
      issues.push(Issue.atToken(file, token, message, this.getMetadata().key, this.conf.severity));
    }

    return issues;
  }

  private decode(text: string): string {
    return text.replace(/&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);/g, "_");
  }

}
