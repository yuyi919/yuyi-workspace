import { Trie, fromList } from "./trie";

/**
 * ac自动机多字符串查找
 * @param tr
 * @param str
 */

export function acSearch(tr: Trie | string[], str: string) {
  if (tr instanceof Array) {
    tr = fromList(tr);
  }
  // 生成字典树
  // 构造字典树的失败指针
  build_ac_automation(tr);
  console.log(tr);
  let node = tr;

  const data = [];
  for (let i = 0; i < str.length; i++) {
    let cnode = node.children[str[i]];
    // 匹配不到字符，进入失败匹配，
    while (!cnode && node.fail) {
      node = node.fail;
      cnode = node.children[str[i]];
    }
    if (cnode) {
      node = cnode;
    }
    if (node.endOfWord) {
      data.push({
        start: i + 1 - node.deep,
        len: node.deep,
        str: str.substr(i + 1 - node.deep, node.deep),
        num: node.num,
        node,
        isEnd: node.endOfWord,
      });
    }
  }
  return data;
}

/**
 * 构建字典树失败指针
 * @param root
 */
function build_ac_automation(root: Trie) {
  const queue = [root];
  while (queue.length) {
    const cursor = queue.shift();
    for (const char in cursor.children) {
      const child = cursor.children[char];
      if (cursor === root) {
        child.fail = root;
      } else {
        child.fail = cursor.fail.children[char] || root;
      }
      queue.push(child);
    }
  }
}
