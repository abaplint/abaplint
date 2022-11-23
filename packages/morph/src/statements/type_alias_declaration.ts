import {SyntaxKind, TypeAliasDeclaration} from "ts-morph";
import {handleType} from "../types";

export class MorphTypeAliasDeclaration {

  public run(s: TypeAliasDeclaration) {

    let ret = `TYPES BEGIN OF ${s.getName()}.\n`;

    const literal = s.getFirstChildByKind(SyntaxKind.TypeLiteral);
    for (const m of literal?.getMembers() || []) {
      const name = m.getSymbol()?.getName();
      ret += "  TYPES " + name + " TYPE " + handleType(m.getType()) + ".\n";
    }

    ret += `TYPES END OF ${s.getName()}.\n`;

    return ret;
  }
}