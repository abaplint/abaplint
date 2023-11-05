import {ParameteredNode, ReturnTypedNode} from "ts-morph";
import {handleType} from "../types";
import {MorphSettings} from "../statements";

export function buildParameters(m: ReturnTypedNode & ParameteredNode, settings: MorphSettings, noReturning?: boolean): string {
  let parameters = "";
  for (const p of m.getParameters()) {
    const opt = p.isOptional() ? " OPTIONAL" : "";
    parameters += ` ${p.getName()} TYPE ${handleType(p.getType(), settings)}` + opt;
  }
  if (parameters !== "") {
    parameters = " IMPORTING" + parameters;
  }
  if (m.getReturnType().getText() !== "void" && noReturning !== true) {
    // note: return is a keyword in TypeScript/JavaScript so it will never overlap
    parameters += ` RETURNING VALUE(return) TYPE ` + handleType(m.getReturnType(), settings);
  }
  return parameters;
}