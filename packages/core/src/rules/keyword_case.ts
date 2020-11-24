import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
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
import {ABAPFile} from "../abap/abap_file";
import {EditHelper, IEdit} from "../edit_helper";
import {IFile} from "../files/_ifile";

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

class Skip {
  private readonly conf: KeywordCaseConf;
  private skip = false;
  private isGlobalClass = false;
  private isGlobalIf = false;

  public constructor(conf: KeywordCaseConf) {
    this.conf = conf;
  }

  public skipStatement(statement: StatementNode): boolean {
    const get = statement.get();
    if (get instanceof Unknown
      || get instanceof MacroContent
      || get instanceof MacroCall
      || statement.getFirstToken().getStart() instanceof VirtualPosition
      || get instanceof Comment) {
      return true;
    }

    if (this.conf.ignoreGlobalClassBoundaries) {
      const node = get;
      if (node instanceof Statements.Interface && statement.findFirstExpression(Expressions.ClassGlobal)) {
        this.isGlobalIf = true;
        return true;
      } else if (this.isGlobalIf === true && node instanceof Statements.EndInterface) {
        return true;
      }
      if (node instanceof Statements.ClassDefinition && statement.findFirstExpression(Expressions.ClassGlobal)) {
        this.isGlobalClass = true;
        return true;
      } else if (this.isGlobalClass === true
        && (node instanceof Statements.EndClass || node instanceof Statements.ClassImplementation)) {
        return true;
      }
    }

    if (this.conf.ignoreGlobalClassDefinition) {
      if (get instanceof Statements.ClassDefinition
        && statement.findFirstExpression(Expressions.ClassGlobal)) {
        this.skip = true;
        return true;
      } else if (this.skip === true && get instanceof Statements.EndClass) {
        this.skip = false;
        return true;
      } else if (this.skip === true) {
        return true;
      }
    }

    if (this.conf.ignoreGlobalInterface) {
      if (get instanceof Statements.Interface
        && statement.findFirstExpression(Expressions.ClassGlobal)) {
        this.skip = true;
        return true;
      } else if (this.skip === true && get instanceof Statements.EndInterface) {
        this.skip = false;
        return true;
      } else if (this.skip === true) {
        return true;
      }
    }

    return false;
  }

}

export class KeywordCase extends ABAPRule {
  private conf = new KeywordCaseConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "keyword_case",
      title: "Keyword case",
      shortDescription: `Checks that keywords have the same case. Non-keywords must be lower case.`,
      extendedInformation: `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#use-your-pretty-printer-team-settings`,
      tags: [RuleTag.Styleguide, RuleTag.SingleFile, RuleTag.Quickfix],
    };
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
    const ddic = new DDIC(this.reg);

    if (this.conf.ignoreExceptions && obj instanceof Class) {
      const definition = obj.getClassDefinition();
      if (definition === undefined || ddic.isException(definition, obj)) {
        return [];
      }
    }

    const skip = new Skip(this.getConfig());
    for (const statement of file.getStatements()) {
      if (skip.skipStatement(statement) === true) {
        continue;
      }

      const result = this.traverse(statement, statement.get());
      if (result.token) {
        const {description, fix} = this.build(result.token, result.keyword, file);
        const issue = Issue.atToken(
          file, result.token,
          description,
          this.getMetadata().key,
          this.conf.severity,
          fix);
        issues.push(issue);
        break; // one issue per file
      }
    }

    return issues;
  }

//////////////////

  private build(token: Token, keyword: boolean, file: IFile): {description: string, fix: IEdit} {
    const tokenValue = token.getStr();
    let fix: IEdit;
    let description = "";
    if (keyword === true) {
      description = `Keyword should be ${this.conf.style} case: "${tokenValue}"`;
      if (this.conf.style === KeywordCaseStyle.Lower) {
        fix = EditHelper.replaceToken(file, token, token.getStr().toLowerCase());
      } else {
        fix = EditHelper.replaceToken(file, token, token.getStr().toUpperCase());
      }
    } else {
      description = `Identifiers should be lower case: "${tokenValue}"`;
      fix = EditHelper.replaceToken(file, token, token.getStr().toLowerCase());
    }

    return {description, fix};
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