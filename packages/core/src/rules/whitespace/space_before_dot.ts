import {Issue} from "../../issue";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {BasicRuleConfig} from "../_basic_rule_config";
import * as Statements from "../../abap/2_statements/statements";
import {Class, Interface} from "../../objects";
import {IObject} from "../../objects/_iobject";
import {IRegistry} from "../../_iregistry";
import {Punctuation} from "../../abap/1_lexer/tokens";
import {Token} from "../../abap/1_lexer/tokens/_token";

export class SpaceBeforeDotConf extends BasicRuleConfig {
  public ignoreGlobalDefinition: boolean = true;
  public ignoreExceptions: boolean = true;
}

export class SpaceBeforeDot extends ABAPRule {

  private conf = new SpaceBeforeDotConf();

  public getMetadata() {
    return {
      key: "space_before_dot",
      title: "Space before dot",
      quickfix: false,
      shortDescription: `Checks for extra spaces before dots at the ends of statements`,
    };
  }

  private getMessage(): string {
    return "Remove space before \",\" or \".\"";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SpaceBeforeDotConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _reg: IRegistry, obj: IObject) {
    const issues: Issue[] = [];
    let prev: Token | undefined = undefined;
    let startRow = 0;

    if (file.getStructure() === undefined) {
      // some parser error exists in file
      return [];
    }

    if (this.conf.ignoreGlobalDefinition) {
      const structure = file.getStructure();
      if (obj instanceof Class && structure !== undefined) {
        const endclass = structure.findFirstStatement(Statements.EndClass);
        if (endclass !== undefined) {
          startRow = endclass.getFirstToken().getRow();
        }
        const definition = obj.getClassDefinition2();
        if (definition !== undefined && this.conf.ignoreExceptions && definition.isException) {
          return [];
        }
      } else if (obj instanceof Interface && structure !== undefined) {
        const endinterface = structure.findFirstStatement(Statements.EndInterface);
        if (endinterface !== undefined) {
          startRow = endinterface.getFirstToken().getRow();
        }
      }
    }

    for (const t of file.getTokens()) {
      if (t.getRow() < startRow) {
        continue;
      }

      if (prev !== undefined && t instanceof Punctuation && prev.getCol() + prev.getStr().length < t.getCol()) {
        const issue = Issue.atRowRange(file, t.getStart().getRow(),
                                       prev.getEnd().getCol(), t.getStart().getCol(),
                                       this.getMessage(), this.getMetadata().key);
        issues.push(issue);
      }
      prev = t;
    }

    return issues;
  }

}