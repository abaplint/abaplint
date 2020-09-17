import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {IObject} from "../objects/_iobject";
import {Class} from "../objects";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IIndentationOptions} from "../pretty_printer/indentation_options";
import {Indent} from "../pretty_printer/indent";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {IRuleMetadata, RuleTag} from "./_irule";
import {DDIC} from "../ddic";
import {Position, VirtualPosition} from "../position";
import {EditHelper} from "../edit_helper";

export class IndentationConf extends BasicRuleConfig {
  /** Ignore global exception classes */
  public ignoreExceptions: boolean = true;
  public alignTryCatch: boolean = false;
  public globalClassSkipFirst: boolean = false;
  public ignoreGlobalClassDefinition: boolean = false;
  public ignoreGlobalInterface: boolean = false;
}

export class Indentation extends ABAPRule {
  private conf = new IndentationConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "indentation",
      title: "Indentation",
      shortDescription: `Checks indentation`,
      tags: [RuleTag.Whitespace, RuleTag.Quickfix],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: IndentationConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: IObject) {

    let skip = false;

    if (file.getStructure() === undefined) {
      return []; // syntax error in file
    }

    const ddic = new DDIC(this.reg);

    if (obj instanceof Class) {
      const definition = obj.getClassDefinition();
      if (definition === undefined) {
        return [];
      } else if (this.conf.ignoreExceptions && ddic.isException(definition, obj)) {
        return [];
      }
    }

    const indentOpts: IIndentationOptions = {
      alignTryCatch: this.conf.alignTryCatch,
      globalClassSkipFirst: this.conf.globalClassSkipFirst,
    };

    const expected = new Indent(indentOpts).getExpectedIndents(file);

    for (const statement of file.getStatements()) {
      const indent = expected.shift();

      if (this.conf.ignoreGlobalClassDefinition) {
        if (statement.get() instanceof Statements.ClassDefinition
          && statement.findFirstExpression(Expressions.ClassGlobal)) {
          skip = true;
          continue;
        } else if (skip === true && statement.get() instanceof Statements.EndClass) {
          skip = false;
          continue;
        } else if (skip === true) {
          continue;
        }
      }

      if (this.conf.ignoreGlobalInterface) {
        if (statement.get() instanceof Statements.Interface
          && statement.findFirstExpression(Expressions.ClassGlobal)) {
          skip = true;
          continue;
        } else if (skip === true && statement.get() instanceof Statements.EndInterface) {
          skip = false;
          continue;
        } else if (skip === true) {
          continue;
        }
      }

      const position = statement.getFirstToken().getStart();
      if (position instanceof VirtualPosition) {
        continue;
      }

      if (indent && indent > 0 && indent !== position.getCol()) {
        const expected = indent - 1;
        const fix = EditHelper.replaceRange(file, new Position(position.getRow(), 1), position, " ".repeat(expected));
        const message = "Indentation problem, expected " + expected + " spaces";
        const issue = Issue.atPosition(file, position, message, this.getMetadata().key, this.conf.severity, fix);
        return [issue]; // only one finding per include
      }
    }

    return [];
  }
}