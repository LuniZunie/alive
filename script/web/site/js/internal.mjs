function execCheck(v, check) {
  if (check(v)) return v;
  else throw new TypeError('Return value did not pass safe mode check!');
}

const funcs = {
  parseOpts: {
    safe: function(v, opts) {
      if (typeof v !== 'number') throw new TypeError('Value must be a number');
      else if (!Array.isArray(opts)) throw new TypeError('Options must be an array');

      const evalRtn = v => {
        const rtn = v?.value ?? v;
        if (v?.execute) return rtn();
        else return rtn;
      };

      let w = 0;
      const ref = {};
      for (const v_opt of opts) {
        last = v_opt;

        if (v_opt?.weight !== undefined && (typeof v_opt.weight !== 'number' || v_opt.weight < 0))
          throw new TypeError('Weight must be a non-negative number');
        else if (v < (w += v_opt?.weight ?? 1)) return evalRtn(v_opt);
        else ref[w] = v_opt;
      }

      v %= w;
      let last;
      for (const w in ref)
        if (v < w) return evalRtn(ref[w]);
        else last = ref[w];

      return evalRtn(last);
    },
    unsafe: function(v, opts) {
      const evalRtn = v => {
        const rtn = v?.value ?? v;
        if (v?.execute) return rtn();
        else return rtn;
      };

      let w = 0;
      const ref = {};
      for (const v_opt of opts) {
        const w_opt = v_opt?.weight ?? 1;
        if (w_opt > 0) {
          if (v < (w += w_opt)) return evalRtn(v_opt);
          else ref[w] = v_opt;
        }
      }

      v %= w;
      let last;
      for (const w in ref)
        if (v < w) return evalRtn(ref[w]);
        else last = ref[w];

      return evalRtn(last);
    },
  }
};
Object.freeze(funcs);

export default funcs;
export { execCheck };