import {ParameteredNode, ReturnTypedNode} from "ts-morph";
import {handleType} from "../types";

export function buildParameters(m: ReturnTypedNode & ParameteredNode, noReturning?: boolean): string {
  let parameters = "";
  for (const p of m.getParameters()) {
    parameters += ` ${p.getName()} TYPE ${handleType(p.getType())}`;
  }
  if (parameters !== "") {
    parameters = " IMPORTING" + parameters;
  }
  if (m.getReturnType().getText() !== "void" && noReturning !== true) {
    // note: return is a keyword in TypeScript/JavaScript so it will never overlap
    parameters += ` RETURNING VALUE(return) TYPE ` + handleType(m.getReturnType());
  }
  return parameters;
}