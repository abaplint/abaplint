import {Identifier} from "../4_file_information/_identifier";
import {SyntaxInput, syntaxIssue} from "../5_syntax/_syntax_input";
import {IAttributes} from "./_class_attributes";
import {IMethodDefinitions} from "./_method_definitions";
import {ITypeDefinitions} from "./_type_definitions";
import {Alias} from "./alias";

/** an alias cannot have the name of a method, attribute or type of the same class or interface,
 * reported at the later of the two declarations */
export function checkAliasNameConflicts(input: SyntaxInput, aliases: readonly Alias[],
                                        methods: IMethodDefinitions, attributes: IAttributes, types: ITypeDefinitions): void {
  for (const alias of aliases) {
    const name = alias.getName();
    const other: Identifier | undefined = methods.getByName(name) ?? attributes.findByName(name) ?? types.getByName(name);
    if (other === undefined || other.getFilename() !== alias.getFilename()) {
      continue;
    }
    const later = other.getStart().isAfter(alias.getStart()) ? other : alias;
    input.issues.push(syntaxIssue(input, later.getToken(), `"${name}" already defined, ALIASES`));
  }
}
