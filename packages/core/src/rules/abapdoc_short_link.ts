import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject} from "../objects/_abap_object";
import {Comment} from "../abap/2_statements/statements/_statement";
import {Position} from "../position";
import {EditHelper} from "../edit_helper";

export class AbapdocShortLinkConf extends BasicRuleConfig {
}

export class AbapdocShortLink extends ABAPRule {

  private conf = new AbapdocShortLinkConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "abapdoc_short_link",
      title: "Use short form of ABAP Doc links",
      shortDescription: `Reports ABAP Doc links to components of the current global class or interface which repeat the object name.`,
      extendedInformation: `Links to components of the same repository object can omit the object name and start with a period,
{@link zif_foo.data:field} can be written as {@link .data:field}.

Only checks ABAP Doc inside the definition of the global class or interface.

https://github.com/SAP/abap-file-formats/issues/880`,
      tags: [RuleTag.SingleFile, RuleTag.Quickfix],
      badExample: `INTERFACE zif_foo PUBLIC.
  "! Same as {@link zif_foo.data:bar}
  DATA foo TYPE string.
  DATA bar TYPE string.
ENDINTERFACE.`,
      goodExample: `INTERFACE zif_foo PUBLIC.
  "! Same as {@link .data:bar}
  DATA foo TYPE string.
  DATA bar TYPE string.
ENDINTERFACE.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: AbapdocShortLinkConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject): Issue[] {
    const issues: Issue[] = [];

    const objectType = obj.getType();
    if (objectType !== "CLAS" && objectType !== "INTF") {
      return [];
    }
    const objectName = obj.getName().toLowerCase();

    let definition = false;
    for (const statement of file.getStatements()) {
      const type = statement.get();
      if (type instanceof Statements.ClassDefinition || type instanceof Statements.Interface) {
        const name = statement.findFirstExpression(Expressions.ClassName)
          ?? statement.findFirstExpression(Expressions.InterfaceName);
        definition = name?.getFirstToken().getStr().toLowerCase() === objectName;
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
      const regex = /\{@link\s+((?:(\w+):)?([\w/]+))\./gi;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(str)) !== null) {
        const kind = match[2];
        if (match[3].toLowerCase() !== objectName
            || (kind !== undefined && kind.toLowerCase() !== objectType.toLowerCase())) {
          continue;
        }
        const row = token.getStart().getRow();
        const col = token.getStart().getCol() + match.index + match[0].length - 1 - match[1].length;
        const start = new Position(row, col);
        const end = new Position(row, col + match[1].length);
        const fix = EditHelper.deleteRange(file, start, end);
        const message = `Use short form of ABAP Doc link, remove "${match[1]}"`;
        issues.push(Issue.atRange(file, start, end, message, this.getMetadata().key, this.conf.severity, fix));
      }
    }

    return issues;
  }

}
