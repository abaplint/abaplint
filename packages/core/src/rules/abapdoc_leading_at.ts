import * as Statements from "../abap/2_statements/statements";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {Comment} from "../abap/2_statements/statements/_statement";

export class AbapdocLeadingAtConf extends BasicRuleConfig {
}

export class AbapdocLeadingAt extends ABAPRule {

  private conf = new AbapdocLeadingAtConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "abapdoc_leading_at",
      title: "ABAP Doc line starting with @",
      shortDescription: `Reports ABAP Doc lines starting with "@" which is not followed by a command.`,
      extendedInformation: `In ABAP Doc, "@" at the start of a line introduces a command, the commands are
@parameter, @raising and @exception. Any other text after a leading "@", like a CDS annotation,
gives the syntax warning 'A command was expected after ABAP Doc symbol "@"'.

An "@" in the middle of a line is plain text and not reported.

Only checks ABAP Doc inside class definitions and interfaces.`,
      tags: [RuleTag.SingleFile],
      badExample: `CLASS zcl_foo DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! the first of
    "! @UI.presentationVariant sortOrder
    DATA mv_sort_field TYPE string.
ENDCLASS.`,
      goodExample: `CLASS zcl_foo DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! the first of @UI.presentationVariant
    "! sortOrder
    DATA mv_sort_field TYPE string.
ENDCLASS.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: AbapdocLeadingAtConf) {
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
      const text = str.substring(2).trimStart();
      if (text.startsWith("@") === false
          || text.match(/^@(parameter|raising|exception)(\s|$)/i) !== null) {
        continue;
      }
      const message = `A command was expected after ABAP Doc symbol "@", move the "@" away from the start of the line`;
      issues.push(Issue.atToken(file, token, message, this.getMetadata().key, this.conf.severity));
    }

    return issues;
  }

}
