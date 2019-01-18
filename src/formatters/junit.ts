import {Issue} from "../issue";
import {IFormatter} from "./_iformatter";

function escape(xml: string): string {
  return xml.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
}

export class Junit implements IFormatter {

  public output(issues: Issue[], _fileCount: number): string {
    let xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
      "<testsuites>\n" +
      "  <testsuite name=\"abaplint\" tests=\"" + issues.length + "\" failures=\"" + issues.length + "\" errors=\"0\" skipped=\"0\">\n";

    for (const issue of issues) {
      xml = xml + "    <testcase classname=\"" + issue.getFile().getFilename() +
        "[" + issue.getStart().getRow() + ", " + issue.getStart().getCol() +
        "]\" name=\"" + issue.getKey() + "\">\n" +
        "      <failure message=\"" + escape(issue.getMessage()) + "\"/>\n" +
        "    </testcase>\n";
    }

    xml = xml + "  </testsuite>\n" +
      "</testsuites>";

    return xml;
  }

}