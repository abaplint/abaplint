import {IRegistry} from "../_iregistry";
import {ABAPObject} from "../objects/_abap_object";
import {Program} from "../objects/program";
import {Unknown} from "./2_statements/statements/_statement";
import {ExpandMacros} from "./2_statements/expand_macros";
import {IncludeGraph} from "../utils/include_graph";

// Macros can be defined in one include and used in a sibling include, connected
// via the main program. Objects are parsed in isolation, so the sibling include
// initially ends up with Unknown statements. This second pass finds the main
// program(s) for such includes, collects the macro definitions visible there,
// and re-parses the include with the macro names as extra global macros.
export class CrossIncludeMacros {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public run(): void {
    const candidates = this.findCandidates();
    if (candidates.length === 0) {
      return;
    }

    const graph = new IncludeGraph(this.reg);
    const config = this.reg.getConfig();
    const globalMacros = config.getSyntaxSetttings().globalMacros || [];

    for (const prog of candidates) {
      const mains = this.findMains(graph, prog);
      if (mains.size === 0) {
        continue;
      }

      const expand = new ExpandMacros(globalMacros, config.getRelease(), this.reg, config.getLanguageVersion());
      for (const main of mains) {
        for (const file of main.getABAPFiles()) {
          // find() follows INCLUDE statements, so this collects macros from the full include chain
          expand.find([...file.getStatements()], file, false);
        }
      }

      const macroNames = expand.listMacroNames();
      if (this.matchesUnknown(prog, new Set(macroNames))) {
        prog.setDirty();
        prog.parse(config.getRelease(), macroNames, this.reg, config.getLanguageVersion());
      }
    }
  }

//////////////////////////////

  private findCandidates(): Program[] {
    const ret: Program[] = [];
    for (const obj of this.reg.getObjects()) {
      if (!(obj instanceof Program) || obj.isInclude() === false) {
        continue;
      }
      for (const file of obj.getABAPFiles()) {
        if (file.getStatements().some(s => s.get() instanceof Unknown)) {
          ret.push(obj);
          break;
        }
      }
    }
    return ret;
  }

  private findMains(graph: IncludeGraph, prog: Program): Set<ABAPObject> {
    const ret = new Set<ABAPObject>();
    const filename = prog.getMainABAPFile()?.getFilename();
    for (const mainFilename of graph.listMainForInclude(filename)) {
      const file = this.reg.getFileByName(mainFilename);
      const obj = file ? this.reg.findObjectForFile(file) : undefined;
      if (obj instanceof ABAPObject) {
        ret.add(obj);
      }
    }
    return ret;
  }

  private matchesUnknown(prog: Program, macroNames: Set<string>): boolean {
    for (const file of prog.getABAPFiles()) {
      for (const s of file.getStatements()) {
        if (s.get() instanceof Unknown) {
          const name = ExpandMacros.findName(s.getTokens());
          if (name !== undefined && macroNames.has(name.toUpperCase())) {
            return true;
          }
        }
      }
    }
    return false;
  }

}
