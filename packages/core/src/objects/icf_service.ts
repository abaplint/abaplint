import {AbstractObject} from "./_abstract_object";
import {xmlToArray} from "../xml_utils";

export class ICFService extends AbstractObject {

  public getType(): string {
    return "SICF";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 100,
      allowNamespace: true,
    };
  }

  // todo, cache parsed data
  public getHandlerList(): string[] | undefined {
    const ret: string[] = [];

    const parsed = this.parseXML();
    if (parsed === undefined
        || parsed.abapGit === undefined
        || parsed.abapGit["asx:abap"]["asx:values"] === undefined) {
      return undefined;
    }

    const table = parsed.abapGit["asx:abap"]["asx:values"].ICFHANDLER_TABLE;
    for (const h of xmlToArray(table)) {
      if (h.ICFHANDLER !== undefined) {
        ret.push(h.ICFHANDLER.ICFHANDLER?._text);
      }
    }

    return ret;
  }

}