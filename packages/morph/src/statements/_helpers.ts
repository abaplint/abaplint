import {ParameteredNode, ReturnTypedNode} from "ts-morph";
import {handleType} from "../types";
import {MorphSettings} from "../statements";

let counter = 1;

export function buildParameters(m: ReturnTypedNode & ParameteredNode, settings: MorphSettings, noReturning?: boolean):
{definition: string, parameters: string} {

  let parameters = "";
  let definition = "";
  for (const p of m.getParameters()) {
    const opt = p.isOptional() ? " OPTIONAL" : "";
    let handled = handleType(p.getType(), settings);
    if (handled.startsWith("STANDARD TABLE OF ")) {
      definition += `TYPES ty${counter} TYPE ${handled}.\n`;
      handled = `ty${counter}`;
      counter++;
    }
    parameters += ` ${p.getName()} TYPE ${handled}` + opt;
  }
  if (parameters !== "") {
    parameters = " IMPORTING" + parameters;
  }

  if (m.getReturnType().getText() !== "void" && noReturning !== true) {
    let handled = handleType(m.getReturnType(), settings);
    if (handled.startsWith("STANDARD TABLE OF ")) {
      definition += `TYPES ty${counter} TYPE ${handled}.\n`;
      handled = `ty${counter}`;
      counter++;
    }
    // note: return is a keyword in TypeScript/JavaScript so it will never overlap
    parameters += ` RETURNING VALUE(return) TYPE ` + handled;
  }

  return {
    definition: definition,
    parameters: parameters,
  };
}