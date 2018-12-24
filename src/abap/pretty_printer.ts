import {ABAPFile} from "../files";
import {Unknown, MacroContent, MacroCall, Comment} from "./statements/_statement";
import {StatementNode, ExpressionNode, TokenNodeRegex, TokenNode} from "./nodes";
import {Identifier} from "./tokens";
import {Position} from "../position";

// currently only upper cases keywords

export class PrettyPrinter {
  private result: string;
  private file: ABAPFile;

  constructor(file: ABAPFile) {
    this.result = file.getRaw();
    this.file = file;
  }

  public run(): string {
    for (const statement of this.file.getStatements()) {
      if (statement.get() instanceof Unknown
          || statement.get() instanceof MacroContent
          || statement.get() instanceof MacroCall
          || statement.get() instanceof Comment) {
        continue;
      }
      this.traverse(statement);
    }

    return this.result;
  }

  private replaceString(pos: Position, str: string) {
    const lines = this.result.split("\n");
    const line = lines[pos.getRow() - 1];

    lines[pos.getRow() - 1] = line.substr(0, pos.getCol() - 1) + str + line.substr(pos.getCol() + str.length - 1);

    this.result = lines.join("\n");
  }

  private traverse(s: StatementNode | ExpressionNode): void {
    for (const child of s.getChildren()) {
      if (child instanceof TokenNodeRegex) {
        continue;
      } else if (child instanceof TokenNode) {
        const token = child.get();
        const str = token.getStr();
        if (str !== str.toUpperCase() && token instanceof Identifier) {
          this.replaceString(token.getPos(), str.toUpperCase());
        }
      } else if (child instanceof ExpressionNode) {
        this.traverse(child);
      } else {
        throw new Error("pretty printer, traverse, unexpected node type");
      }
    }
  }

}