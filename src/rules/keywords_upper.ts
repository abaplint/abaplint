import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {StatementNode, ExpressionNode, TokenNode, TokenNodeRegex} from "../abap/nodes";
import {Unknown, Comment, MacroContent, MacroCall, Statement} from "../abap/statements/_statement";
import {Identifier} from "../abap/tokens";
import {IObject} from "../objects/_iobject";
import {Registry} from "../registry";
import {Class} from "../objects";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Statements from "../abap/statements";
import * as Expressions from "../abap/expressions";
import {Token} from "../abap/tokens/_token";

/** Detects keywords which are not uppercased. */
export class KeywordsUpperConf extends BasicRuleConfig {
  public ignoreExceptions: boolean = true;
  public ignoreLowerClassImplmentationStatement: boolean = true;
  public ignoreGlobalClassDefinition: boolean = false;
  public ignoreGlobalInterface: boolean = false;
  public ignoreFunctionModuleName: boolean = false;
}

export class KeywordsUpper extends ABAPRule {

  private conf = new KeywordsUpperConf();

  public getKey(): string {
    return "keywords_upper";
  }

  public getDescription(tokenValue: string, keyword: boolean): string {
    if (keyword === true) {
      return "Keyword should be upper case: " + tokenValue;
    } else {
      return "Identifiers should be lower case: " + tokenValue;
    }
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: KeywordsUpperConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _reg: Registry, obj: IObject) {
    const issues: Issue[] = [];
    let skip = false;

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

      const result = this.traverse(statement, statement.get());
      if (result.token) {
        const issue = new Issue({
          file,
          message: this.getDescription(result.token.getStr(), result.keyword),
          key: this.getKey(),
          start: result.token.getStart(),
          end: result.token.getEnd()});
        issues.push(issue);
        break; // one issue per file
      }
    }

    return issues;
  }

  private traverse(s: StatementNode | ExpressionNode, parent: Statement): {token: Token | undefined, keyword: boolean} {

    for (const child of s.getChildren()) {
      if (child instanceof TokenNodeRegex) {
        if (this.conf.ignoreLowerClassImplmentationStatement
            && parent instanceof Statements.ClassImplementation) {
          continue;
        }
        const str = child.get().getStr();
        // todo, this is a hack, the parser should recongize OTHERS as a keyword
        if (str.toUpperCase() === "OTHERS" || str.toUpperCase() === "TEXT") {
          continue;
        }
        // todo, this is a hack, the parser should recigize SCREEN as a keyword
        if (parent instanceof Statements.Loop && str.toUpperCase() === "SCREEN") {
          continue;
        }
        if (this.conf.ignoreFunctionModuleName === true
            && parent instanceof Statements.FunctionModule && str.toUpperCase() !== "FUNCTION") {
          continue;
        }
        if (parent instanceof Statements.ModifyInternal && str.toUpperCase() === "SCREEN") {
          continue;
        }
        // todo
        if (parent instanceof Statements.FieldSymbol || parent instanceof Statements.Type) {
          continue;
        }
        if (str !== str.toLowerCase() && child.get() instanceof Identifier) {
          return {token: child.get(), keyword: false};
        }
      } else if (child instanceof TokenNode) {
        const str = child.get().getStr();
        if (str !== str.toUpperCase() && child.get() instanceof Identifier) {
          return {token: child.get(), keyword: true};
        }
      } else if (child instanceof ExpressionNode) {
        const tok = this.traverse(child, parent);
        if (tok) {
          return tok;
        }
      } else {
        throw new Error("traverseStatement, unexpected node type");
      }
    }

    return {token: undefined, keyword: false};
  }

}