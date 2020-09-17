import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {StatementNode, ExpressionNode, TokenNode, TokenNodeRegex} from "../abap/nodes";
import {Unknown, Comment, MacroContent, MacroCall, IStatement} from "../abap/2_statements/statements/_statement";
import {Identifier} from "../abap/1_lexer/tokens";
import {IObject} from "../objects/_iobject";
import {Class} from "../objects";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Token} from "../abap/1_lexer/tokens/_token";
import {IRuleMetadata, RuleTag} from "./_irule";
import {DDIC} from "../ddic";
import {VirtualPosition} from "../position";

export enum KeywordCaseStyle {
  Upper = "upper",
  Lower = "lower",
}

export class KeywordCaseConf extends BasicRuleConfig {
  public style: KeywordCaseStyle = KeywordCaseStyle.Upper;
  /** Ignore global exception classes */
  public ignoreExceptions: boolean = true;
  public ignoreLowerClassImplmentationStatement: boolean = true;
  public ignoreGlobalClassDefinition: boolean = false;
  public ignoreGlobalInterface: boolean = false;
  public ignoreFunctionModuleName: boolean = false;
  // this ignores keywords in CLASS/ENDCLASS statements of a global class (and only in them, the rest is checked)
  public ignoreGlobalClassBoundaries: boolean = false;

  /** A list of keywords to be ignored */
  public ignoreKeywords: string[] = [];
}

export class KeywordCase extends ABAPRule {
  private conf = new KeywordCaseConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "keyword_case",
      title: "Keyword case",
      shortDescription: `Checks that keywords have the same case. Non-keywords must be lower case.`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#use-your-pretty-printer-team-settings`,
      tags: [RuleTag.Styleguide],
    };
  }

  private getDescription(tokenValue: string, keyword: boolean): string {
    if (keyword === true) {
      return `Keyword should be ${this.conf.style} case: "${tokenValue}"`;
    } else {
      return `Identifiers should be lower case: "${tokenValue}"`;
    }
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: KeywordCaseConf) {
    this.conf = conf;
    if (this.conf === undefined) {
      this.conf = new KeywordCaseConf();
    }
    if (this.conf.style === undefined) {
      this.conf = new KeywordCaseConf();
    }
    if (this.conf.ignoreExceptions === undefined) {
      this.conf.ignoreExceptions = new KeywordCaseConf().ignoreExceptions;
    }
  }

  public runParsed(file: ABAPFile, obj: IObject) {
    const issues: Issue[] = [];
    let skip = false;
    let isGlobalClass = false;

    const ddic = new DDIC(this.reg);

    if (this.conf.ignoreExceptions && obj instanceof Class) {
      const definition = obj.getClassDefinition();
      if (definition === undefined || ddic.isException(definition, obj)) {
        return [];
      }
    }

    for (const statement of file.getStatements()) {
      if (statement.get() instanceof Unknown
        || statement.get() instanceof MacroContent
        || statement.get() instanceof MacroCall
        || statement.getFirstToken().getStart() instanceof VirtualPosition
        || statement.get() instanceof Comment) {
        continue;
      }

      if (this.conf.ignoreGlobalClassBoundaries) {
        const node = statement.get();
        if (node instanceof Statements.ClassDefinition && statement.findFirstExpression(Expressions.ClassGlobal)) {
          isGlobalClass = true;
          continue;
        } else if (isGlobalClass === true
          && (node instanceof Statements.EndClass || node instanceof Statements.ClassImplementation)) {
          continue;
        }
      }

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

      const result = this.traverse(statement, statement.get());
      if (result.token) {
        const issue = Issue.atToken(
          file, result.token,
          this.getDescription(result.token.getStr(), result.keyword),
          this.getMetadata().key,
          this.conf.severity);
        issues.push(issue);
        break; // one issue per file
      }
    }

    return issues;
  }

  private traverse(s: StatementNode | ExpressionNode, parent: IStatement): {token: Token | undefined, keyword: boolean;} {

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
        if (this.violatesRule(str) && child.get() instanceof Identifier) {
          return {token: child.get(), keyword: true};
        }
      } else if (child instanceof ExpressionNode) {
        const tok = this.traverse(child, parent);
        if (tok.token !== undefined) {
          return tok;
        }
      } else {
        throw new Error("traverseStatement, unexpected node type");
      }
    }

    return {token: undefined, keyword: false};
  }

  public violatesRule(keyword: string): boolean {
    if (this.conf.ignoreKeywords && this.conf.ignoreKeywords.map(k => {return k.toUpperCase();}).includes(keyword.toUpperCase())) {
      return false;
    }
    if (this.conf.style === KeywordCaseStyle.Lower) {
      return keyword !== keyword.toLowerCase();
    } else if (this.conf.style === KeywordCaseStyle.Upper) {
      return keyword !== keyword.toUpperCase();
    }

    return false;
  }

}