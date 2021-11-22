/******************************************************************************
 * This file was generated by langium-cli 0.2.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

/* eslint-disable @typescript-eslint/array-type */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { AstNode, AstReflection, Reference, isAstNode } from 'langium';

export interface AtInline extends AstNode {
    readonly $container: Content;
    ref: Reference<Character>
}

export const AtInline = 'AtInline';

export function isAtInline(item: unknown): item is AtInline {
    return reflection.isInstance(item, AtInline);
}

export interface Call extends AstNode {
    readonly $container: Content;
    elements: Array<NamedArg>
    pipe: Pipe
    ref: Reference<Macro>
}

export const Call = 'Call';

export function isCall(item: unknown): item is Call {
    return reflection.isInstance(item, Call);
}

export interface Character extends AstNode {
    readonly $container: CharactersDeclare;
    elements: Array<Param>
    modifiers: Array<Modifier>
    name: string
}

export const Character = 'Character';

export function isCharacter(item: unknown): item is Character {
    return reflection.isInstance(item, Character);
}

export interface Content extends AstNode {
    readonly $container: StoryBlock;
    content: Array<AtInline | Template | Label | Call | Plain>
    pipe: Pipe
}

export const Content = 'Content';

export function isContent(item: unknown): item is Content {
    return reflection.isInstance(item, Content);
}

export interface Declare extends AstNode {
    readonly $container: Document;
}

export const Declare = 'Declare';

export function isDeclare(item: unknown): item is Declare {
    return reflection.isInstance(item, Declare);
}

export interface Document extends AstNode {
    contents: Array<LogicStatment | StoryBlock>
    defines: Array<Declare>
}

export const Document = 'Document';

export function isDocument(item: unknown): item is Document {
    return reflection.isInstance(item, Document);
}

export interface Endtatment extends AstNode {
    type: 'end'
}

export const Endtatment = 'Endtatment';

export function isEndtatment(item: unknown): item is Endtatment {
    return reflection.isInstance(item, Endtatment);
}

export interface Expression extends AstNode {
    readonly $container: IfStatment | Variable | Template | Assign | Relaction | Addition | Multiplication | Param | NamedArg;
}

export const Expression = 'Expression';

export function isExpression(item: unknown): item is Expression {
    return reflection.isInstance(item, Expression);
}

export interface Identifier extends AstNode {
    name: string
}

export const Identifier = 'Identifier';

export function isIdentifier(item: unknown): item is Identifier {
    return reflection.isInstance(item, Identifier);
}

export interface Label extends AstNode {
    readonly $container: Content;
    elements: Array<NamedArg>
    pipe: Pipe
    ref: Reference<Macro>
    text: TextPieceContent
}

export const Label = 'Label';

export function isLabel(item: unknown): item is Label {
    return reflection.isInstance(item, Label);
}

export interface Logic_If extends AstNode {
    type: 'if'
}

export const Logic_If = 'Logic_If';

export function isLogic_If(item: unknown): item is Logic_If {
    return reflection.isInstance(item, Logic_If);
}

export interface Logic_Let extends AstNode {
    type: 'let'
}

export const Logic_Let = 'Logic_Let';

export function isLogic_Let(item: unknown): item is Logic_Let {
    return reflection.isInstance(item, Logic_Let);
}

export interface LogicStatment extends AstNode {
    readonly $container: Document;
}

export const LogicStatment = 'LogicStatment';

export function isLogicStatment(item: unknown): item is LogicStatment {
    return reflection.isInstance(item, LogicStatment);
}

export interface Macro extends AstNode {
    readonly $container: MacroDeclare;
    elements: Array<Param>
    groups: Array<Reference<Character>>
    name: string
}

export const Macro = 'Macro';

export function isMacro(item: unknown): item is Macro {
    return reflection.isInstance(item, Macro);
}

export interface Modifier extends AstNode {
    readonly $container: Character;
    name: string
}

export const Modifier = 'Modifier';

export function isModifier(item: unknown): item is Modifier {
    return reflection.isInstance(item, Modifier);
}

export interface NamedArg extends AstNode {
    readonly $container: Call | Label | Pipe;
    ref: Reference<Param>
    value: LiteralExpression | TextPieceExpression
}

export const NamedArg = 'NamedArg';

export function isNamedArg(item: unknown): item is NamedArg {
    return reflection.isInstance(item, NamedArg);
}

export interface Param extends AstNode {
    readonly $container: Character | Macro;
    name: string
    value: LiteralExpression | TextPieceExpression
}

export const Param = 'Param';

export function isParam(item: unknown): item is Param {
    return reflection.isInstance(item, Param);
}

export interface Pipe extends AstNode {
    readonly $container: Content | Call | Label | Template;
    elements: Array<NamedArg>
    ref: Reference<Macro>
}

export const Pipe = 'Pipe';

export function isPipe(item: unknown): item is Pipe {
    return reflection.isInstance(item, Pipe);
}

export interface Plain extends AstNode {
    readonly $container: Content;
    content: Space | RawText
}

export const Plain = 'Plain';

