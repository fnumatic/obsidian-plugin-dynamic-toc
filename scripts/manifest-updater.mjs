import stringifyPackage from "stringify-package";
import detectIndent from "detect-indent";
import detectNewline from "detect-newline";

export function readVersion (contents) {
  const data = JSON.parse(contents);
  return data.version;
}

export function writeVersion (contents, version) {
  const json = JSON.parse(contents);
  let indent = detectIndent(contents).indent;
  let newline = detectNewline(contents);
  json.version = version;
  return stringifyPackage(json, indent, newline);
}
