import React, { useEffect, useState } from "react";
import _ from "lodash";
import parseParams from "./assets/parse.params.js";

// import Navbar from "./components/navbar/navbar.component";

import Localization from "./localization/Localization";

// import "./App.scss";

const App = () => {
  const [currList, setCurrList] = useState([
    { code: "EURUSD", base: "EUR", target: "USD", rate: "1.2897" },
    { code: "USDEUR", base: "USD", target: "EUR", rate: "0.7753" },
    { code: "EURCHF", base: "EUR", target: "CHF", rate: "1.3135" },
    { code: "CHFEUR", base: "CHF", target: "EUR", rate: "0.7613" },
    { code: "EURGBP", base: "EUR", target: "GBP", rate: "0.8631" },
    { code: "GBPEUR", base: "GBP", target: "EUR", rate: "1.1586" },
    { code: "USDJPY", base: "USD", target: "JPY", rate: "109.620" },
    { code: "JPYUSD", base: "JPY", target: "USD", rate: "0.0091" },
    { code: "CHFUSD", base: "CHF", target: "USD", rate: "0.9960" },
    { code: "USDCHF", base: "USD", target: "CHF", rate: "1.0040" },
    { code: "GBPCAD", base: "GBP", target: "CAD", rate: "1.7574" },
    { code: "CADGBP", base: "CAD", target: "GBP", rate: "0.5690" },
    { code: "EUREUR", base: "EUR", target: "EUR", rate: "1" },
  ]);
  const [symbols, setSymbols] = useState();
  const [form, setForm] = useState({ x1: 1, x2: 1, y1: 1, y2: 1 });
  const [message, setMessage] = useState("");
  const [alert, setAlert] = useState(0);
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const url = new URL(window.location);
    let params = parseParams(url.search);
    if (Object.keys(params).length > 0) {
      // const custom = _.hasIn(params, "custom") ? params.custom.split(":") : {};

      if (_.hasIn(params, "lang")) {
        if (params.lang in Localization) {
          setLang(params.lang);
        } else setLang("en");
      }

      if (
        _.hasIn(params, "custom_base") &&
        _.hasIn(params, "custom_target") &&
        _.hasIn(params, "custom_rate")
      ) {
        let { custom_base, custom_target, custom_rate } = params;
        custom_base = custom_base.toString().replace(/\W/g, "").toUpperCase();
        custom_target = custom_target
          .toString()
          .replace(/\W/g, "")
          .toUpperCase();

        const newCurr = [
          {
            code: custom_base + custom_target,
            base: custom_base,
            target: custom_target,
            rate: (custom_rate * 1).toFixed(4),
          },
          {
            code: custom_target + custom_base,
            base: custom_target,
            target: custom_base,
            rate: (1 / custom_rate).toFixed(4),
          },
        ];

        setCurrList((prev) => [...newCurr, ...prev]);
      }
    }
  }, []);

  useEffect(() => {
    if (currList) {
      let tmp = [];
      currList.forEach((arr) => tmp.push(arr.base, arr.target));
      setSymbols(_.uniq(tmp));

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
    console.log(form);
  }, [form]);

  const onHandlerChangeX = (event) => {
    let { name, value } = event.target;
    value = value > 0 ? value * 1 : 0;

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
      const currency = _.find(currList, { code: code });

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
      const currency = _.find(currList, { code: code });

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
      <div className="container">
        <div className="row">
          {message.length > 0 && (
            <small className="col-12 alert alert-danger text-center">
              {message}
            </small>
          )}
          <div className="col-12 text-center badge badge-info">
            {form.x1 +
              " " +
              form.y1 +
              " " +
              Localization[lang].equals +
              "" +
              form.x2 +
              " " +
              form.y2}
          </div>
          <form className="col-12">
            <div className="form-row">
              <div className="form-group col-4">{Localization[lang].base}:</div>
              <div className="form-group col-4">
                <input
                  type="number"
                  placeholder="1"
                  min="0"
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
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col-4">
                {Localization[lang].equals}:
              </div>
              <div className="form-group col-4">
                <input
                  type="number"
                  placeholder="1"
                  min="0"
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

          <table className="table table-hover table-sm col-12">
            <tbody>
              {currList &&
                currList.map(({ base, rate, target }, i) => (
                  <tr
                    key={i}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        x1: 1,
                        x2: rate,
                        y1: base,
                        y2: target,
                      }));
                    }}
                  >
                    <td>1 {base}</td>
                    <td>{Localization[lang].equals}</td>
                    <td> {rate + " " + target}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;
