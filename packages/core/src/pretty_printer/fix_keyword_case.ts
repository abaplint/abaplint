import {StatementNode, ExpressionNode, TokenNode, TokenNodeRegex} from "../abap/nodes";
import {Identifier} from "../abap/1_lexer/tokens";
import {Position} from "../position";
import {KeywordCase, KeywordCaseStyle} from "../rules/keyword_case";
import * as Tokens from "../abap/1_lexer/tokens";
import {IConfiguration} from "../_config";

export class FixCase {
  private fileContents: string;
  private readonly config: IConfiguration;
  private readonly keywordCase: KeywordCase;

  public constructor(fileContents: string, config: IConfiguration) {
    this.keywordCase = new KeywordCase();
    this.keywordCase.setConfig(config.readByRule(this.keywordCase.getMetadata().key));
    this.fileContents = fileContents;
    this.config = config;
  }

  public execute(statement: StatementNode | ExpressionNode): string {
    for (const child of statement.getChildren()) {
      if (child instanceof TokenNodeRegex) {
        const token = child.get();
        if (token instanceof Tokens.StringToken) {
          continue;
        }
        this.replaceString(token.getStart(), this.formatNonKeyword(token.getStr()));
        continue;
      } else if (child instanceof TokenNode) {
        const token = child.get();
        const str = token.getStr();
        if (this.keywordCase.violatesRule(str) && token instanceof Identifier) {
          this.replaceString(token.getStart(), this.formatKeyword(str));
        }
      } else if (child instanceof ExpressionNode) {
        this.execute(child);
      } else {
        throw new Error("pretty printer, traverse, unexpected node type");
      }
    }

    return this.fileContents;
  }

  private formatNonKeyword(str: string): string {
    return str.toLowerCase();
  }

  private formatKeyword(keyword: string): string {
    const ruleKey = this.keywordCase.getMetadata().key;
    const rule = this.config.readByRule(ruleKey);
    const style: KeywordCaseStyle = rule ? rule["style"] : KeywordCaseStyle.Upper;
    return style === KeywordCaseStyle.Lower ? keyword.toLowerCase() : keyword.toUpperCase();
  }

  private replaceString(pos: Position, str: string) {
    const lines = this.fileContents.split("\n");
    const line = lines[pos.getRow() - 1];

    lines[pos.getRow() - 1] = line.substr(0, pos.getCol() - 1) + str + line.substr(pos.getCol() + str.length - 1);

    this.fileContents = lines.join("\n");
  }

}