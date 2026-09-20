const NumberSystems = (() => {
  const SYSTEMS = {
    2:  { name: "Binary", label: "Binary (2)", chars: "01" },
    8:  { name: "Octal", label: "Octal (8)", chars: "01234567" },
    10: { name: "Decimal", label: "Decimal (10)", chars: "0123456789" },
    16: { name: "Hexadecimal", label: "Hexadecimal (16)", chars: "0123456789ABCDEF" }
  };

  function normalize(value) {
    return value.trim().toUpperCase();
  }

  function validate(value, base) {
    const v = normalize(value);
    if (!v) return "Enter a value first.";

    const pattern = base === 2 ? /^[01]+$/ :
                    base === 8 ? /^[0-7]+$/ :
                    base === 10 ? /^[0-9]+$/ :
                    /^[0-9A-F]+$/;

    if (!pattern.test(v)) {
      return `${SYSTEMS[base].name} accepts only: ${SYSTEMS[base].chars}`;
    }
    return "";
  }

  function parse(value, base) {
    const v = normalize(value);
    let result = 0n;
    const digits = "0123456789ABCDEF";

    for (const ch of v) {
      const digit = BigInt(digits.indexOf(ch));
      result = result * BigInt(base) + digit;
    }
    return result;
  }

  function convert(value, fromBase, toBase) {
    return parse(value, fromBase).toString(toBase).toUpperCase();
  }

  function all(value, fromBase) {
    const decimal = parse(value, fromBase);
    return {
      10: decimal.toString(10),
      2: decimal.toString(2),
      8: decimal.toString(8),
      16: decimal.toString(16).toUpperCase()
    };
  }

  function steps(value, fromBase, toBase) {
    const v = normalize(value);

    if (fromBase === toBase) {
      return {
        rows: [{ text: `${v} is already in ${SYSTEMS[toBase].name}.` }],
        result: v
      };
    }

    const decimal = parse(v, fromBase);

    if (toBase === 10) {
      const chars = v.split("").reverse();
      const rows = chars.map((ch, i) => ({
        text: `${ch} × ${fromBase}^${i}`,
        rem: ""
      }));
      return { rows, result: decimal.toString(10), expansion: true };
    }

    if (fromBase === 10) {
      let n = decimal;
      const rows = [];

      while (n > 0n) {
        const q = n / BigInt(toBase);
        const r = n % BigInt(toBase);
        rows.push({
          text: `${n} ÷ ${toBase} = ${q}`,
          rem: `remainder ${r.toString(toBase).toUpperCase()}`
        });
        n = q;
      }

      rows.reverse();
      return {
        rows,
        result: decimal.toString(toBase).toUpperCase(),
        reverse: true
      };
    }

    return {
      rows: [
        { text: `${v} (${SYSTEMS[fromBase].name}) → ${decimal.toString(10)} (Decimal)` },
        { text: `${decimal.toString(10)} → base ${toBase}` }
      ],
      result: decimal.toString(toBase).toUpperCase()
    };
  }

  return { SYSTEMS, validate, convert, all, steps };
})();
