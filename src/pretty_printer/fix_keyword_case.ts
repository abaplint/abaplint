import {StatementNode, ExpressionNode, TokenNodeRegex, TokenNode} from "../abap/nodes";
import {Identifier} from "../abap/tokens";
import {Position} from "../position";
import {Config} from "..";
import {KeywordCase, KeywordCaseStyle} from "../rules/keyword_case";


export class FixKeywordCase {
  private fileContents: string;
  private readonly config: Config;
  private readonly keywordCase: KeywordCase;
  public constructor(fileContents: string, config: Config) {
    this.keywordCase = new KeywordCase();
    this.keywordCase.setConfig(config.readByRule(this.keywordCase.getKey()));
    this.fileContents = fileContents;
    this.config = config;
  }

  public execute(statement: StatementNode | ExpressionNode): string {
    for (const child of statement.getChildren()) {
      if (child instanceof TokenNodeRegex) {
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

  private formatKeyword(keyword: string): string {
    const rule = this.keywordCase.getKey();
    const style: KeywordCaseStyle = this.config.readByRule(rule)["style"];
    return style === "lower" ? keyword.toLowerCase() : keyword.toUpperCase();
  }

  private replaceString(pos: Position, str: string) {
    const lines = this.fileContents.split("\n");
    const line = lines[pos.getRow() - 1];

    lines[pos.getRow() - 1] = line.substr(0, pos.getCol() - 1) + str + line.substr(pos.getCol() + str.length - 1);

    this.fileContents = lines.join("\n");
  }

}