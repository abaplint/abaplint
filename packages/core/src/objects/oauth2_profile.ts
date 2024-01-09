import {xmlToArray} from "../xml_utils";
import {AbstractObject} from "./_abstract_object";

export class Oauth2Profile extends AbstractObject {

  public getType(): string {
    return "OA2P";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }

  public listScopes(): string[] {
    const ret: string[] = [];

    const parsed = super.parseRaw2();

    for (const t of xmlToArray(parsed.abapGit["asx:abap"]["asx:values"]?.PROFILE?.T_SCOPES?.OA2P_SCOPES)) {
      ret.push(t.SCOPE);
    }

    return ret;
  }
}