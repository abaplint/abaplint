import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {StatementNode, ExpressionNode, TokenNode, TokenNodeRegex} from "../abap/nodes";
import {Position} from "../position";
import {Unknown, Comment, MacroContent, MacroCall} from "../abap/statements/_statement";
import {Identifier} from "../abap/tokens";
import {IObject} from "../objects/_iobject";
import {Registry} from "../registry";
import {Class} from "../objects";


export class KeywordsUpperConf {
  public enabled: boolean = true;
  public ignoreExceptions: boolean = true;
}

export class KeywordsUpper extends ABAPRule {

  private conf = new KeywordsUpperConf();

  public getKey(): string {
    return "keywords_upper";
  }

  public getDescription(): string {
    return "Keywords upper case";
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
      const position = this.traverse(statement);
      if (position) {
        const issue = new Issue({file, message: this.getDescription(), code: this.getKey(), start: position});
        issues.push(issue);
        break; // one finding per file
      }
    }

    return issues;
  }

  private traverse(s: StatementNode | ExpressionNode): Position | undefined {

    for (const child of s.getChildren()) {
      if (child instanceof TokenNodeRegex) {
        continue;
      } else if (child instanceof TokenNode) {
        const str = child.get().getStr();
        if (str !== str.toUpperCase() && child.get() instanceof Identifier) {
          return child.get().getPos();
        }
      } else if (child instanceof ExpressionNode) {
        const pos = this.traverse(child);
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