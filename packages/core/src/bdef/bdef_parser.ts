import {Comment} from "../abap/1_lexer/tokens";
import {AbstractToken} from "../abap/1_lexer/tokens/abstract_token";
import {Combi} from "../abap/2_statements/combi";
import {ExpressionNode} from "../abap/nodes";
import {CDSLexer} from "../cds/cds_lexer";
import {IFile} from "../files/_ifile";
import {defaultRelease} from "../version";
import * as Expressions from "./expressions";

export class BDEFParser {
  public parse(file: IFile | undefined): ExpressionNode | undefined {
    if (file === undefined) {
      return undefined;
    }

    // BDEF has the same comments, strings and delimiters as CDS
    const tokens = this.removePragmas(CDSLexer.run(file).filter(t => !(t instanceof Comment)));

    const res = Combi.run(new Expressions.BDEFDefinition(), tokens, defaultRelease);
    if (res === undefined || !(res[0] instanceof ExpressionNode)) {
      return undefined;
    }
    return res[0];
  }

  /** pragmas can occur in many places, eg. "##NOT_ASSIGNED_TO_DETACT" or "##UNMAPPED_FIELD[SingletonID]" */
  private removePragmas(tokens: AbstractToken[]): AbstractToken[] {
    const ret: AbstractToken[] = [];
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].getStr().startsWith("##") === false) {
        ret.push(tokens[i]);
        continue;
      }
      if (tokens[i + 1]?.getStr() === "[") {
        while (i < tokens.length - 1 && tokens[i].getStr() !== "]") {
          i++;
        }
      }
    }
    return ret;
  }
}
