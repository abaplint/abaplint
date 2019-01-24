import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {StatementNode, ExpressionNode, TokenNode, TokenNodeRegex} from "../abap/nodes";
import {Position} from "../position";
import {Unknown, Comment, MacroContent, MacroCall, Statement} from "../abap/statements/_statement";
import {Identifier} from "../abap/tokens";
import {IObject} from "../objects/_iobject";
import {Registry} from "../registry";
import {Class} from "../objects";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ClassImplementation} from "../abap/statements";

export class KeywordsUpperConf extends BasicRuleConfig {
  public ignoreExceptions: boolean = true;
  public ignoreLowerClassImplmentationStatement: boolean = true;
}

export class KeywordsUpper extends ABAPRule {

  private conf = new KeywordsUpperConf();

  public getKey(): string {
    return "keywords_upper";
  }

  public getDescription(): string {
    return "Keywords upper case, other lower case";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: KeywordsUpperConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _reg: Registry, obj: IObject) {
    const issues: Issue[] = [];

    if (this.conf.ignoreExceptions && obj instanceof Class) {
      const definition = obj.getClassDefinition();
      if (definition === undefined || definition.isException()) {
        return [];
      }
    }

    for (const statement of file.getStatements()) {
      if (statement.get() instanceof Unknown
          || statement.get() instanceof MacroContent
          || statement.get() instanceof MacroCall
          || statement.get() instanceof Comment) {
        continue;
      }
      const position = this.traverse(statement, statement.get());
      if (position) {
        const issue = new Issue({file, message: this.getDescription(), key: this.getKey(), start: position});
        issues.push(issue);
        break; // one issue per file
      }
    }

    return issues;
  }

  private traverse(s: StatementNode | ExpressionNode, parent: Statement): Position | undefined {

    for (const child of s.getChildren()) {
      if (child instanceof TokenNodeRegex) {
        if (this.conf.ignoreLowerClassImplmentationStatement
            && parent instanceof ClassImplementation) {
          continue;
        }
        const str = child.get().getStr();
        if (str !== str.toLowerCase() && child.get() instanceof Identifier) {
          return child.get().getPos();
        }
      } else if (child instanceof TokenNode) {
        const str = child.get().getStr();
        if (str !== str.toUpperCase() && child.get() instanceof Identifier) {
          return child.get().getPos();
        }
      } else if (child instanceof ExpressionNode) {
        const pos = this.traverse(child, parent);
        if (pos) {
          return pos;
        }
      } else {
        throw new Error("traverseStatement, unexpected node type");
      }
    }

    return undefined;
  }

}