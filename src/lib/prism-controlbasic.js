Prism.languages.controlbasic = {
  comment: [
    {
      pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
      lookbehind: true,
      greedy: true,
    },
    {
      pattern: /(^|[^\\:])\/\/.*/,
      lookbehind: true,
      greedy: true,
    },
  ],
  string: {
    pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    greedy: true,
  },
  "class-name": {
    pattern:
      /\b(?:ALARM|ALARM-AT|ALARM_AT|CALL|CLEAR|CLOSE|DALARM|DECLARE|DISABLE|ENABLE|END|FOR|TO|STEP|GOSUB|GOTO|HANGUP|IF|IF+|IF-|THEN|ELSE|LET|MOD|NEXT|ON-ALARM|ON_ALARM|ON-ERROR|ON_ERROR|(?<!-|_)ON|OPEN|PHONE|PRINT|PRINT-AT|PRINT_AT|REM|REMOTE-GET|REMOTE_GET|REMOTE-SET|REMOTE_SET|RETURN|RUN-MACRO|RUN_MACRO|SET-PRINTER|SET_PRINTER|START|STOP|WAIT|AND|OR|XOR|DIM|INTEGER|STRING|BYTE|FLOAT|LONG)\b/,
    lookbehind: true,
    inside: {
      punctuation: /[.\\]/,
    },
  },
  keyword: /\b(?:break|catch)\b/,
  boolean: /\b(?:FALSE|TRUE)\b/,
  function:
    /\b(?:ABS|AVG|COM1|PIDPROP|PIDRATE|PIDRESET|CLEARPORT|DOW|DOM|DOY|MOY|INPUT|INT|INTERVAL|LN|LN-1|LN_1|MAX|MIN|OUTPUT|POWER-LOSS|POWER_LOSS|SCANS|SQR|STATUS|RUNTIME|TBL|TIME_FORMAT|TIME-ON|TIME_ON|TIME-OFF|TIME_OFF|TIME(?!-|_)|WR-ON|WR_ON|WR-OFF|WR_OFF|SENSOR-ON|SENSOR_ON|SENSOR-OFF|SENSOR_OFF|UNACK|USER-A|USER_A|USER-B|USER_B|NOT|SUNDAY|MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER|MB_BLOCKREAD|MB_BLOCKWRITE|MB_BWCOIL)\b/,
  number: /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
  operator: /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
  punctuation: /[{}[\];(),.:]/,
};
