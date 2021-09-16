export const VueRef = {
  install: function install(Vue: any) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var directiveName = options.name || "ref";
    Vue.directive(directiveName, {
      bind(el: any, binding: any, vnode: any) {
        Vue.nextTick(() => {
          binding.value(vnode.componentInstance || el, vnode.key);
        });
        binding.value(vnode.componentInstance || el, vnode.key);
      },
      update(el: any, binding: any, vnode: any, oldVnode: any) {
        if (oldVnode.data && oldVnode.data.directives) {
          var oldBinding = oldVnode.data.directives.find((directive) => {
            var name = directive.name;
            return name === directiveName;
          });
          if (oldBinding && oldBinding.value !== binding.value) {
            oldBinding && oldBinding.value(null, oldVnode.key);
            binding.value(vnode.componentInstance || el, vnode.key);
            return;
          }
        }
        // Should not have this situation
        if (vnode.componentInstance !== oldVnode.componentInstance || vnode.elm !== oldVnode.elm) {
          binding.value(vnode.componentInstance || el, vnode.key);
        }
      },
      unbind(el: any, binding, vnode) {
        binding.value(null, vnode.key);
      },
    });
  },
};
