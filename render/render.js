const h = (tag, props, children) => {
  return {
    tag,
    props,
    children,
  };
};
const mount = (vnode, container) => {
  const el = (vnode.el = document.createElement(vnode.tag));
  // 处理props
  if (vnode.props) {
    for (let key in vnode.props) {
      const value = vnode.props[key];
      handleProps(el, key, value);
    }
  }
  //处理children
  if (vnode.children) {
    if (typeof vnode.children === "string") {
      el.textContent = vnode.children;
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach((vnode) => {
        mount(vnode, el);
      });
    }
  }
  container.appendChild(el);
};
//处理props里面的属性
const handleProps = (el, key, value) => {
  if (key.startsWith("on")) {
    //对事件监听
    el.addEventListener(key.slice(2).toLowerCase(), value);
  } else {
    el.setAttribute(key, value);
  }
};
// 处理新的vnode
const patch = (oldVnode, newVnode) => {
  if (oldVnode.tag !== newVnode.tag) {
    const oldVnodeElementParent = oldVnode.el.parentElement;
    oldVnodeElementParent.removeChild(oldVnode.el);
    mount(newVnode, oldVnodeElementParent);
  } else {
    //1.取出el并且保存到newVnode上面
    const el = (newVnode.el = oldVnode.el);
    //2. 处理props
    const oldProps = oldVnode.props || {};
    const newProps = newVnode.props || {};
    // 2.1把所有的newProps中的属性添加给el
    for (let key in newProps) {
      const oldValue = oldProps[key];
      const newValue = newProps[key];
      if (newValue !== oldValue) {
        handleProps(el, key, newValue);
      }
    }
    //2.2删除旧的props
    for (let key in oldProps) {
      if (!(key in newProps)) {
        if (key.startsWith("on")) {
          //移除监听
          const value = oldProps[key];
          el.removeEventListener(key.slice(2).toLowerCase(), value);
        } else {
          // 移除元素
          el.removeAttribute(key);
        }
      }
    }
    //3.处理children
    const oldChildren = oldVnode.children || [];
    const newChildren = newVnode.children || [];
    if (typeof newChildren === "string") {
      //children是string
      if (typeof oldChildren === "string") {
        if (oldChildren === newChildren) {
          el.textContent = newChildren;
        }
      } else {
        el.innerHTML = newChildren;
      }
    } else if (Array.isArray(newChildren)) {
      if (typeof oldChildren === "string") {
        el.innerHTML = "";
        newChildren.forEach((item) => {
          mount(item, el);
        });
      }
      //oldChildren和newChildren都是数组
      else {
        //oldChildren [v2,v1,v3]
        //newChildren [v1,v5,v6]
        // 1.前面有相同节点的进行patch操作
        const commonLength = Math.min(oldChildren.length, newChildren.length);
        for (let i = 0; i < commonLength; i++) {
          patch(oldChildren[i], newChildren[i]);
        }
        // 2.newChildren>oldChildren的情况把多出来的vnode进行挂载如果oldChildren>newChildren移除
        if (newChildren.length > oldChildren.length) {
          newChildren.slice(oldChildren.length).forEach((item) => {
            mount(item, el);
          });
        } else if (newChildren.length > oldChildren.length) {
          // 移除旧的里面多出来的vnode
          oldChildren.slice(newChildren.length).forEach((item) => {
            el.removeChild(item.el);
          });
        }
      }
    }
  }
};
