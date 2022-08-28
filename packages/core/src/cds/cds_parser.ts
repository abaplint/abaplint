import {Comment} from "../abap/1_lexer/tokens";
import {Combi} from "../abap/2_statements/combi";
import {ExpressionNode} from "../abap/nodes";
import {IFile} from "../files/_ifile";
import {defaultVersion} from "../version";
import {CDSLexer} from "./cds_lexer";
import * as Expressions from "./expressions";

// todo: the names of the ABAP + CDS + DDL expressions might overlap, if overlapping the singleton will fail

export class CDSParser {
  public parse(file: IFile | undefined) {
    if (file === undefined) {
      return undefined;
    }

    let tokens = CDSLexer.run(file);
    tokens = tokens.filter(t => !(t instanceof Comment));
    // console.dir(tokens);

    let res = Combi.run(new Expressions.CDSDefineView(), tokens, defaultVersion);
    if (res === undefined || !(res[0] instanceof ExpressionNode)) {
      res = Combi.run(new Expressions.CDSDefineAbstract(), tokens, defaultVersion);
    }
    if (res === undefined || !(res[0] instanceof ExpressionNode)) {
      res = Combi.run(new Expressions.CDSDefineProjection(), tokens, defaultVersion);
    }
    if (res === undefined || !(res[0] instanceof ExpressionNode)) {
      return undefined;
    }
    return res[0];
  }

}