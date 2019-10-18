import {Issue} from "../../issue";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {IObject} from "../../objects/_iobject";
import {Class} from "../../objects";
import {Registry} from "../../registry";
import {BasicRuleConfig} from "../_basic_rule_config";
import * as Statements from "../../abap/statements";

/** Checks alignment within block statement declarations which span multiple lines, such as multiple conditions in IF statements.
 * Example:
 * IF 1 = 1 AND
 *    2 = 2.
 */
export class InStatementIndentationConf extends BasicRuleConfig {
  public ignoreExceptions: boolean = true;
}

export class InStatementIndentation extends ABAPRule {

  private conf = new InStatementIndentationConf();

  public getKey(): string {
    return "in_statement_indentation";
  }

  private getDescription(): string {
    return "Fix in-Statement Indentation.";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: InStatementIndentationConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _reg: Registry, obj: IObject) {
    const ret: Issue[] = [];

    if (obj instanceof Class) {
      const definition = obj.getClassDefinition();
      if (definition === undefined) {
        return [];
      } else if (this.conf.ignoreExceptions && definition.isException()) {
        return [];
      }
    }

    for (const s of file.getStatements()) {
      const tokens = s.getTokens();
      if (tokens.length === 0) {
        continue;
      }
      const beginLine = tokens[0].getRow();
      let expected = tokens[0].getCol() + 2;
      const type = s.get();
      if (type instanceof Statements.If
          || type instanceof Statements.While
          || type instanceof Statements.Module
          || type instanceof Statements.SelectLoop
          || type instanceof Statements.FunctionModule
          || type instanceof Statements.Do
          || type instanceof Statements.At
          || type instanceof Statements.Catch
          || type instanceof Statements.When
          || type instanceof Statements.Cleanup
          || type instanceof Statements.Loop
          || type instanceof Statements.Form
          || type instanceof Statements.Else
          || type instanceof Statements.ElseIf
          || type instanceof Statements.Method) {
        expected = expected + 2;
      }
      for (const t of tokens) {
        if (t.getRow() === beginLine) {
          continue;
        }
        if (t.getCol() < expected) {
          const issue = Issue.atToken(file, t, this.getDescription(), this.getKey());
          ret.push(issue);
          break;
        }
      }
    }

    return ret;
  }

}