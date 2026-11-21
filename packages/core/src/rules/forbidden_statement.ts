import * as Statements from "../abap/2_statements/statements";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class ForbiddenStatementConf extends BasicRuleConfig {
  /** List of forbidden statements, given as abaplint statement names,
   * case insensitive, spaces, underscores and dashes are ignored,
   * so "READ TABLE", "ReadTable" and "read_table" are the same
   * @uniqueItems true
  */
  public statements: string[] = [];
}

export class ForbiddenStatement extends ABAPRule {

  private conf = new ForbiddenStatementConf();
  /** statement class -> configured spelling, used in the message */
  private forbidden = new Map<unknown, string>();

  public getMetadata(): IRuleMetadata {
    return {
      key: "forbidden_statement",
      title: "Forbidden Statement",
      shortDescription: `Forbid use of specified statements.`,
      extendedInformation: `Nothing is reported unless statements are configured.

A configured entry matches the abaplint statement with the same name, compared case insensitive,
ignoring spaces, underscores and dashes, so "READ TABLE", "ReadTable" and "read_table" all match ReadTable.

The names are the class names in https://github.com/abaplint/abaplint/tree/main/packages/core/src/abap/2_statements/statements,
some keywords are split into several statements, eg. "INSERT" does not match anything,
use "InsertInternal" or "InsertDatabase", likewise for DELETE, MODIFY and READ. Entries that do not match a statement are ignored.

Each part of a chained statement is checked as a separate statement.`,
      tags: [RuleTag.SingleFile],
      badExample: `* with "statements": ["READ TABLE"]
READ TABLE items INDEX 1 INTO item.`,
      goodExample: `* with "statements": ["READ TABLE"]
item = items[ 1 ].`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ForbiddenStatementConf): void {
    this.conf = conf;
    if (this.conf.statements === undefined) {
      this.conf.statements = [];
    }

    const byName = new Map<string, unknown>();
    for (const [name, value] of Object.entries(Statements)) {
      byName.set(ForbiddenStatement.normalize(name), value);
    }

    this.forbidden = new Map<unknown, string>();
    for (const entry of this.conf.statements) {
      const found = byName.get(ForbiddenStatement.normalize(entry));
      if (found !== undefined && this.forbidden.has(found) === false) {
        this.forbidden.set(found, entry.trim());
      }
    }
  }

  public runParsed(file: ABAPFile): Issue[] {
    if (this.forbidden.size === 0) {
      return [];
    }

    const ret: Issue[] = [];
    for (const s of file.getStatements()) {
      const name = this.forbidden.get(s.get().constructor);
      if (name !== undefined) {
        const message = "Statement \"" + name + "\" is forbidden";
        ret.push(Issue.atStatement(file, s, message, this.getMetadata().key, this.conf.severity));
      }
    }

    return ret;
  }

  private static normalize(name: string): string {
    return name.toLowerCase().replace(/[\s_-]/g, "");
  }

}