export function isPlain(item: unknown): item is Plain {
    return reflection.isInstance(item, Plain);
}

export interface QualifiedName extends AstNode {
    name: Array<Reference<Identifier>>
}

export const QualifiedName = 'QualifiedName';

export function isQualifiedName(item: unknown): item is QualifiedName {
    return reflection.isInstance(item, QualifiedName);
}

export interface StoryBlock extends AstNode {
    readonly $container: Document;
    contents: Array<Content>
}

export const StoryBlock = 'StoryBlock';

export function isStoryBlock(item: unknown): item is StoryBlock {
    return reflection.isInstance(item, StoryBlock);
}

export interface Template extends AstNode {
    readonly $container: Content;
    expression: Expression
    pipe: Pipe
}

export const Template = 'Template';

export function isTemplate(item: unknown): item is Template {
    return reflection.isInstance(item, Template);
}

export interface TextPieceExpression extends AstNode {
    readonly $container: Param | NamedArg;
    value: TextPieceContent
}

export const TextPieceExpression = 'TextPieceExpression';

export function isTextPieceExpression(item: unknown): item is TextPieceExpression {
    return reflection.isInstance(item, TextPieceExpression);
}

export interface Variable extends AstNode {
    readonly $container: VarStatment;
    initial: Expression
    name: VariableName
}

export const Variable = 'Variable';

export function isVariable(item: unknown): item is Variable {
    return reflection.isInstance(item, Variable);
}

export interface CharactersDeclare extends Declare {
    elements: Array<Character>
    kind: Token_Character
}

export const CharactersDeclare = 'CharactersDeclare';

export function isCharactersDeclare(item: unknown): item is CharactersDeclare {
    return reflection.isInstance(item, CharactersDeclare);
}

export interface MacroDeclare extends Declare {
    elements: Array<Macro>
    kind: Token_Macro
}

export const MacroDeclare = 'MacroDeclare';

export function isMacroDeclare(item: unknown): item is MacroDeclare {
    return reflection.isInstance(item, MacroDeclare);
}

export interface OtherDeclare extends Declare {
    elements: RawText
    name: string
}

export const OtherDeclare = 'OtherDeclare';

export function isOtherDeclare(item: unknown): item is OtherDeclare {
    return reflection.isInstance(item, OtherDeclare);
}

export interface Logic_End extends Endtatment {
}

export const Logic_End = 'Logic_End';

export function isLogic_End(item: unknown): item is Logic_End {
    return reflection.isInstance(item, Logic_End);
}

export interface Addition extends Expression {
    left: Expression | string
    right: Expression
}

export const Addition = 'Addition';

export function isAddition(item: unknown): item is Addition {
    return reflection.isInstance(item, Addition);
}

export interface Assign extends Expression {
    left: Expression | string
    right: Expression
}

export const Assign = 'Assign';

export function isAssign(item: unknown): item is Assign {
    return reflection.isInstance(item, Assign);
}

export interface LiteralExpression extends Expression {
}

export const LiteralExpression = 'LiteralExpression';

export function isLiteralExpression(item: unknown): item is LiteralExpression {
    return reflection.isInstance(item, LiteralExpression);
}

export interface Multiplication extends Expression {
    left: Expression
    right: Expression
}

export const Multiplication = 'Multiplication';

export function isMultiplication(item: unknown): item is Multiplication {
    return reflection.isInstance(item, Multiplication);
}

export interface RefExpression extends Expression {
    ref: Reference<Variable>
}

export const RefExpression = 'RefExpression';

export function isRefExpression(item: unknown): item is RefExpression {
    return reflection.isInstance(item, RefExpression);
}

export interface Relaction extends Expression {
    left: Expression | string
    right: Expression
}

export const Relaction = 'Relaction';

export function isRelaction(item: unknown): item is Relaction {
    return reflection.isInstance(item, Relaction);
}

export interface IfStatment extends LogicStatment {
    expression: Expression
}

export const IfStatment = 'IfStatment';

export function isIfStatment(item: unknown): item is IfStatment {
    return reflection.isInstance(item, IfStatment);
}

export interface VarStatment extends LogicStatment {
    expressions: Array<Variable>
}

export const VarStatment = 'VarStatment';

export function isVarStatment(item: unknown): item is VarStatment {
    return reflection.isInstance(item, VarStatment);
}

export interface Action extends StoryBlock {
}

export const Action = 'Action';

export function isAction(item: unknown): item is Action {
    return reflection.isInstance(item, Action);
}

export interface Dialog extends StoryBlock {
    elements: Array<Reference<Modifier | Call>>
    ref: Reference<Character>
}

export const Dialog = 'Dialog';

export function isDialog(item: unknown): item is Dialog {
    return reflection.isInstance(item, Dialog);
}

export interface BooleanLiteral extends LiteralExpression {
    value: boolean
}

export const BooleanLiteral = 'BooleanLiteral';

export function isBooleanLiteral(item: unknown): item is BooleanLiteral {
    return reflection.isInstance(item, BooleanLiteral);
}

export interface NumberLiteral extends LiteralExpression {
    value: number
}

