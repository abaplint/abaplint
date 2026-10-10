import * as Statements from "../abap/2_statements/statements";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {Comment} from "../abap/2_statements/statements/_statement";
import {Position} from "../position";

export class AbapdocHtmlTagConf extends BasicRuleConfig {
}

const ALLOWED = new Set(["p", "em", "strong", "ul", "ol", "li", "br", "h1", "h2", "h3"]);

export class AbapdocHtmlTag extends ABAPRule {

  private conf = new AbapdocHtmlTagConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "abapdoc_html_tag",
      title: "Unsupported HTML tag in ABAP Doc",
      shortDescription: `Reports tag-like tokens in ABAP Doc which are not ABAP Doc HTML tags.`,
      extendedInformation: `ABAP Doc is parsed as HTML, a field symbol or a placeholder written as <name> is an
unsupported and unclosed tag, the system warns and the rendered documentation drops the word.

Supported tags are p, em, strong, ul, ol, li, br, h1, h2 and h3, also as closing tags and with attributes.

Write &lt;name&gt; to show the angle brackets. A "<" which is not followed by a letter, like "a < b", is not reported.

Only checks ABAP Doc inside class definitions and interfaces.`,
      tags: [RuleTag.SingleFile],
      badExample: `INTERFACE zif_foo PUBLIC.
  "! Returns the <name> of the selected row
  METHODS name RETURNING VALUE(result) TYPE string.
ENDINTERFACE.`,
      goodExample: `INTERFACE zif_foo PUBLIC.
  "! Returns the &lt;name&gt; of the selected row
  METHODS name RETURNING VALUE(result) TYPE string.
ENDINTERFACE.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: AbapdocHtmlTagConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];

    let definition = false;
    for (const statement of file.getStatements()) {
      const type = statement.get();
      if (type instanceof Statements.ClassDefinition || type instanceof Statements.Interface) {
        definition = true;
        continue;
      } else if (type instanceof Statements.EndClass || type instanceof Statements.EndInterface) {
        definition = false;
        continue;
      } else if (definition === false || !(type instanceof Comment)) {
        continue;
      }
      const token = statement.getFirstToken();
      const str = token.getStr();
      if (str.startsWith(`"!`) === false) {
        continue;
      }
      const regex = /<\/?([a-zA-Z][\w-]*)(\s[^<>]*)?\/?>/g;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(str)) !== null) {
        const name = match[1];
        if (ALLOWED.has(name.toLowerCase())) {
          continue;
        }
        const row = token.getStart().getRow();
        const col = token.getStart().getCol() + match.index;
        const start = new Position(row, col);
        const end = new Position(row, col + match[0].length);
        const message = `HTML tag <${name}> is not supported in ABAP Doc, write &lt;${name}&gt;`;
        issues.push(Issue.atRange(file, start, end, message, this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

}
