import {StatementNode, ExpressionNode, TokenNodeRegex, TokenNode} from "../abap/nodes";
import {Identifier} from "../abap/tokens";
import {Position} from "../position";


export class UppercaseKeywords {
  private fileContents: string;
  public constructor(fileContents: string) {
    this.fileContents = fileContents;
  }

  public execute(s: StatementNode | ExpressionNode): string {
    for (const child of s.getChildren()) {
      if (child instanceof TokenNodeRegex) {
        continue;
      } else if (child instanceof TokenNode) {
        const token = child.get();
        const str = token.getStr();
        if (str !== str.toUpperCase() && token instanceof Identifier) {
          this.replaceString(token.getStart(), str.toUpperCase());
        }
      } else if (child instanceof ExpressionNode) {
        this.execute(child);
      } else {
        throw new Error("pretty printer, traverse, unexpected node type");
      }
    }

    return this.fileContents;
  }

  private replaceString(pos: Position, str: string) {
    const lines = this.fileContents.split("\n");
    const line = lines[pos.getRow() - 1];

    lines[pos.getRow() - 1] = line.substr(0, pos.getCol() - 1) + str + line.substr(pos.getCol() + str.length - 1);

    this.fileContents = lines.join("\n");
  }

}