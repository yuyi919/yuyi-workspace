import {
  isBoolExpr,
  isNullExpr,
  isUndefinedExpr,
  isLiteralOrIdentifierExpr,
} from "./isLiteralOrIdentifier";
import { factory } from "typescript";

describe("isLiteralOrIdentifier", () => {
  const False = factory.createFalse();
  const True = factory.createTrue();
  const Null = factory.createNull();
  const Undefined = factory.createIdentifier("undefined");
  const NullIdentifier = factory.createIdentifier("null");
  const TrueIdentifier = factory.createIdentifier("true");
  const FalseIdentifier = factory.createIdentifier("true");
  const StringExpr = factory.createStringLiteral("1");
  const NumberExpr = factory.createNumericLiteral("1");
  it("isBoolKeyword", () => {
    expect(isBoolExpr(True)).toBeTruthy();
    expect(isBoolExpr(False)).toBeTruthy();
    expect(isBoolExpr(TrueIdentifier)).toBeTruthy();
    expect(isBoolExpr(FalseIdentifier)).toBeTruthy();
  });
  it("isNullKeyword", () => {
    expect(isNullExpr(Null)).toBeTruthy();
    expect(isNullExpr(NullIdentifier)).toBeTruthy();
  });
  it("isNullKeyword", () => {
    expect(isUndefinedExpr(Undefined)).toBeTruthy();
  });
  it("isLiteralOrIdentifier", () => {
    expect(isLiteralOrIdentifierExpr(True)).toBeTruthy();
    expect(isLiteralOrIdentifierExpr(False)).toBeTruthy();
    expect(isLiteralOrIdentifierExpr(TrueIdentifier)).toBeTruthy();
    expect(isLiteralOrIdentifierExpr(FalseIdentifier)).toBeTruthy();
    expect(isLiteralOrIdentifierExpr(Null)).toBeTruthy();
    expect(isLiteralOrIdentifierExpr(NullIdentifier)).toBeTruthy();
    expect(isLiteralOrIdentifierExpr(Undefined)).toBeTruthy();
    expect(isLiteralOrIdentifierExpr(StringExpr)).toBeTruthy();
    expect(isLiteralOrIdentifierExpr(NumberExpr)).toBeTruthy();
  });
});
