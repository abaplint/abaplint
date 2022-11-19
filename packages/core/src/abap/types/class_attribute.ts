import {Visibility} from "../4_file_information/visibility";
import {IdentifierMeta, TypedIdentifier} from "./_typed_identifier";

export class ClassAttribute extends TypedIdentifier {
  private readonly visibility: Visibility;

  public constructor(id: TypedIdentifier, visibility: Visibility, meta: readonly IdentifierMeta[],
                     value?: string | {[index: string]: string}) {
    super(id.getToken(), id.getFilename(), id.getType(), meta, value);
    this.visibility = visibility;
  }

  public getVisibility() {
    return this.visibility;
  }
}