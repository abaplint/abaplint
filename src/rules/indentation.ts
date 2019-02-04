import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {IObject} from "../objects/_iobject";
import {Class} from "../objects";
import {Registry} from "../registry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {PrettyPrinter, IndentationOptions} from "../abap/pretty_printer";

export class IndentationConf extends BasicRuleConfig {
  public ignoreExceptions: boolean = true;
  public alignTryCatch: boolean = false;
  public globalClassSkipFirst: boolean = false;
}

export class Indentation extends ABAPRule {
  private conf = new IndentationConf();

  public getKey(): string {
    return "indentation";
  }

  public getDescription(): string {
    return "Indentation";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: IndentationConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _reg: Registry, obj: IObject) {
    if (file.getStructure() == undefined) {
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

    const indentOpts: IndentationOptions = {
      alignTryCatch: this.conf.alignTryCatch,
      globalClassSkipFirst: this.conf.globalClassSkipFirst,
    };
    const expected = new PrettyPrinter(file, indentOpts).getExpectedIndentation();

    for (const statement of file.getStatements()) {
      const position = statement.getFirstToken().getPos();
      const indent = expected.shift();
      if (indent && indent > 0 && indent !== position.getCol()) {
        const issue = new Issue({file, message: this.getDescription(), key: this.getKey(), start: position});
        return [issue]; // only one finding per include
      }
    }

    return [];
  }
}