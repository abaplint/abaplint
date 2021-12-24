import {Combi} from "../abap/2_statements/combi";
import {ExpressionNode} from "../abap/nodes";
import {IFile} from "../files/_ifile";
import {defaultVersion} from "../version";
import {CDSLexer} from "./cds_lexer";
import * as Expressions from "./expressions";

// todo: the names of the ABAP + CDS + DDL expressions might overlap, if overlapping the singleton will fail

export class CDSParser {
  public parse(file: IFile) {
    const tokens = CDSLexer.run(file);

    const res = Combi.run(new Expressions.CDSDefineView(), tokens, defaultVersion);
    if (res === undefined || !(res[0] instanceof ExpressionNode)) {
      return undefined;
    }
    return res[0];
  }

}