import * as f from "react";
import oe, { useMemo as ot, useCallback as kt, useState as re, useLayoutEffect as Xt, useRef as se } from "react";
var ut = { exports: {} }, at = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var zt;
function ae() {
  if (zt) return at;
  zt = 1;
  var e = Symbol.for("react.transitional.element"), n = Symbol.for("react.fragment");
  function o(a, s, r) {
    var i = null;
    if (r !== void 0 && (i = "" + r), s.key !== void 0 && (i = "" + s.key), "key" in s) {
      r = {};
      for (var d in s)
        d !== "key" && (r[d] = s[d]);
    } else r = s;
    return s = r.ref, {
      $$typeof: e,
      type: a,
      key: i,
      ref: s !== void 0 ? s : null,
      props: r
    };
  }
  return at.Fragment = n, at.jsx = o, at.jsxs = o, at;
}
var it = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Yt;
function ie() {
  return Yt || (Yt = 1, process.env.NODE_ENV !== "production" && function() {
    function e(t) {
      if (t == null) return null;
      if (typeof t == "function")
        return t.$$typeof === te ? null : t.displayName || t.name || null;
      if (typeof t == "string") return t;
      switch (t) {
        case V:
          return "Fragment";
        case E:
          return "Portal";
        case R:
          return "Profiler";
        case O:
          return "StrictMode";
        case T:
          return "Suspense";
        case L:
          return "SuspenseList";
      }
      if (typeof t == "object")
        switch (typeof t.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), t.$$typeof) {
          case j:
            return (t.displayName || "Context") + ".Provider";
          case w:
            return (t._context.displayName || "Context") + ".Consumer";
          case y:
            var c = t.render;
            return t = t.displayName, t || (t = c.displayName || c.name || "", t = t !== "" ? "ForwardRef(" + t + ")" : "ForwardRef"), t;
          case B:
            return c = t.displayName || null, c !== null ? c : e(t.type) || "Memo";
          case W:
            c = t._payload, t = t._init;
            try {
              return e(t(c));
            } catch {
            }
        }
      return null;
    }
    function n(t) {
      return "" + t;
    }
    function o(t) {
      try {
        n(t);
        var c = !1;
      } catch {
        c = !0;
      }
      if (c) {
        c = console;
        var u = c.error, S = typeof Symbol == "function" && Symbol.toStringTag && t[Symbol.toStringTag] || t.constructor.name || "Object";
        return u.call(
          c,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          S
        ), n(t);
      }
    }
    function a() {
    }
    function s() {
      if (rt === 0) {
        jt = console.log, Ot = console.info, Tt = console.warn, $t = console.error, At = console.group, Mt = console.groupCollapsed, Nt = console.groupEnd;
        var t = {
          configurable: !0,
          enumerable: !0,
          value: a,
          writable: !0
        };
        Object.defineProperties(console, {
          info: t,
          log: t,
          warn: t,
          error: t,
          group: t,
          groupCollapsed: t,
          groupEnd: t
        });
      }
      rt++;
    }
    function r() {
      if (rt--, rt === 0) {
        var t = { configurable: !0, enumerable: !0, writable: !0 };
        Object.defineProperties(console, {
          log: K({}, t, { value: jt }),
          info: K({}, t, { value: Ot }),
          warn: K({}, t, { value: Tt }),
          error: K({}, t, { value: $t }),
          group: K({}, t, { value: At }),
          groupCollapsed: K({}, t, { value: Mt }),
          groupEnd: K({}, t, { value: Nt })
        });
      }
      0 > rt && console.error(
        "disabledDepth fell below zero. This is a bug in React. Please file an issue."
      );
    }
    function i(t) {
      if (ht === void 0)
        try {
          throw Error();
        } catch (u) {
          var c = u.stack.trim().match(/\n( *(at )?)/);
          ht = c && c[1] || "", Vt = -1 < u.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < u.stack.indexOf("@") ? "@unknown:0:0" : "";
        }
      return `
` + ht + t + Vt;
    }
    function d(t, c) {
      if (!t || pt) return "";
      var u = vt.get(t);
      if (u !== void 0) return u;
      pt = !0, u = Error.prepareStackTrace, Error.prepareStackTrace = void 0;
      var S = null;
      S = Z.H, Z.H = null, s();
      try {
        var z = {
          DetermineComponentFrameRoot: function() {
            try {
              if (c) {
                var q = function() {
                  throw Error();
                };
                if (Object.defineProperty(q.prototype, "props", {
                  set: function() {
                    throw Error();
                  }
                }), typeof Reflect == "object" && Reflect.construct) {
                  try {
                    Reflect.construct(q, []);
                  } catch (H) {
                    var ct = H;
                  }
                  Reflect.construct(t, [], q);
                } else {
                  try {
                    q.call();
                  } catch (H) {
                    ct = H;
                  }
                  t.call(q.prototype);
                }
              } else {
                try {
                  throw Error();
                } catch (H) {
                  ct = H;
                }
                (q = t()) && typeof q.catch == "function" && q.catch(function() {
                });
              }
            } catch (H) {
              if (H && ct && typeof H.stack == "string")
                return [H.stack, ct.stack];
            }
            return [null, null];
          }
        };
        z.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
        var G = Object.getOwnPropertyDescriptor(
          z.DetermineComponentFrameRoot,
          "name"
        );
        G && G.configurable && Object.defineProperty(
          z.DetermineComponentFrameRoot,
          "name",
          { value: "DetermineComponentFrameRoot" }
        );
        var p = z.DetermineComponentFrameRoot(), F = p[0], et = p[1];
        if (F && et) {
          var P = F.split(`
`), Q = et.split(`
`);
          for (p = G = 0; G < P.length && !P[G].includes(
            "DetermineComponentFrameRoot"
          ); )
            G++;
          for (; p < Q.length && !Q[p].includes(
            "DetermineComponentFrameRoot"
          ); )
            p++;
          if (G === P.length || p === Q.length)
            for (G = P.length - 1, p = Q.length - 1; 1 <= G && 0 <= p && P[G] !== Q[p]; )
              p--;
          for (; 1 <= G && 0 <= p; G--, p--)
            if (P[G] !== Q[p]) {
              if (G !== 1 || p !== 1)
                do
                  if (G--, p--, 0 > p || P[G] !== Q[p]) {
                    var st = `
` + P[G].replace(
                      " at new ",
                      " at "
                    );
                    return t.displayName && st.includes("<anonymous>") && (st = st.replace("<anonymous>", t.displayName)), typeof t == "function" && vt.set(t, st), st;
                  }
                while (1 <= G && 0 <= p);
              break;
            }
        }
      } finally {
        pt = !1, Z.H = S, r(), Error.prepareStackTrace = u;
      }
      return P = (P = t ? t.displayName || t.name : "") ? i(P) : "", typeof t == "function" && vt.set(t, P), P;
    }
    function g(t) {
      if (t == null) return "";
      if (typeof t == "function") {
        var c = t.prototype;
        return d(
          t,
          !(!c || !c.isReactComponent)
        );
      }
      if (typeof t == "string") return i(t);
      switch (t) {
        case T:
          return i("Suspense");
        case L:
          return i("SuspenseList");
      }
      if (typeof t == "object")
        switch (t.$$typeof) {
          case y:
            return t = d(t.render, !1), t;
          case B:
            return g(t.type);
          case W:
            c = t._payload, t = t._init;
            try {
              return g(t(c));
            } catch {
            }
        }
      return "";
    }
    function l() {
      var t = Z.A;
      return t === null ? null : t.getOwner();
    }
    function m(t) {
      if (_t.call(t, "key")) {
        var c = Object.getOwnPropertyDescriptor(t, "key").get;
        if (c && c.isReactWarning) return !1;
      }
      return t.key !== void 0;
    }
    function k(t, c) {
      function u() {
        Gt || (Gt = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          c
        ));
      }
      u.isReactWarning = !0, Object.defineProperty(t, "key", {
        get: u,
        configurable: !0
      });
    }
    function b() {
      var t = e(this.type);
      return Wt[t] || (Wt[t] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), t = this.props.ref, t !== void 0 ? t : null;
    }
    function v(t, c, u, S, z, G) {
      return u = G.ref, t = {
        $$typeof: C,
        type: t,
        key: c,
        props: G,
        _owner: z
      }, (u !== void 0 ? u : null) !== null ? Object.defineProperty(t, "ref", {
        enumerable: !1,
        get: b
      }) : Object.defineProperty(t, "ref", { enumerable: !1, value: null }), t._store = {}, Object.defineProperty(t._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(t, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.freeze && (Object.freeze(t.props), Object.freeze(t)), t;
    }
    function $(t, c, u, S, z, G) {
      if (typeof t == "string" || typeof t == "function" || t === V || t === R || t === O || t === T || t === L || t === U || typeof t == "object" && t !== null && (t.$$typeof === W || t.$$typeof === B || t.$$typeof === j || t.$$typeof === w || t.$$typeof === y || t.$$typeof === ee || t.getModuleId !== void 0)) {
        var p = c.children;
        if (p !== void 0)
          if (S)
            if (gt(p)) {
              for (S = 0; S < p.length; S++)
                M(p[S], t);
              Object.freeze && Object.freeze(p);
            } else
              console.error(
                "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
              );
          else M(p, t);
      } else
        p = "", (t === void 0 || typeof t == "object" && t !== null && Object.keys(t).length === 0) && (p += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports."), t === null ? S = "null" : gt(t) ? S = "array" : t !== void 0 && t.$$typeof === C ? (S = "<" + (e(t.type) || "Unknown") + " />", p = " Did you accidentally export a JSX literal instead of a component?") : S = typeof t, console.error(
          "React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s",
          S,
          p
        );
      if (_t.call(c, "key")) {
        p = e(t);
        var F = Object.keys(c).filter(function(P) {
          return P !== "key";
        });
        S = 0 < F.length ? "{key: someKey, " + F.join(": ..., ") + ": ...}" : "{key: someKey}", Bt[p + S] || (F = 0 < F.length ? "{" + F.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          S,
          p,
          F,
          p
        ), Bt[p + S] = !0);
      }
      if (p = null, u !== void 0 && (o(u), p = "" + u), m(c) && (o(c.key), p = "" + c.key), "key" in c) {
        u = {};
        for (var et in c)
          et !== "key" && (u[et] = c[et]);
      } else u = c;
      return p && k(
        u,
        typeof t == "function" ? t.displayName || t.name || "Unknown" : t
      ), v(t, p, G, z, l(), u);
    }
    function M(t, c) {
      if (typeof t == "object" && t && t.$$typeof !== ne) {
        if (gt(t))
          for (var u = 0; u < t.length; u++) {
            var S = t[u];
            h(S) && A(S, c);
          }
        else if (h(t))
          t._store && (t._store.validated = 1);
        else if (t === null || typeof t != "object" ? u = null : (u = lt && t[lt] || t["@@iterator"], u = typeof u == "function" ? u : null), typeof u == "function" && u !== t.entries && (u = u.call(t), u !== t))
          for (; !(t = u.next()).done; )
            h(t.value) && A(t.value, c);
      }
    }
    function h(t) {
      return typeof t == "object" && t !== null && t.$$typeof === C;
    }
    function A(t, c) {
      if (t._store && !t._store.validated && t.key == null && (t._store.validated = 1, c = N(c), !Lt[c])) {
        Lt[c] = !0;
        var u = "";
        t && t._owner != null && t._owner !== l() && (u = null, typeof t._owner.tag == "number" ? u = e(t._owner.type) : typeof t._owner.name == "string" && (u = t._owner.name), u = " It was passed a child from " + u + ".");
        var S = Z.getCurrentStack;
        Z.getCurrentStack = function() {
          var z = g(t.type);
          return S && (z += S() || ""), z;
        }, console.error(
          'Each child in a list should have a unique "key" prop.%s%s See https://react.dev/link/warning-keys for more information.',
          c,
          u
        ), Z.getCurrentStack = S;
      }
    }
    function N(t) {
      var c = "", u = l();
      return u && (u = e(u.type)) && (c = `

Check the render method of \`` + u + "`."), c || (t = e(t)) && (c = `

Check the top-level render call using <` + t + ">."), c;
    }
    var x = oe, C = Symbol.for("react.transitional.element"), E = Symbol.for("react.portal"), V = Symbol.for("react.fragment"), O = Symbol.for("react.strict_mode"), R = Symbol.for("react.profiler"), w = Symbol.for("react.consumer"), j = Symbol.for("react.context"), y = Symbol.for("react.forward_ref"), T = Symbol.for("react.suspense"), L = Symbol.for("react.suspense_list"), B = Symbol.for("react.memo"), W = Symbol.for("react.lazy"), U = Symbol.for("react.offscreen"), lt = Symbol.iterator, te = Symbol.for("react.client.reference"), Z = x.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, _t = Object.prototype.hasOwnProperty, K = Object.assign, ee = Symbol.for("react.client.reference"), gt = Array.isArray, rt = 0, jt, Ot, Tt, $t, At, Mt, Nt;
    a.__reactDisabledLog = !0;
    var ht, Vt, pt = !1, vt = new (typeof WeakMap == "function" ? WeakMap : Map)(), ne = Symbol.for("react.client.reference"), Gt, Wt = {}, Bt = {}, Lt = {};
    it.Fragment = V, it.jsx = function(t, c, u, S, z) {
      return $(t, c, u, !1, S, z);
    }, it.jsxs = function(t, c, u, S, z) {
      return $(t, c, u, !0, S, z);
    };
  }()), it;
}
var Pt;
function le() {
  return Pt || (Pt = 1, process.env.NODE_ENV === "production" ? ut.exports = ae() : ut.exports = ie()), ut.exports;
}
var _ = le();
function ce(e) {
  const n = e.trim().match(/^([+-]?[\d.]+)([a-zA-Z%]+)$/);
  if (!n) return null;
  const o = parseFloat(n[1]), a = n[2];
  return { value: o, unit: a };
}
function Y(e, n) {
  return e === void 0 && n !== void 0 ? `${n}px` : e === "auto" || typeof e == "string" && /^(auto|100%|0|.*(fr|vh|vw|vmin|vmax|rem))$/.test(e) ? String(e) : typeof e == "number" ? `${e}px` : e ?? "";
}
const ue = {
  parentSize: 0,
  viewportWidth: typeof window < "u" ? window.innerWidth : 1920,
  viewportHeight: typeof window < "u" ? window.innerHeight : 1080,
  rootFontSize: 16,
  parentFontSize: 16
}, wt = {
  px: 1,
  in: 96,
  // 1in = 96px
  cm: 37.8,
  // 1cm = 37.8px
  mm: 3.78,
  // 1mm = 3.78px
  pt: 1.33,
  // 1pt = 1.33px
  pc: 16
  // 1pc = 16px
}, Dt = ["em", "rem", "vh", "vw", "vmin", "vmax", "%"];
function yt(e, n) {
  if (typeof e == "number") return e;
  if (typeof e != "string") return null;
  const o = ce(e);
  if (!o) return null;
  const { value: a, unit: s } = o;
  if (s in wt)
    return a * wt[s];
  if (s === "auto") return null;
  if (Dt.includes(s)) {
    const r = { ...ue, ...n };
    switch (s) {
      case "em":
        return a * r.parentFontSize;
      case "rem":
        return a * r.rootFontSize;
      case "vh":
        return a / 100 * r.viewportHeight;
      case "vw":
        return a / 100 * r.viewportWidth;
      case "vmin":
        return a / 100 * Math.min(r.viewportWidth, r.viewportHeight);
      case "vmax":
        return a / 100 * Math.max(r.viewportWidth, r.viewportHeight);
      case "%":
        return a / 100 * r.parentSize;
      default:
        return null;
    }
  }
  return null;
}
function Ze(e, n, o) {
  const a = (o == null ? void 0 : o.round) ?? !0, s = e === void 0 ? 0 : typeof e == "number" ? e : yt(e) ?? 0;
  return `${(a ? Math.round(s) : s) % n}px`;
}
function fe(e, n, o) {
  return Math.min(Math.max(e, n), o);
}
function Ke(e, n = 0) {
  if (n >= 0)
    return Number((Math.round(e * 10 ** n) / 10 ** n).toFixed(n));
  {
    const o = 10 ** Math.abs(n);
    return Math.round(e / o) * o;
  }
}
function dt(e, n = {}) {
  const {
    base: o = 8,
    round: a = !0,
    clamp: s,
    suppressWarnings: r = !1
  } = n;
  if (e === "auto") return o;
  let i = null;
  if (typeof e == "number")
    i = e;
  else if (typeof e == "string") {
    const l = yt(e);
    l === null ? (r || console.error(
      `Failed to convert "${e}" to pixels. Falling back to base ${o}.`
    ), i = o) : i = l;
  }
  i === null && (i = o);
  const d = a ? Math.round(i / o) * o : i, g = s !== void 0 ? fe(
    d,
    s.min ?? -1 / 0,
    s.max ?? 1 / 0
  ) : d;
  return !r && g !== i && console.warn(`Normalized ${i} to ${g} to match base ${o}px.`), g;
}
function Jt(e, n, o) {
  if (!e || e[0] === void 0 && e[1] === void 0)
    return n;
  const a = e[0] !== void 0 ? dt(e[0], o) : n[0], s = e[1] !== void 0 ? dt(e[1], o) : n[1];
  return [a, s];
}
function J(e) {
  if ("padding" in e && e.padding != null)
    return de(e.padding);
  const n = "block" in e && e.block != null ? be(e.block) : { top: 0, bottom: 0 }, o = "inline" in e && e.inline != null ? me(e.inline) : { left: 0, right: 0 };
  return {
    top: n.top,
    right: o.right,
    bottom: n.bottom,
    left: o.left
  };
}
function de(e) {
  if (typeof e == "number")
    return { top: e, right: e, bottom: e, left: e };
  if (Array.isArray(e)) {
    if (e.length === 2) {
      const [n, o] = e;
      return { top: n, right: o, bottom: n, left: o };
    }
    if (e.length >= 4) {
      const [n, o, a, s] = e;
      return {
        top: n ?? 0,
        right: o ?? 0,
        bottom: a ?? 0,
        left: s ?? 0
      };
    }
  }
  if (typeof e == "object" && !Array.isArray(e)) {
    const n = e.top ?? 0, o = e.bottom ?? 0, a = e.left ?? 0, s = e.right ?? 0;
    return { top: n, right: s, bottom: o, left: a };
  }
  return { top: 0, right: 0, bottom: 0, left: 0 };
}
function be(e) {
  if (typeof e == "number")
    return { top: e, bottom: e };
  if (Array.isArray(e)) {
    const [n, o] = e;
    return {
      top: n ?? 0,
      bottom: o ?? 0
    };
  }
  return typeof e == "object" ? {
    top: e.start ?? 0,
    bottom: e.end ?? 0
  } : { top: 0, bottom: 0 };
}
function me(e) {
  if (typeof e == "number")
    return { left: e, right: e };
  if (Array.isArray(e)) {
    const [n, o] = e;
    return {
      left: n ?? 0,
      right: o ?? 0
    };
  }
  return typeof e == "object" ? {
    left: e.start ?? 0,
    right: e.end ?? 0
  } : { left: 0, right: 0 };
}
function ge(e, n, o, a) {
  const s = J({ padding: o });
  if (a === "none")
    return s;
  if (a === "height") {
    const r = e % n;
    r !== 0 && (s.bottom += n - r);
  }
  if (a === "clamp") {
    s.top = s.top % n;
    const r = e % n;
    r !== 0 && (s.bottom += n - r), s.bottom = s.bottom % n;
  }
  return s;
}
const X = (...e) => e.filter(Boolean).join(" ").trim(), I = (...e) => Object.assign({}, ...e.filter((n) => n !== void 0));
function he(e, n) {
  if (e)
    if (typeof e == "function")
      e(n);
    else
      try {
        Object.assign(e, { current: n });
      } catch (o) {
        console.error("Error assigning ref:", o);
      }
}
function Zt(...e) {
  return (n) => {
    e.forEach((o) => {
      he(o, n);
    });
  };
}
const Qe = (e, n) => {
  let o = null;
  const a = () => {
    o && (clearTimeout(o), o = null);
  };
  return [(...r) => {
    a(), o = setTimeout(() => e(...r), n);
  }, a];
}, Kt = (e) => {
  let n = null, o = null;
  return (...s) => {
    o = s, n !== null && cancelAnimationFrame(n), n = requestAnimationFrame(() => {
      e(...o), n = null, o = null;
    });
  };
};
function bt(e) {
  const [n, o] = f.useState({ width: 0, height: 0 }), a = f.useCallback(() => {
    if (e.current)
      try {
        const r = e.current.getBoundingClientRect(), i = {
          width: r ? Math.round(r.width) : 0,
          height: r ? Math.round(r.height) : 0
        };
        o(
          (d) => d.width === i.width && d.height === i.height ? d : i
        );
      } catch {
        o({ width: 0, height: 0 });
      }
  }, [e]), s = f.useMemo(() => Kt(a), [a]);
  return f.useLayoutEffect(() => {
    a();
  }, [a]), f.useLayoutEffect(() => {
    if (!e.current) return;
    const r = new ResizeObserver(() => {
      s();
    });
    return r.observe(e.current), () => {
      r.disconnect();
    };
  }, [e, s]), { ...n, refresh: s };
}
function pe({
  totalLines: e,
  lineHeight: n,
  containerRef: o,
  buffer: a = 0
}) {
  const s = ot(
    () => typeof a == "number" ? a : parseInt(a, 10) || 0,
    [a]
  ), r = kt(() => {
    const m = o.current;
    if (!m) return { start: 0, end: e };
    if (m.closest(".block"))
      return { start: 0, end: e };
    const b = m.getBoundingClientRect().top + window.scrollY, v = Math.max(0, window.scrollY - b - s), $ = v + window.innerHeight + s * 2, M = Math.max(0, Math.floor(v / n)), h = Math.min(e, Math.ceil($ / n));
    return { start: M, end: h };
  }, [e, n, o, s]), [i, d] = re(r);
  ve(["scroll", "resize"], () => {
    l();
  });
  const g = kt(() => {
    d((m) => {
      const k = r();
      return m.start !== k.start || m.end !== k.end ? k : m;
    });
  }, [r]), l = ot(() => Kt(g), [g]);
  return Xt(() => {
    const m = o.current;
    if (!m) return;
    const k = new IntersectionObserver(l, { threshold: 0 });
    return k.observe(m), l(), () => {
      k.disconnect();
    };
  }, [o, r, l]), i;
}
function ve(e, n) {
  const o = kt(n, [n]);
  Xt(() => {
    const a = () => o();
    return e.forEach((s) => window.addEventListener(s, a)), () => e.forEach((s) => window.removeEventListener(s, a));
  }, [e, o]);
}
function mt(e, {
  base: n = 8,
  snapping: o = "none",
  spacing: a = {},
  warnOnMisalignment: s = !1
} = {}) {
  if (n < 1)
    throw new Error("Base must be >= 1 for baseline alignment.");
  const { height: r } = bt(e), i = se(!1);
  return ot(() => {
    const d = J({ padding: a }), g = r % n === 0;
    if (!g && s && process.env.NODE_ENV === "development" && console.warn(
      `[useBaseline] Element height (${r}px) is not aligned with base (${n}px).`
    ), o === "none")
      return { padding: d, isAligned: g, height: r };
    if (i.current)
      return { padding: d, isAligned: g, height: r };
    const l = ge(r, n, d, o);
    return i.current = !0, { padding: l, isAligned: g, height: r };
  }, [n, o, a, s, r]);
}
function xe(e, n) {
  const { width: o } = bt(e);
  return ot(() => {
    const a = n.variant ?? "line", s = dt(n.gap ?? 0, { base: 1 });
    if (!o)
      return {
        template: "none",
        columnsCount: 0,
        calculatedGap: 0,
        isValid: !1
      };
    try {
      switch (a) {
        case "line": {
          const r = Math.max(1, Math.floor(o / (s + 1)) + 1);
          return {
            template: `repeat(${r}, 1px)`,
            columnsCount: r,
            calculatedGap: s,
            isValid: !0
          };
        }
        case "pattern": {
          if (!Ie(n.columns))
            throw new Error('Invalid "pattern" columns array');
          const r = n.columns.map((i) => typeof i == "number" ? `${i}px` : i);
          return r.some((i) => i === "0" || i === "0px") ? {
            template: "none",
            columnsCount: 0,
            calculatedGap: 0,
            isValid: !1
          } : {
            template: r.join(" "),
            columnsCount: r.length,
            calculatedGap: s,
            isValid: !0
          };
        }
        case "fixed": {
          const r = typeof n.columns == "number" ? n.columns : 0;
          if (r < 1)
            throw new Error(`Invalid columns count: ${r}`);
          const i = n.columnWidth ? Y(n.columnWidth) : "1fr";
          return {
            template: `repeat(${r}, ${i})`,
            columnsCount: r,
            calculatedGap: s,
            isValid: !0
          };
        }
        case "auto": {
          const r = n.columnWidth ?? "auto";
          if (r === "auto")
            return {
              template: "repeat(auto-fit, minmax(0, 1fr))",
              columnsCount: 1,
              calculatedGap: s,
              isValid: !0
            };
          const i = typeof r == "number" ? `${r}px` : r.toString(), d = yt(i) ?? 0, g = d > 0 ? Math.max(1, Math.floor((o + s) / (d + s))) : 1;
          return {
            template: `repeat(auto-fit, minmax(${i}, 1fr))`,
            columnsCount: g,
            calculatedGap: s,
            isValid: !0
          };
        }
        default: {
          console.warn(
            `[useGuide] Unknown variant "${a}". Falling back to "line".`
          );
          const r = Math.max(1, Math.floor(o / (s + 1)) + 1);
          return {
            template: `repeat(${r}, 1px)`,
            columnsCount: r,
            calculatedGap: s,
            isValid: !0
          };
        }
      }
    } catch (r) {
      return console.warn("Error in useGuide:", r), {
        template: "none",
        columnsCount: 0,
        calculatedGap: 0,
        isValid: !1
      };
    }
  }, [n, o]);
}
function D(e) {
  const n = Qt();
  return ot(() => Object.assign(
    { base: n.base },
    n[e]
  ), [n, e]);
}
function tt(e, n) {
  return ot(() => {
    const o = e ?? n;
    return {
      isShown: o === "visible",
      isHidden: o === "hidden",
      isNone: o === "none",
      debugging: o
    };
  }, [e, n]);
}
const ke = {
  /** Color for single-line guides */
  line: "var(--bk-guide-color-line-theme)",
  /** Color for pattern-based guides */
  pattern: "var(--bk-guide-color-pattern-theme)",
  /** Color for auto-calculated guides */
  auto: "var(--bk-guide-color-auto-theme)",
  /** Color for fixed-column guides */
  fixed: "var(--bk-guide-color-fixed-theme)"
}, we = {
  /** Color for line variant */
  line: "var(--bk-baseline-color-line-theme)",
  /** Color for flat/block variant */
  flat: "var(--bk-baseline-color-flat-theme)"
}, ye = {
  /** Color for line-style spacers */
  line: "var(--bk-spacer-color-line-theme)",
  /** Color for flat/block spacers */
  flat: "var(--bk-spacer-color-flat-theme)",
  /** Color for measurement indicators */
  text: "var(--bk-spacer-color-text-theme)"
}, Ee = {
  /** Border color for debug outline */
  line: "var(--bk-box-color-line-theme)",
  /** Background color for debug mode */
  flat: "var(--bk-box-color-flat-theme)",
  /** Color for measurement indicators */
  text: "var(--bk-box-color-text-theme)"
}, Se = {
  /** Border color for debug outline */
  line: "var(--bk-stack-color-line-theme)",
  /** Background color for debug mode */
  flat: "var(--bk-stack-color-flat-theme)",
  /** Color for measurement indicators */
  text: "var(--bk-stack-color-text-theme)"
}, Ce = {
  /** Border color for debug outline */
  line: "var(--bk-layout-color-line-theme)",
  /** Background color for debug mode */
  flat: "var(--bk-layout-color-flat-theme)",
  /** Color for measurement indicators */
  text: "var(--bk-layout-color-text-theme)"
}, Re = "var(--bk-padder-color-theme)", _e = {
  /** Base unit for spacing calculations (in pixels) */
  base: 8,
  /** Baseline grid configuration */
  baseline: {
    variant: "line",
    debugging: "hidden",
    colors: we
  },
  /** Guide overlay configuration */
  guide: {
    variant: "line",
    debugging: "hidden",
    colors: ke
  },
  /** Spacer component configuration */
  spacer: {
    variant: "line",
    debugging: "hidden",
    colors: ye
  },
  /** Box component configuration */
  box: {
    debugging: "hidden",
    colors: Ee
  },
  /** Stack/Flex component configuration */
  stack: {
    debugging: "hidden",
    colors: Se
  },
  /** Layout component configuration */
  layout: {
    debugging: "hidden",
    colors: Ce
  },
  /** Padder component configuration */
  padder: {
    debugging: "hidden",
    color: Re
  }
}, Et = f.createContext(_e);
Et.displayName = "ConfigContext";
const Qt = () => f.useContext(Et), tn = ({
  base: e,
  baseline: n,
  guide: o,
  stack: a,
  spacer: s,
  layout: r,
  box: i,
  padder: d
}) => ({
  "--bkb": `${e}px`,
  // Baseline Colors
  "--bkbcl": n.colors.line,
  "--bkbcf": n.colors.flat,
  // Guide Colors
  "--bkgcl": o.colors.line,
  "--bkgcp": o.colors.pattern,
  "--bkgca": o.colors.auto,
  "--bkgcf": o.colors.fixed,
  // Spacer Colors
  "--bkscl": s.colors.line,
  "--bkscf": s.colors.flat,
  "--bksci": s.colors.text,
  // Box Colors
  "--bkxcl": i.colors.line,
  "--bkxcf": i.colors.flat,
  "--bkxci": i.colors.text,
  // Flex Colors
  "--bkkcl": a.colors.line,
  "--bkkcf": a.colors.flat,
  "--bkkci": a.colors.text,
  // Layout Colors
  "--bklcl": r.colors.line,
  "--bklcf": r.colors.flat,
  "--bklci": r.colors.text,
  // Padder Color
  "--bkpc": d.color
});
function St({
  children: e,
  base: n,
  stack: o,
  baseline: a,
  guide: s,
  layout: r,
  spacer: i,
  box: d,
  padder: g
}) {
  const l = Qt(), m = f.useMemo(() => ({
    base: n ?? l.base,
    baseline: { ...l.baseline, ...a },
    guide: { ...l.guide, ...s },
    spacer: { ...l.spacer, ...i },
    box: { ...l.box, ...d },
    stack: { ...l.stack, ...o },
    layout: { ...l.layout, ...r },
    padder: { ...l.padder, ...g }
  }), [
    n,
    l.base,
    l.baseline,
    l.guide,
    l.spacer,
    l.box,
    l.stack,
    l.layout,
    l.padder,
    a,
    s,
    i,
    d,
    o,
    r,
    g
  ]);
  return /* @__PURE__ */ _.jsx(Et.Provider, { value: m, children: e });
}
const je = "spr_zbcF6", Oe = "line_qHW69", Te = "flat_gqixr", Ut = {
  spr: je,
  line: Oe,
  flat: Te
}, $e = f.memo(function({
  height: n,
  width: o,
  indicatorNode: a,
  debugging: s,
  variant: r,
  base: i,
  color: d,
  className: g,
  style: l,
  ...m
}) {
  const k = f.useRef(null), b = D("spacer"), { isShown: v } = tt(s, b.debugging), $ = r ?? b.variant, M = i ?? b.base, [h, A] = Jt(
    [o, n],
    [0, 0],
    { base: M, suppressWarnings: !0 }
  ), N = f.useMemo(() => !v || !a ? null : [
    A !== 0 && /* @__PURE__ */ _.jsx("span", { children: a(A, "height") }, "height"),
    h !== 0 && /* @__PURE__ */ _.jsx("span", { children: a(h, "width") }, "width")
  ].filter(Boolean), [v, a, A, h]), x = f.useMemo(() => ({
    "--bksh": "100%",
    "--bksw": "100%",
    "--bksb": `${b.base}px`,
    "--bksci": "var(--bk-spacer-color-text-theme)",
    "--bkscl": "var(--bk-spacer-color-line-theme)",
    "--bkscf": "var(--bk-spacer-color-flat-theme)"
  }), [b.base]), C = f.useCallback(
    (V, O) => (V === "--bksw" || V === "--bksh") && O === "100%" ? {} : O !== x[V] ? { [V]: O } : {},
    [x]
  ), E = f.useMemo(() => {
    const V = Y(A || "100%"), O = Y(h || "100%"), R = `${i || b.base}px`, w = {
      ...C("--bksh", V),
      ...C("--bksw", O),
      ...C("--bksb", R),
      ...C(
        "--bksci",
        d ?? b.colors.text
      ),
      ...C(
        "--bkscl",
        d ?? b.colors.line
      ),
      ...C(
        "--bkscf",
        d ?? b.colors.flat
      )
    };
    return I(w, l);
  }, [
    C,
    A,
    h,
    b.base,
    d,
    b.colors.text,
    b.colors.line,
    b.colors.flat,
    l
  ]);
  return /* @__PURE__ */ _.jsx(
    "div",
    {
      ref: k,
      "data-testid": "spacer",
      className: X(Ut.spr, v && Ut[$], g),
      "data-variant": $,
      style: E,
      ...m,
      children: N
    }
  );
}), Ae = "pad_w2-sL", Me = "v_lhGBy", xt = {
  pad: Ae,
  v: Me
}, Ct = f.memo(
  f.forwardRef(function({
    children: n,
    className: o,
    debugging: a,
    height: s,
    indicatorNode: r,
    style: i,
    width: d,
    ...g
  }, l) {
    const m = D("padder"), { variant: k } = D("spacer"), b = f.useMemo(
      () => J(g),
      [g]
    ), { isShown: v, isNone: $, debugging: M } = tt(
      a,
      m.debugging
    ), h = !$, A = f.useRef(null), {
      padding: { top: N, left: x, bottom: C, right: E }
    } = mt(A, {
      base: m.base,
      snapping: "height",
      spacing: b,
      warnOnMisalignment: !$
    }), V = Zt(l, A), O = f.useMemo(() => {
      const w = {};
      return d !== "fit-content" && (w["--bkpw"] = Y(d || "fit-content")), s !== "fit-content" && (w["--bkph"] = Y(s || "fit-content")), m.base !== 8 && (w["--bkpb"] = `${m.base}px`), m.color !== "var(--bk-padder-color-theme)" && (w["--bkpc"] = m.color), h || ((N > 0 || C > 0) && (w.paddingBlock = `${N}px ${C}px`), (x > 0 || E > 0) && (w.paddingInline = `${x}px ${E}px`)), I(w, i);
    }, [
      d,
      s,
      m.base,
      m.color,
      h,
      N,
      E,
      C,
      x,
      i
    ]), R = (w, j) => /* @__PURE__ */ _.jsx(
      $e,
      {
        variant: k,
        debugging: M,
        indicatorNode: r,
        height: j !== "100%" ? j : void 0,
        width: w !== "100%" ? w : void 0
      }
    );
    return h ? /* @__PURE__ */ _.jsxs(
      "div",
      {
        ref: V,
        "data-testid": "padder",
        className: X(xt.pad, v && xt.v, o),
        style: O,
        children: [
          /* @__PURE__ */ _.jsxs(_.Fragment, { children: [
            N > 0 && /* @__PURE__ */ _.jsx("div", { style: { gridColumn: "1 / -1" }, children: R("100%", N) }),
            x > 0 && /* @__PURE__ */ _.jsx("div", { style: { gridRow: "2 / 3" }, children: R(x, "100%") })
          ] }),
          /* @__PURE__ */ _.jsx("div", { style: { gridRow: "2 / 3", gridColumn: "2 / 3" }, children: n }),
          /* @__PURE__ */ _.jsxs(_.Fragment, { children: [
            E > 0 && /* @__PURE__ */ _.jsx("div", { style: { gridRow: "2 / 3" }, children: R(E, "100%") }),
            C > 0 && /* @__PURE__ */ _.jsx("div", { style: { gridColumn: "1 / -1" }, children: R("100%", C) })
          ] })
        ]
      }
    ) : /* @__PURE__ */ _.jsx(
      "div",
      {
        ref: V,
        "data-testid": "padder",
        className: X(xt.pad, o),
        style: O,
        children: n
      }
    );
  })
), Ne = "lay_5cMu5", Ve = "v_dprVE", Ft = {
  lay: Ne,
  v: Ve
};
function Ht(e) {
  return typeof e == "number" ? `repeat(${e}, 1fr)` : typeof e == "string" ? e : Array.isArray(e) ? e.map((n) => typeof n == "number" ? `${n}px` : n).join(" ") : "repeat(auto-fit, minmax(100px, 1fr))";
}
const en = f.memo(function({
  children: n,
  columns: o,
  rows: a,
  rowGap: s,
  columnGap: r,
  gap: i,
  height: d,
  width: g,
  indicatorNode: l,
  justifyItems: m,
  alignItems: k,
  justifyContent: b,
  alignContent: v,
  className: $,
  variant: M,
  style: h,
  debugging: A,
  ...N
}) {
  const x = D("layout"), { isShown: C } = tt(A, x.debugging), E = f.useRef(null), V = f.useMemo(
    () => J(N),
    [N]
  ), { padding: O } = mt(E, {
    base: x.base,
    snapping: "height",
    spacing: V,
    warnOnMisalignment: !0
  }), R = f.useMemo(
    () => Ht(o),
    [o]
  ), w = f.useMemo(
    () => a ? Ht(a) : "auto",
    [a]
  ), j = f.useMemo(
    () => ({
      "--bklw": "auto",
      "--bklh": "auto",
      "--bklcl": x.colors.line,
      "--bklcf": x.colors.flat,
      "--bklci": x.colors.text
    }),
    [x.colors.line, x.colors.flat, x.colors.text]
  ), y = f.useCallback(
    (B, W) => (B === "--bklw" || B === "--bklh") && W === "auto" ? {} : W !== j[B] ? { [B]: W } : {},
    [j]
  ), T = f.useMemo(
    () => ({
      ...i !== void 0 && { gap: Y(i) },
      ...s !== void 0 && { rowGap: Y(s) },
      ...r !== void 0 && { columnGap: Y(r) }
    }),
    [i, s, r]
  ), L = f.useMemo(() => {
    const B = Y(g || "auto"), W = Y(d || "auto");
    return I(
      {
        // Theme overrides
        ...y("--bklw", B),
        ...y("--bklh", W),
        ...y("--bklcl", x.colors.line),
        ...y("--bklcf", x.colors.flat),
        ...y("--bklci", x.colors.text),
        // Grid properties - only inject if different from defaults
        ...R !== "repeat(auto-fit, minmax(100px, 1fr))" && {
          "--bklgtc": R
        },
        ...w !== "auto" && { "--bklgtr": w },
        ...m && { "--bklji": m },
        ...k && { "--bklai": k },
        ...b && { "--bkljc": b },
        ...v && { "--bklac": v },
        // Include gap styles
        ...T
      },
      h
    );
  }, [
    R,
    w,
    m,
    k,
    b,
    v,
    g,
    d,
    x.colors.line,
    x.colors.flat,
    x.colors.text,
    y,
    h,
    T
  ]);
  return /* @__PURE__ */ _.jsx(
    St,
    {
      spacer: { variant: M ?? "line" },
      children: /* @__PURE__ */ _.jsx(
        Ct,
        {
          ref: E,
          className: C ? Ft.v : "",
          block: [O.top, O.bottom],
          indicatorNode: l,
          inline: [O.left, O.right],
          debugging: A,
          width: g,
          height: d,
          children: /* @__PURE__ */ _.jsx(
            "div",
            {
              "data-testid": "layout",
              className: X($, Ft.lay),
              style: L,
              children: n
            }
          )
        }
      )
    }
  );
}), Ge = "box_rDCRX", We = "v_0MMHD", It = {
  box: Ge,
  v: We
}, nn = f.memo(
  f.forwardRef(function({
    children: n,
    snapping: o = "clamp",
    debugging: a,
    className: s,
    colSpan: r,
    rowSpan: i,
    span: d,
    width: g,
    height: l,
    style: m,
    ...k
  }, b) {
    const v = D("box"), { isShown: $, debugging: M } = tt(a, v.debugging), h = f.useRef(null), { top: A, bottom: N, left: x, right: C } = J(k), { padding: E } = mt(h, {
      base: v.base,
      snapping: o,
      spacing: { top: A, bottom: N, left: x, right: C },
      warnOnMisalignment: M !== "none"
    }), V = f.useMemo(() => {
      const j = {};
      return d !== void 0 ? (j.gridColumn = `span ${d}`, j.gridRow = `span ${d}`) : (r !== void 0 && (j.gridColumn = `span ${r}`), i !== void 0 && (j.gridRow = `span ${i}`)), j;
    }, [r, i, d]), O = f.useMemo(
      () => ({
        "--bkxw": "fit-content",
        "--bkxh": "fit-content",
        "--bkxb": `${v.base}px`,
        "--bkxcl": v.colors.line
      }),
      [v.base, v.colors.line]
    ), R = f.useCallback(
      (j, y) => (j === "--bkxw" || j === "--bkxh") && y === "fit-content" ? {} : y !== O[j] ? { [j]: y } : {},
      [O]
    ), w = f.useMemo(() => {
      const j = Y(g || "fit-content"), y = Y(l || "fit-content"), T = {
        ...R("--bkxw", j),
        ...R("--bkxh", y),
        ...R("--bkxb", `${v.base}px`),
        ...R("--bkxcl", v.colors.line)
      };
      return I(T, m);
    }, [
      v.base,
      v.colors.line,
      g,
      l,
      R,
      m
    ]);
    return /* @__PURE__ */ _.jsx(
      "div",
      {
        ref: Zt(b, h),
        "data-testid": "box",
        className: X(It.box, $ && It.v, s),
        style: I(w, V),
        children: /* @__PURE__ */ _.jsx(
          St,
          {
            base: 1,
            spacer: { variant: "flat" },
            children: /* @__PURE__ */ _.jsx(
              Ct,
              {
                block: [E.top, E.bottom],
                inline: [E.left, E.right],
                width: "fit-content",
                height: l,
                debugging: M,
                children: n
              }
            )
          }
        )
      }
    );
  })
), Be = "stk_l-58l", Le = "v_-k3qw", qt = {
  stk: Be,
  v: Le
}, on = f.memo(function({
  align: n = "flex-start",
  children: o,
  className: a,
  columnGap: s,
  debugging: r,
  direction: i = "row",
  gap: d,
  height: g,
  indicatorNode: l,
  justify: m = "flex-start",
  rowGap: k,
  style: b,
  variant: v,
  width: $,
  ...M
}) {
  const h = D("stack"), { isShown: A, debugging: N } = tt(r, h.debugging), x = f.useRef(null), C = f.useMemo(
    () => J(M),
    [M]
  ), { padding: E } = mt(x, {
    base: h.base,
    snapping: "height",
    spacing: C,
    warnOnMisalignment: !0
  }), V = f.useMemo(
    () => ({
      rowGap: k,
      columnGap: s,
      ...d !== void 0 && { gap: d }
    }),
    [k, s, d]
  ), O = f.useMemo(
    () => ({
      "--bkkw": "auto",
      "--bkkh": "auto",
      "--bkkcl": h.colors.line,
      "--bkkcf": h.colors.flat,
      "--bkkci": h.colors.text
    }),
    [h.colors.line, h.colors.flat, h.colors.text]
  ), R = f.useCallback(
    (y, T) => y === "--bkkw" && T === "auto" ? {} : y === "--bkkh" && T === "auto" ? {} : T !== O[y] ? { [y]: T } : {},
    [O]
  ), w = f.useMemo(() => {
    const y = Y($ || "auto"), T = Y(g || "auto"), L = {
      ...R("--bkkw", y),
      ...R("--bkkh", T),
      ...R("--bkkcl", h.colors.line),
      ...R("--bkkcf", h.colors.flat),
      ...R("--bkkci", h.colors.text)
    };
    return I({
      flexDirection: i,
      justifyContent: m,
      alignItems: n,
      width: $,
      height: g
    }, V, L, b);
  }, [
    i,
    m,
    n,
    $,
    g,
    h.colors.line,
    h.colors.flat,
    h.colors.text,
    R,
    V,
    b
  ]), j = N === "none" ? {
    ...w,
    paddingBlock: `${E.top}px ${E.bottom}px`,
    paddingInline: `${E.left}px ${E.right}px`
  } : w;
  return /* @__PURE__ */ _.jsx(
    St,
    {
      spacer: { variant: v ?? "line" },
      children: /* @__PURE__ */ _.jsx(
        Ct,
        {
          ref: x,
          className: A ? qt.v : "",
          block: [E.top, E.bottom],
          inline: [E.left, E.right],
          debugging: N,
          indicatorNode: l,
          width: $,
          height: g,
          children: /* @__PURE__ */ _.jsx(
            "div",
            {
              "data-testid": "stack",
              className: X(a, qt.stk),
              style: j,
              ...M,
              children: o
            }
          )
        }
      )
    }
  );
}), ze = "gde_-Naxo", Ye = "line_-VS-e", Pe = "cols_8lD6D", Ue = "col_rlbsL", nt = {
  gde: ze,
  line: Ye,
  cols: Pe,
  col: Ue
}, rn = f.memo(function({
  className: n,
  debugging: o,
  style: a,
  variant: s,
  align: r = "start",
  gap: i,
  height: d,
  width: g,
  columns: l,
  columnWidth: m,
  ...k
}) {
  const b = D("guide"), v = s ?? b.variant, { isShown: $ } = tt(o, b.debugging), M = f.useRef(null), { width: h, height: A } = bt(M), { top: N, right: x, bottom: C, left: E } = f.useMemo(() => J(k), [k]), V = f.useMemo(() => {
    const W = dt(i);
    return {
      line: {
        variant: "line",
        gap: W - 1,
        base: b.base
      },
      auto: m ? {
        variant: "auto",
        columnWidth: m,
        gap: W,
        base: b.base
      } : null,
      pattern: Array.isArray(l) ? {
        variant: "pattern",
        columns: l,
        gap: W,
        base: b.base
      } : null,
      fixed: typeof l == "number" ? {
        variant: "fixed",
        columns: l,
        columnWidth: m,
        gap: W,
        base: b.base
      } : null
    }[v] ?? {
      variant: "line",
      gap: W - 1,
      base: b.base
    };
  }, [i, b.base, m, l, v]), {
    template: O,
    columnsCount: R,
    calculatedGap: w
  } = xe(M, V), j = f.useMemo(() => ({
    "--bkgg": `${w}px`,
    "--bkgj": "start",
    "--bkgcl": b.colors.line,
    "--bkgcp": b.colors.pattern,
    "--bkgw": "100vw",
    "--bkgh": "100vh"
  }), [w, b.colors.line, b.colors.pattern]), y = f.useCallback(
    (W, U) => W === "--bkgw" && U === "100vw" || W === "--bkgh" && U === "100vh" ? {} : U !== j[W] ? { [W]: U } : {},
    [j]
  ), T = {
    "--bkgg": `${w}px`,
    "--bkgj": r,
    "--bkgcl": b.colors.line,
    "--bkgcp": b.colors.pattern,
    "--bkgpb": `${N}px ${C}px`,
    "--bkgpi": `${E}px ${x}px`,
    "--bkgt": O,
    "--bkgw": Y(g ?? h, 0) || "100vw",
    "--bkgh": Y(d ?? A, 0) || "100vh"
  }, L = {
    ...y("--bkgw", T["--bkgw"]),
    ...y("--bkgh", T["--bkgh"]),
    ...y("--bkgj", r),
    ...y("--bkgcl", b.colors.line),
    ...y("--bkgcp", b.colors.pattern),
    ...y("--bkgg", `${w}px`)
  }, B = I(T, L, a);
  return /* @__PURE__ */ _.jsx(
    "div",
    {
      ref: M,
      "data-testid": "guide",
      className: X(
        nt.gde,
        n,
        $ ? nt.v : nt.h,
        v === "line" && nt.line
      ),
      "data-variant": v,
      style: B,
      ...k,
      children: $ && /* @__PURE__ */ _.jsx("div", { className: nt.cols, "data-variant": v, children: Array.from({ length: R }, (W, U) => {
        const lt = b.colors[v] ?? b.colors.line;
        return /* @__PURE__ */ _.jsx(
          "div",
          {
            className: nt.col,
            "data-column-index": U,
            "data-variant": v,
            style: { backgroundColor: lt }
          },
          U
        );
      }) })
    }
  );
}), Fe = /^\d*\.?\d+(?:fr|px|%|em|rem|vh|vw|vmin|vmax|pt|pc|in|cm|mm)$/, He = (e) => typeof e == "number" ? Number.isFinite(e) && e >= 0 : typeof e != "string" ? !1 : e === "auto" || e === "100%" || Fe.test(e), Ie = (e) => Array.isArray(e) && e.length > 0 && e.every(He), sn = (e) => {
  const n = [...Object.keys(wt), ...Dt];
  return typeof e == "number" || typeof e == "string" && n.some((o) => e.endsWith(o));
}, an = (e) => typeof e == "string" && De.includes(e), Rt = (e) => typeof e == "object" && e !== null, ln = (e) => Rt(e) && e.variant === "line", cn = (e) => Rt(e) && "columns" in e && !("variant" in e), un = (e) => Rt(e) && "columnWidth" in e && !("variant" in e) && !("columns" in e), qe = "bas_e-SXr", Xe = "row_q-FZb", ft = {
  bas: qe,
  row: Xe
}, fn = f.memo(function({
  className: n,
  debugging: o,
  style: a,
  variant: s,
  height: r,
  width: i,
  base: d,
  ...g
}) {
  const l = D("baseline"), m = s ?? l.variant, k = d ?? l.base, { isShown: b } = tt(o, l.debugging), v = f.useRef(null), { width: $, height: M } = bt(v), [h, A] = f.useMemo(() => Jt(
    [i, r],
    [$, M]
  ), [i, r, $, M]), { top: N, right: x, bottom: C, left: E } = f.useMemo(
    () => J(g),
    [g]
  ), V = f.useMemo(() => {
    const T = (A ?? 0) - (N + C);
    return Math.max(1, Math.floor(T / k));
  }, [A, N, C, k]), { start: O, end: R } = pe({
    totalLines: V,
    lineHeight: k,
    containerRef: v,
    buffer: 160
  }), w = m === "line" ? l.colors.line : l.colors.flat, j = f.useMemo(() => {
    const T = [N, x, C, E].map((L) => L ? `${L}px` : "0").join(" ");
    return I(
      {
        "--bkbw": i ? `${h}px` : "100%",
        "--bkbh": r ? `${A}px` : "100%",
        ...T !== "0 0 0 0" && { padding: T }
      },
      a
    );
  }, [
    N,
    x,
    C,
    E,
    i,
    h,
    r,
    A,
    a
  ]), y = f.useCallback(
    (T) => {
      const L = m === "line" ? "1px" : `${k}px`, B = m === "line" ? l.colors.line : l.colors.flat;
      return I({
        "--bkrt": `${T * k}px`,
        ...L !== "1px" && { "--bkrh": L },
        ...w !== B && { "--bkbcl": w }
      });
    },
    [k, m, w, l.colors.line, l.colors.flat]
  );
  return /* @__PURE__ */ _.jsx(
    "div",
    {
      ref: v,
      "data-testid": "baseline",
      className: X(
        ft.bas,
        b ? ft.v : ft.h,
        n
      ),
      style: j,
      ...g,
      children: b && Array.from({ length: R - O }, (T, L) => {
        const B = L + O;
        return /* @__PURE__ */ _.jsx(
          "div",
          {
            className: ft.row,
            "data-row-index": B,
            style: y(B)
          },
          B
        );
      })
    }
  );
}), De = ["start", "center", "end"], dn = ["line", "flat"];
export {
  wt as ABSOLUTE_UNIT_CONVERSIONS,
  fn as Baseline,
  nn as Box,
  St as Config,
  _e as DEFAULT_CONFIG,
  De as GRID_ALIGNMENTS,
  rn as Guide,
  en as Layout,
  dn as PADD_VARIANTS,
  Ct as Padder,
  Dt as RELATIVE_UNITS,
  $e as Spacer,
  on as Stack,
  ge as calculateSnappedSpacing,
  fe as clamp,
  yt as convertValue,
  tn as createCSSVariables,
  Qe as debounce,
  Y as formatValue,
  un as isAutoCalculatedGuide,
  an as isGuideAlignment,
  cn as isGuideColumnConfig,
  ln as isGuideLineConfig,
  sn as isGuideValue,
  He as isValidGuideColumnValue,
  Ie as isValidGuidePattern,
  X as mergeClasses,
  Zt as mergeRefs,
  I as mergeStyles,
  Ze as moduloize,
  dt as normalizeValue,
  Jt as normalizeValuePair,
  J as parsePadding,
  ce as parseUnit,
  Kt as rafThrottle,
  Ke as round,
  mt as useBaseline,
  D as useConfig,
  tt as useDebug,
  Qt as useDefaultConfig,
  xe as useGuide,
  bt as useMeasure,
  pe as useVirtual
};
//# sourceMappingURL=index.mjs.map
