import {ABAPFile} from "../files";
import {GenericError} from "../rules";
import {Unknown, Empty} from "./statements/_statement";
import {Structure} from "./structures/_structure";
import * as Structures from "./structures/";
import {Issue} from "../issue";
import {Comment as StatementComment} from "./statements/_statement";

export default class StructureParser {

  public static run(file: ABAPFile): Array<Issue> {
    const structure = this.findStructureForFile(file.getFilename());
    let statements = file.getStatements().slice().filter((s) => { return !(s instanceof StatementComment || s instanceof Empty); });
    const unknowns = file.getStatements().slice().filter((s) => { return s instanceof Unknown; });
    if (unknowns.length > 0) {
// do not parse structure, file contains unknown statements(parser errors)
      return [];
    }

    const result = structure.getMatcher().run(statements);
    if (result.error) {
      return [new Issue({rule: new GenericError(result.errorDescription), file, message: 1})];
    }
    if (result.unmatched.length > 0) {
      const statement = result.unmatched[0];
      const descr = "Unexpected " + statement.constructor.name.toUpperCase();
      return [new Issue({rule: new GenericError(descr), file, message: 1, start: statement.getStart()})];
    }
    return [];
  }

  private static findStructureForFile(filename: string): Structure {
// todo, not sure this is the right place for this logic
    if (filename.match(/\.clas\.abap$/)) {
      return new Structures.ClassGlobal();
    } else if (filename.match(/\.intf\.abap$/)) {
      return new Structures.Interface();
    } else {
// todo
      return new Structures.Any();
    }
  }

}