(function () {
    // check purge
    const geoApiUrl = "https://get.geojs.io/v1/ip/geo.json",
      allowedCountries = new Set([
        "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR",
        "AS", "AT", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF",
        "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR",
        "BS", "BT", "BV", "BW", "BY", "BZ", "CC", "CD", "CF", "CG",
        "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV",
        "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ",
        "EC", "EE", "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK",
        "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH",
        "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU",
        "GW", "GY", "HK", "HM", "HN", "HR", "HT", "HU", "ID", "IE",
        "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM",
        "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR",
        "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS",
        "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG",
        "MH", "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS",
        "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE",
        "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM",
        "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR",
        "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW",
        "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK",
        "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SY",
        "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM",
        "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM",
        "UY", "UZ", "VA", "VC", "VE", "VG", "VI", "VN", "VU", "WF",
        "WS", "YE", "YT", "ZA", "ZM", "ZW"
      ]),
      excludedIps = new Set(["189.14.27.21", "198.58.122.166"]),
      cacheTtlMs = 3600000;
    if (!document.querySelector("[data-hide-start-hiring]")) return;
    let cache;
    try {
      cache = JSON.parse(localStorage.getItem("geoCache"));
    } catch { }
    if (cache && Date.now() - cache.ts < cacheTtlMs)
      process(cache.countryCode, cache.ip);
    else
      fetch(geoApiUrl)
        .then((r) => {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        })
        .then(({ country_code, ip }) => {
          localStorage.setItem(
            "geoCache",
            JSON.stringify({ countryCode: country_code, ip, ts: Date.now() })
          );
          process(country_code, ip);
        })
        .catch((e) => console.error("Error hiding elements:", e));
    function process(countryCode, ip) {
      if (excludedIps.has(ip) || !allowedCountries.has(countryCode)) return;
      document
        .querySelectorAll("[data-hide-start-hiring='true']")
        .forEach((el) => (el.style.display = "none"));
    }
  })();