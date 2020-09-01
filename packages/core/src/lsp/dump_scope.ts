import {ScopeType} from "../abap/5_syntax/_scope_type";
import {ISpaghettiScope, ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";

export class DumpScope {

  public static dump(spaghetti: ISpaghettiScope): string {
    let ret = "<hr>Spaghetti Scope:<br><br>\n";
    ret = ret + this.traverseSpaghetti(spaghetti.getTop(), 0);
    return ret;
  }

  private static traverseSpaghetti(node: ISpaghettiScopeNode, indent: number): string {
    const identifier = node.getIdentifier();
    const coverage = node.calcCoverage();

    const sident = "&nbsp".repeat(indent * 2);

    let ret: string = sident + "<u>" + identifier.stype + ", <tt>" + identifier.sname + "</tt>";

    ret += ", (" + coverage.start.getRow() + ", " + coverage.start.getCol() + ")";
    if (coverage.end.getRow() === Number.MAX_SAFE_INTEGER
        && coverage.end.getCol() === Number.MAX_SAFE_INTEGER) {
      ret += ", (max, max)";
    } else {
      ret += ", (" + coverage.end.getRow() + ", " + coverage.end.getCol() + ")";
    }

    ret += "</u><br>";

    if (node.getIdentifier().stype === ScopeType.BuiltIn) {
      ret += sident + node.getData().types.length + " type definitions<br>";
      ret += sident + node.getData().vars.length + " data definitions<br>";
    } else {
      ret = ret + this.dumpNode(node, indent);
    }
    ret = ret + "<br>";

    for (const c of node.getChildren()) {
      ret = ret + this.traverseSpaghetti(c, indent + 1);
    }

    return ret;
  }

  private static dumpNode(node: ISpaghettiScopeNode, indent: number): string {
    let ret = "";
    const sident = "&nbsp;".repeat(indent * 2);

    if (node.getData().types.length === 0) {
      ret = ret + sident + "0 type definitions<br>";
    } else {
      ret = ret + sident + "Types:<br>";
    }

    for (const t of node.getData().types) {
      ret = ret + sident + "<tt>" + this.escape(t.name) + "</tt>";
      const pos = t.identifier.getStart();
      ret = ret + "(" + pos.getRow().toString() + ", " + pos.getCol().toString() + ") ";
      ret = ret + t.identifier.getType().toText(0);
      ret = ret + "<br>";
    }

    if (node.getData().vars.length === 0) {
      ret = ret + sident + "0 data definitions<br>";
    } else {
      ret = ret + sident + "Data:<br>";
    }

    for (const v of node.getData().vars) {
      ret = ret + sident + "<tt>" + this.escape(v.name.toLowerCase()) + "</tt>";
      const pos = v.identifier.getStart();
      ret = ret + "(" + pos.getRow().toString() + ", " + pos.getCol().toString() + ") ";
      ret = ret + v.identifier.getType().toText(0);
      const meta = v.identifier.getMeta();
      if (meta) {
        ret = ret + ", " + meta;
      }
      ret = ret + "<br>";
    }

    ret += sident + node.getData().cdefs.length + " class definitions<br>";
    ret += sident + node.getData().idefs.length + " interface definitions<br>";
    ret += sident + node.getData().forms.length + " form definitions<br>";
    ret += sident + node.getData().references.length + " references<br>";
    for (const r of node.getData().references) {
      ret += sident + "&nbsp;&nbsp;" + r.referenceType + ", line " + r.position.getStart().getRow() + "<br>";
    }

    return ret;
  }

// todo, refactor, this method exists in multiple classes
  private static escape(str: string) {
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/>/g, "&gt;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/"/g, "&quot;");
    str = str.replace(/'/g, "&#039;");
    return str;
  }

}