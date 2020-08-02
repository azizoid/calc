import React, { useEffect, useState } from "react";
import { hasIn, isArray, last, keys, uniq, find } from "lodash";
import { format } from "date-fns";

import parseParams from "./assets/parse.params.js";

import Navbar from "./components/navbar/navbar.component";
import CurrencyList from "./components/currency-list/currency.component";

import Localization from "./components/localization.component";
import Colors from "./components/colors.component";
import currencyList from "./components/currencyList";

const App = () => {
  const [currList, setCurrList] = useState(currencyList);
  const [customCurrList, setCustomCurrList] = useState([]);

  const [symbols, setSymbols] = useState();
  const [form, setForm] = useState({ x1: 1, x2: 1, y1: 1, y2: 1 });
  const [message, setMessage] = useState("");
  const [alert, setAlert] = useState(0);
  const [lang, setLang] = useState("en");
  const [colors, setColors] = useState({ text: "#000000", bg: "#FFFFFF" });
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    document.body.style.backgroundColor = colors.bg;
    document.body.style.color = colors.text;
  }, [colors]);

  useEffect(() => {
    const url = new URL(window.location);
    let params = parseParams(url.search);

    /*
    I created a small api for currencies taken from the 
    https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml

    if it succeed, then this data will be our default values,
    and immedeately create their reverse currency conversion.
    if for some reason there will be a problem, then we use the data you provided in a task
    */
    fetch("https://good.rs/currency/api/")
      .then((response) => response.json())
      .then((doc) => {
        const codes = doc.data.map(({ code }) => code);
        setCurrList((prev) => [
          ...doc.data,
          ...prev.filter(({ code }) => !codes.includes(code)),
          ...doc.data.map(({ base, target, rate }) => ({
            code: target + base,
            base: target,
            target: base,
            rate: ((1 / rate) * 1).toFixed(4),
          })),
        ]);
        setDate(doc.date);
      })
      .catch((error) => {
        // setCurrList((prev) => [...prev, ...currencyList]);
        // console.error("Error:", error);
      });

    if (Object.keys(params).length > 0) {
      if (hasIn(params, "lang")) {
        if (params.lang in Localization) {
          setLang(params.lang);
        } else setLang("en");
      }

      if (hasIn(params, "text")) {
        setColors((prev) => ({ ...prev, text: params.text }));
      }

      if (hasIn(params, "bg")) {
        setColors((prev) => ({ ...prev, bg: params.bg }));
      }

      // const custom = hasIn(params, "custom") ? params.custom.split(":") : {};
      if (
        hasIn(params, "custom_base") &&
        hasIn(params, "custom_target") &&
        hasIn(params, "custom_rate")
      ) {
        let { custom_base, custom_target, custom_rate } = params;
        custom_base = isArray(custom_base) ? last(custom_base) : custom_base;
        custom_target = isArray(custom_target)
          ? last(custom_target)
          : custom_target;
        custom_rate = isArray(custom_rate) ? last(custom_rate) : custom_rate;

        custom_base = custom_base.toString().replace(/\W/g, "").toUpperCase();
        custom_target = custom_target
          .toString()
          .replace(/\W/g, "")
          .toUpperCase();

        const custom = [
          {
            code: custom_base + custom_target,
            base: custom_base,
            target: custom_target,
            rate: (custom_rate * 1).toFixed(4),
          },
          {
            code: custom_target + custom_base,
            target: custom_base,
            base: custom_target,
            rate: ((1 / custom_rate) * 1).toFixed(4),
          },
        ];

        setCustomCurrList((prev) => [...custom, ...prev]);
      }
    }
  }, []);

  useEffect(() => {
    setCurrList((prev) => [...prev, ...customCurrList]);
  }, [customCurrList]);

  useEffect(() => {
    if (currList.length > 1) {
      let tmp = [];
      currList.forEach((arr) => tmp.push(arr.base, arr.target));
      setSymbols(uniq(tmp));

      setForm({
        x1: 1,
        x2: currList[0].rate,
        y1: currList[0].base,
        y2: currList[0].target,
        d: 0,
      });
    }
  }, [currList]);

  useEffect(() => {
    if (!alert) return setMessage("");
    setMessage(Localization[lang].message);
    const timer = setTimeout(() => {
      setAlert(0);
    }, 1500);
    return () => {
      clearTimeout(timer);
    };
  }, [alert, lang]);

  useEffect(() => {
    // console.log(form);
  }, [form]);

  const onHandlerChangeX = (event) => {
    let { name, value } = event.target;
    // value = value.replace(/[.]/g, ",");
    // value = value > 0 ? value * 1 : 0;

    const code = name === "x1" ? form.y1 + form.y2 : form.y2 + form.y1;
    const currency = currList.filter((arr) => arr.code === code);

    const rate = currency[0].rate;

    let params = {};
    if (name === "x1") {
      params = { x1: value, x2: (value * rate).toFixed(4) };
    } else if (name === "x2") {
      params = { x1: (value * rate).toFixed(4), x2: value };
    }
    setForm((prev) => ({ ...prev, ...params }));
  };

  const onHandlerChangeY = (event) => {
    let { name, value } = event.target;

    if (name === "y1") {
      if (value === form.y2) return;

      const code = value + form.y2;
      const currency = find(currList, { code: code });

      if (!currency) {
        setAlert(1);
        return;
      } else setMessage("");

      setForm((prev) => ({
        ...prev,
        x1: (currency.rate * prev.x2).toFixed(4),
        y1: value,
      }));
    } else if (name === "y2") {
      if (value === form.y1) return;

      const code = form.y1 + value;
      const currency = find(currList, { code: code });

      if (!currency) {
        setAlert(1);
        return;
      } else setMessage("");

      setForm((prev) => ({
        ...prev,
        x2: (currency.rate * prev.x1).toFixed(4),
        y2: value,
      }));
    }
  };

  return (
    <div className="App">
      <div className="d-none d-lg-block">
        <Navbar />
      </div>
      <div className="container">
        <div className="row">
          {message.length > 0 && (
            <small className="col-12 alert alert-danger text-center">
              {message}
            </small>
          )}
          <div className="col-12 text-center alert alert-info">
            {form.x1 +
              " " +
              form.y1 +
              " " +
              Localization[lang].equals +
              " " +
              form.x2 +
              " " +
              form.y2 +
              " / " +
              date}
          </div>
          <form className="col-sm-12">
            <div className="form-row">
              <label htmlFor="x1" className="form-group col-4">
                {Localization[lang].base}:
              </label>
              <div className="form-group col-4">
                <input
                  id="x1"
                  type="number"
                  placeholder="1"
                  min="0"
                  step="0.01"
                  value={form.x1}
                  name="x1"
                  className="form-control-sm w-100"
                  onChange={(e) => onHandlerChangeX(e)}
                />
              </div>
              <div className="form-group col-4">
                <select
                  className="form-control-sm"
                  value={form.y1}
                  name="y1"
                  onChange={(e) => onHandlerChangeY(e)}
                >
                  {symbols &&
                    symbols.map((value, index) => (
                      <option value={value} key={index}>
                        {value}
                      </option>
                    ))}
                </select>
                <button
                  className="btn btn-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setForm((prev) => ({
                      x1: prev.x2,
                      x2: prev.x1,
                      y1: prev.y2,
                      y2: prev.y1,
                    }));
                  }}
                >
                  <svg
                    width="1em"
                    height="1em"
                    viewBox="0 0 16 16"
                    className="bi bi-arrow-repeat"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.854 7.146a.5.5 0 0 0-.708 0l-2 2a.5.5 0 1 0 .708.708L2.5 8.207l1.646 1.647a.5.5 0 0 0 .708-.708l-2-2zm13-1a.5.5 0 0 0-.708 0L13.5 7.793l-1.646-1.647a.5.5 0 0 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0 0-.708z"
                    />
                    <path
                      fillRule="evenodd"
                      d="M8 3a4.995 4.995 0 0 0-4.192 2.273.5.5 0 0 1-.837-.546A6 6 0 0 1 14 8a.5.5 0 0 1-1.001 0 5 5 0 0 0-5-5zM2.5 7.5A.5.5 0 0 1 3 8a5 5 0 0 0 9.192 2.727.5.5 0 1 1 .837.546A6 6 0 0 1 2 8a.5.5 0 0 1 .501-.5z"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="x2" className="form-group col-4">
                {Localization[lang].equals}:
              </label>
              <div className="form-group col-4">
                <input
                  type="number"
                  placeholder="1"
                  min="0"
                  step="0.01"
                  value={form.x2}
                  name="x2"
                  className="form-control-sm w-100"
                  onChange={(e) => onHandlerChangeX(e)}
                />
              </div>
              <div className="form-group col-4">
                <select
                  className="form-control-sm"
                  value={form.y2}
                  name="y2"
                  onChange={(e) => onHandlerChangeY(e)}
                >
                  {symbols &&
                    symbols.map((value, index) => (
                      <option value={value} key={index}>
                        {value}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </form>

          <CurrencyList
            currList={currList}
            setForm={setForm}
            equals={Localization[lang].equals}
          />

          <table className="col-sm-12 col-lg-6" cellPadding={10}>
            <tbody>
              <tr>
                <td align="right" style={{ borderRight: "1px solid" }}>
                  <label htmlFor="language">Language: </label>
                </td>
                <td>
                  <select
                    name="language"
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                  >
                    {keys(Localization)
                      .sort()
                      .map((list, i) => (
                        <option key={i} value={list}>
                          {Localization[list].name}
                        </option>
                      ))}
                  </select>
                </td>
              </tr>
            </tbody>
            {colors && (
              <tfoot>
                <tr>
                  <td align="right" style={{ borderRight: "1px solid" }}>
                    <label htmlFor="TextColor">Text Color: </label>
                  </td>
                  <td>
                    <select
                      name="TextColor"
                      value={colors.text}
                      onChange={(e) => {
                        e.persist();
                        setColors((prev) => ({
                          ...prev,
                          text: e.target.value,
                        }));
                      }}
                    >
                      {Colors.sort().map((color, i) => (
                        <option key={i} value={color.code}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
                <tr>
                  <td align="right" className="td-right-border">
                    <label htmlFor="BgColor">Background Color: </label>
                  </td>
                  <td>
                    <select
                      name="BgColor"
                      value={colors.bg}
                      onChange={(e) => {
                        e.persist();
                        setColors((prev) => ({ ...prev, bg: e.target.value }));
                      }}
                    >
                      {Colors.sort().map((color, i) => (
                        <option key={i} value={color.code}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;
