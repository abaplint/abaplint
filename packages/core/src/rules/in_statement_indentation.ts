import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {IObject} from "../objects/_iobject";
import {Class} from "../objects";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Statements from "../abap/2_statements/statements";
import {IRuleMetadata, RuleTag} from "./_irule";
import {DDIC} from "../ddic";
import {Unknown, Comment, NativeSQL} from "../abap/2_statements/statements/_statement";
import {EditHelper} from "../edit_helper";
import {Position} from "../position";
import {ABAPFile} from "../abap/abap_file";

export class InStatementIndentationConf extends BasicRuleConfig {
  /** Additional indent for first statement of blocks */
  public blockStatements: number = 2;
  /** Ignore global exception classes */
  public ignoreExceptions: boolean = true;
}

export class InStatementIndentation extends ABAPRule {

  private conf = new InStatementIndentationConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "in_statement_indentation",
      title: "In-statement indentation",
      shortDescription: "Checks alignment within statements which span multiple lines.",
      extendedInformation: `Lines following the first line should be indented once (2 spaces).

For block declaration statements, lines after the first should be indented an additional time (default: +2 spaces)
to distinguish them better from code within the block.`,
      badExample: `IF 1 = 1
  AND 2 = 2.
  WRITE 'hello' &&
  'world'.
ENDIF.`,
      goodExample: `IF 1 = 1
    AND 2 = 2.
  WRITE 'hello' &&
    'world'.
ENDIF.`,
      tags: [RuleTag.Whitespace, RuleTag.Quickfix, RuleTag.SingleFile],
    };
  }

  private getMessage(): string {
    return "Fix in-statement indentation";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: InStatementIndentationConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: IObject) {
    const ret: Issue[] = [];

    const ddic = new DDIC(this.reg);

    if (obj instanceof Class) {
      const definition = obj.getClassDefinition();
      if (definition === undefined) {
        return [];
      } else if (this.conf.ignoreExceptions && ddic.isException(definition, obj)) {
        return [];
      }
    }

    for (const s of file.getStatements()) {
      if (s.get() instanceof Comment
          || s.get() instanceof Unknown
          || s.get() instanceof NativeSQL) {
        continue;
      }

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
          || type instanceof Statements.Case
          || type instanceof Statements.When
          || type instanceof Statements.Cleanup
          || type instanceof Statements.Loop
          || type instanceof Statements.Form
          || type instanceof Statements.Else
          || type instanceof Statements.ElseIf
          || type instanceof Statements.MethodImplementation) {
        expected = expected + this.conf.blockStatements;
      }
      for (const t of tokens) {
        if (t.getRow() === beginLine) {
          continue;
        }
        if (t.getCol() < expected) {
          const fix = EditHelper.replaceRange(file, new Position(t.getRow(), 1), t.getStart(), " ".repeat(expected - 1));
          const issue = Issue.atToken(file, t, this.getMessage(), this.getMetadata().key, this.conf.severity, fix);
          ret.push(issue);
          break;
        }
      }
    }

    return ret;
  }

}
