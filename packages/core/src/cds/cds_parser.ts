import {Comment} from "../abap/1_lexer/tokens";
import {Combi} from "../abap/2_statements/combi";
import {ExpressionNode} from "../abap/nodes";
import {IFile} from "../files/_ifile";
import {defaultRelease} from "../version";
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

    let res = Combi.run(new Expressions.CDSDefineView(), tokens, defaultRelease);
    if (res === undefined || !(res[0] instanceof ExpressionNode)) {
      res = Combi.run(new Expressions.CDSDefineAbstract(), tokens, defaultRelease);
    }
    if (res === undefined || !(res[0] instanceof ExpressionNode)) {
      res = Combi.run(new Expressions.CDSDefineProjection(), tokens, defaultRelease);
    }
    if (res === undefined || !(res[0] instanceof ExpressionNode)) {
      res = Combi.run(new Expressions.CDSAnnotate(), tokens, defaultRelease);
    }
    if (res === undefined || !(res[0] instanceof ExpressionNode)) {
      res = Combi.run(new Expressions.CDSDefineCustom(), tokens, defaultRelease);
    }
    if (res === undefined || !(res[0] instanceof ExpressionNode)) {
      res = Combi.run(new Expressions.CDSDefineTableFunction(), tokens, defaultRelease);
    }
    if (res === undefined || !(res[0] instanceof ExpressionNode)) {
      res = Combi.run(new Expressions.CDSExtendView(), tokens, defaultRelease);
    }
    if (res === undefined || !(res[0] instanceof ExpressionNode)) {
      res = Combi.run(new Expressions.CDSDefineHierarchy(), tokens, defaultRelease);
    }
    if (res === undefined || !(res[0] instanceof ExpressionNode)) {
      return undefined;
    }
    return res[0];
  }

}