export const NumberLiteral = 'NumberLiteral';

export function isNumberLiteral(item: unknown): item is NumberLiteral {
    return reflection.isInstance(item, NumberLiteral);
}

export interface StringLiteral extends LiteralExpression {
    value: STRING
}

export const StringLiteral = 'StringLiteral';

export function isStringLiteral(item: unknown): item is StringLiteral {
    return reflection.isInstance(item, StringLiteral);
}

export type VariableName = string

export type Space = string

export type RawText = string

export type RawTextPiece = string

export type TextPieceContent = string

export type Esc_Tokens = string

export type Token_Character = string

export type Token_Macro = string

export type TOKEN_AT = string

export type Token_Equal = string

export type Token_EqualEqual = string

export type Token_Plus = string

export type Token_Minus = string

export type Token_Colon = string

export type Token_PL = string

export type Token_PR = string

export type Token_P = string

export type Token_Logic = string

export type Token_Quote1 = string

export type Token_Quote2 = string

export type STRING = string

export type StringContent = string

export type AdvscriptAstType = 'AtInline' | 'Call' | 'Character' | 'Content' | 'Declare' | 'Document' | 'Endtatment' | 'Expression' | 'Identifier' | 'Label' | 'Logic_If' | 'Logic_Let' | 'LogicStatment' | 'Macro' | 'Modifier' | 'NamedArg' | 'Param' | 'Pipe' | 'Plain' | 'QualifiedName' | 'StoryBlock' | 'Template' | 'TextPieceExpression' | 'Variable' | 'CharactersDeclare' | 'MacroDeclare' | 'OtherDeclare' | 'Logic_End' | 'Addition' | 'Assign' | 'LiteralExpression' | 'Multiplication' | 'RefExpression' | 'Relaction' | 'IfStatment' | 'VarStatment' | 'Action' | 'Dialog' | 'BooleanLiteral' | 'NumberLiteral' | 'StringLiteral';

export type AdvscriptAstReference = 'AtInline:ref' | 'Call:ref' | 'Label:ref' | 'Macro:groups' | 'NamedArg:ref' | 'Pipe:ref' | 'QualifiedName:name' | 'RefExpression:ref' | 'Dialog:elements' | 'Dialog:ref';

export class AdvscriptAstReflection implements AstReflection {

    getAllTypes(): string[] {
        return ['AtInline', 'Call', 'Character', 'Content', 'Declare', 'Document', 'Endtatment', 'Expression', 'Identifier', 'Label', 'Logic_If', 'Logic_Let', 'LogicStatment', 'Macro', 'Modifier', 'NamedArg', 'Param', 'Pipe', 'Plain', 'QualifiedName', 'StoryBlock', 'Template', 'TextPieceExpression', 'Variable', 'CharactersDeclare', 'MacroDeclare', 'OtherDeclare', 'Logic_End', 'Addition', 'Assign', 'LiteralExpression', 'Multiplication', 'RefExpression', 'Relaction', 'IfStatment', 'VarStatment', 'Action', 'Dialog', 'BooleanLiteral', 'NumberLiteral', 'StringLiteral'];
    }

    isInstance(node: unknown, type: string): boolean {
        return isAstNode(node) && this.isSubtype(node.$type, type);
    }

    isSubtype(subtype: string, supertype: string): boolean {
        if (subtype === supertype) {
            return true;
        }
        switch (subtype) {
            case CharactersDeclare:
            case MacroDeclare:
            case OtherDeclare: {
                return this.isSubtype(Declare, supertype);
            }
            case Logic_End: {
                return this.isSubtype(Endtatment, supertype);
            }
            case Addition:
            case Assign:
            case LiteralExpression:
            case Multiplication:
            case RefExpression:
            case Relaction: {
                return this.isSubtype(Expression, supertype);
            }
            case IfStatment:
            case VarStatment: {
                return this.isSubtype(LogicStatment, supertype);
            }
            case Action:
            case Dialog: {
                return this.isSubtype(StoryBlock, supertype);
            }
            case BooleanLiteral:
            case NumberLiteral:
            case StringLiteral: {
                return this.isSubtype(LiteralExpression, supertype);
            }
            default: {
                return false;
            }
        }
    }

    getReferenceType(referenceId: AdvscriptAstReference): string {
        switch (referenceId) {
            case 'AtInline:ref': {
                return Character;
            }
            case 'Call:ref': {
                return Macro;
            }
            case 'Label:ref': {
                return Macro;
            }
            case 'Macro:groups': {
                return Character;
            }
            case 'NamedArg:ref': {
                return Param;
            }
            case 'Pipe:ref': {
                return Macro;
            }
            case 'QualifiedName:name': {
                return Identifier;
            }
            case 'RefExpression:ref': {
                return Variable;
            }
            case 'Dialog:elements': {
                return Modifier;
            }
            case 'Dialog:ref': {
                return Character;
            }
            default: {
                throw new Error(`${referenceId} is not a valid reference id.`);
            }
        }
    }
}

export const reflection = new AdvscriptAstReflection();