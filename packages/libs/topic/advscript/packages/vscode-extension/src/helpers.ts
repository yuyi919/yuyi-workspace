/* eslint-disable prefer-spread */
/* eslint-disable prefer-rest-params */
import { create_token } from "./token";
class operatorClass{
    is:any;
    is_dialogue:any;
    name:any;
    location:any;
    has_scene_time:any;
    location_type:any;
    enrich_token:any;
};
class helperClass{
    fq:any;
    first_text(type:any, list:any, default_value:any) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].type === type) {
                return list[i].text;
            }
        }
        return default_value;
    };
    create_line(line:any) {
        line.text = line.text || "";
        line.type = line.type || "unknown";
        line.start = line.start || 0;
        line.end = line.end || 0;
        line.token = line.token || function(){const t = create_token(); t.type = line.type; return t};
        line.token.lines = line.token.lines || [line];
        return enrich_line(line);
    };
    create_separator(start:any, end:any) {
        const t = create_token();
        t.text="";
        t.start = start;
        t.end = end;
        t.type = "separator";
        return t;
    };
    version_generator = function(current?:any) {
        current = current || "0";

        const numbers = current.split('.').concat([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

        const bump = function(level:any) {
            numbers[level - 1]++;
            for (let i = level; i < numbers.length; i++) {
                numbers[i] = 0;
            }
        };

        const to_str = function() {
            const copy = numbers.concat();
            copy.reverse();
            while (copy.length > 1 && copy[0] === 0) {
                copy.shift();
            }
            copy.reverse();
            return copy.join('.');
        };

        const increase = function(level:any) {
            if (arguments.length === 0) {
                return to_str();
            }
            bump(level);
            return to_str();
        };

        return increase;
    };
    get_indentation = function(text:string) {
        const match = (text || '').match(/^(\s+)/);
        return match ? match[0] : '';
    };
    blank_text = function(text:string) {
        return (text || '').replace(/./g, ' ');
    };
    operators:operatorClass;
}

const operators = new operatorClass;
const helpers = new helperClass();

operators.is = function() {
    const types = Array.prototype.slice.call(arguments);
    return types.indexOf(this.type) !== -1;
};

operators.is_dialogue = function() {
    return this.is("character", "parenthetical", "dialogue");
};

operators.name = function() {
    let character = this.text;
    const p = character.indexOf("(");
    if (p !== -1) {
        character = character.substring(0, p);
    }
    character = character.trim();
    return character;
};

operators.location = function() {
    let location = this.text.trim();
    location = location.replace(/^(INT\.?\/EXT\.?)|(I\/E)|(INT\.?)|(EXT\.?)/, "");
    const dash = location.lastIndexOf(" - ");
    if (dash !== -1) {
        location = location.substring(0, dash);
    }
    return location.trim();
};

operators.has_scene_time = function(time:any) {
    const suffix = this.text.substring(this.text.indexOf(" - "));
    return this.is("scene_heading") && suffix.indexOf(time) !== -1;
};

operators.location_type = function() {
    const location = this.text.trim();
    if (/^I(NT.?)?\/E(XT.?)?/.test(location)) {
        return "mixed";
    }
    else if (/^INT.?/.test(location)) {
        return "int";
    }
    else if (/^EXT.?/.test(location)) {
        return "ext";
    }
    return "other";
};


helpers.operators = operators;

const create_token_delegator = function(line:any, name:string) {
    return function() {
        return line.token ? line.token[name].apply(line.token, arguments) : null;
    };
};

const create_fquery_delegator = function(name:string) {
    return function() {
        const args = arguments;
        return function(item:any) {
            return item[name].apply(item, args);
        };
    };
};

helpers.fq = {};
for (const name in operators) {
    helpers.fq[name] = create_fquery_delegator(name);
}

const enrich_line = function(line:any) {
    for (const name in operators) {
        line[name] = create_token_delegator(line, name);
    }
    return line;
};

export default helpers;
