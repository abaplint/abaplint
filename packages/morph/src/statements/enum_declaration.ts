import {EnumDeclaration} from "ts-morph";

export class MorphEnumDeclaration {
  public run(s: EnumDeclaration) {
    let ret = `CONSTANTS BEGIN OF ${s.getName()}.\n`;

    let val = 1;
    for (const e of s.getSymbol()?.getExports() || []) {
      ret += `  CONSTANTS ${e.getName()} TYPE i VALUE ${val++}.\n`;
    }

    ret += `CONSTANTS END OF ${s.getName()}.\n`;
    return ret;
  }
}
