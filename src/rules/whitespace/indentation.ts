import {Issue} from "../../issue";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {IObject} from "../../objects/_iobject";
import {Class} from "../../objects";
import {Registry} from "../../registry";
import {BasicRuleConfig} from "../_basic_rule_config";
import {IIndentationOptions} from "../../pretty_printer/indentation_options";
import {Indent} from "../../pretty_printer/indent";
import * as Statements from "../../abap/statements";
import * as Expressions from "../../abap/expressions";

export class IndentationConf extends BasicRuleConfig {
  public ignoreExceptions: boolean = true;
  public alignTryCatch: boolean = false;
  public globalClassSkipFirst: boolean = false;
  public ignoreGlobalClassDefinition: boolean = false;
  public ignoreGlobalInterface: boolean = false;
}

export class Indentation extends ABAPRule {
  private conf = new IndentationConf();

  public getKey(): string {
    return "indentation";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: IndentationConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _reg: Registry, obj: IObject) {

    let skip = false;

    if (file.getStructure() === undefined) {
      return []; // syntax error in file
    }

    if (obj instanceof Class) {
      const definition = obj.getClassDefinition();
      if (definition === undefined) {
        return [];
      } else if (this.conf.ignoreExceptions && definition.isException()) {
        return [];
      }
    }

    const indentOpts: IIndentationOptions = {
      alignTryCatch: this.conf.alignTryCatch,
      globalClassSkipFirst: this.conf.globalClassSkipFirst,
    };
    const indentOperation = new Indent(indentOpts);
    const expected = indentOperation.getExpectedIndents(file);

    for (const statement of file.getStatements()) {
      const indent = expected.shift();

      if (this.conf.ignoreGlobalClassDefinition) {
        if (statement.get() instanceof Statements.ClassDefinition
          && statement.findFirstExpression(Expressions.Global)) {
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
          && statement.findFirstExpression(Expressions.Global)) {
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

      if (indent && indent > 0 && indent !== position.getCol()) {
        const message = "Indentation problem, expected " + (indent - 1) + " spaces";
        const issue = Issue.atPosition(file, position, message, this.getKey());
        return [issue]; // only one finding per include
      }
    }

    return [];
  }
}