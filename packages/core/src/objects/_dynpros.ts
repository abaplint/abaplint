import {xmlToArray} from "../xml_utils";

export type DynproField = {
  name: string,
  type: string,
  length: number,
};
export type DynproHeader = {
  number: string,
  fields: DynproField[],
};
export type DynproList = DynproHeader[];

export function parseDynpros(parsed: any): DynproList {
  const dynpros: DynproList = [];
  const xmlDynpros = parsed.abapGit?.["asx:abap"]?.["asx:values"]?.DYNPROS;
  if (xmlDynpros !== undefined) {
    for (const d of xmlToArray(xmlDynpros.item)) {
      const fields: DynproField[] = [];
      for (const f of xmlToArray(d.FIELDS?.RPY_DYFATC)) {
        fields.push({
          name: f.NAME,
          type: f.TYPE,
          length: f.LENGTH,
        });
      }
      dynpros.push({
        number: d.HEADER.SCREEN,
        fields: fields,
      });
    }
  }
  return dynpros;
}