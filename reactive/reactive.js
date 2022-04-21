class Dep {
  constructor() {
    this.subscribers = new Set();
  }
  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect);
    }
  }
  notify() {
    this.subscribers.forEach((effect) => {
      effect();
    });
  }
}
const dep = new Dep();
let activeEffect = null;
//收集依赖
function watchEffect(effect) {
  activeEffect = effect;
  dep.depend();
  effect();
  activeEffect = null;
}

const targetMap = new WeakMap();
function getDep(target, key) {
  // 根据对象target取出对应的Map对象
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Map();
    //commit test
    dep.set(key, dep);
  }
}

//对数据进行数据劫持 Object.defineProperty
function reactive(raw) {
  Object.keys(raw).forEach((key) => {
    Object.defineProperty(raw, key, {
      get() {
        dep.depend();
      },
      set(newVal) {},
    });
  });
  return raw;
}

//test
const info = { counter: 100 };
watchEffect(function doubleCounter() {
  console.log(info.counter * 2);
});

watchEffect(function powerCounter() {
  console.log(info.counter * info.counter);
});

info.counter++;
dep.notify();
