import React, { useEffect, useState } from "react";
import _ from "lodash";

import Navbar from "./components/navbar/navbar.component";

// import "./App.scss";

const App = () => {
  const [currList, setCurrList] = useState([
    { code: "EURUSD", id: 1, base: "EUR", convertTo: "USD", rate: "1.2897" },
    { code: "USDEUR", id: 2, base: "USD", convertTo: "EUR", rate: "0.7753" },
    { code: "EURCHF", id: 3, base: "EUR", convertTo: "CHF", rate: "1.3135" },
    { code: "CHFEUR", id: 4, base: "CHF", convertTo: "EUR", rate: "0.7613" },
    { code: "EURGBP", id: 5, base: "EUR", convertTo: "GBP", rate: "0.8631" },
    { code: "GBPEUR", id: 6, base: "GBP", convertTo: "EUR", rate: "1.1586" },
    { code: "USDJPY", id: 7, base: "USD", convertTo: "JPY", rate: "109.620" },
    { code: "JPYUSD", id: 8, base: "JPY", convertTo: "USD", rate: "0.0091" },
    { code: "CHFUSD", id: 9, base: "CHF", convertTo: "USD", rate: "0.9960" },
    { code: "USDCHF", id: 10, base: "USD", convertTo: "CHF", rate: "1.0040" },
    { code: "GBPCAD", id: 11, base: "GBP", convertTo: "CAD", rate: "1.7574" },
    { code: "CADGBP", id: 12, base: "CAD", convertTo: "GBP", rate: "0.5690" },
  ]);
  const [symbols, setSymbols] = useState();

  const [form, setForm] = useState({ x1: "", x2: "", y1: "", y2: "" });

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (currList) {
      let tmp = [];
      currList.forEach((arr) => tmp.push(arr.base, arr.convertTo));
      setSymbols(_.uniq(tmp));

      setForm({
        x1: 1,
        x2: currList[0].rate,
        y1: currList[0].base,
        y2: currList[0].convertTo,
        d: 0,
      });
    }
  }, [currList]);

  const onHandlerChangex1 = (event) => {
    let { value } = event.target;
    value = value > 0 ? value * 1 : 0;

    const code = form.y1 + form.y2;
    const currency = currList && currList.filter((arr) => arr.code === code);
    const rate = currency[0].rate;

    const params = { x1: value, x2: (value * rate).toFixed(4) };

    setForm((prev) => ({ ...prev, ...params }));
  };

  const onHandlerChangex2 = (event) => {
    let { value } = event.target;
    value = value > 0 ? value * 1 : 0;

    const code = form.y2 + form.y1;

    if (currList) {
      const currency = currList.filter((arr) => arr.code === code);
      const rate = currency[0].rate;

      const params = { x1: (value * rate).toFixed(4), x2: value };

      setForm((prev) => ({ ...prev, ...params }));
    }
  };

  const onHandlerChangey1 = (event) => {
    let { value } = event.target;

    if (value === form.y1) return;

    const code = value + form.y2;
    const currency = _.find(currList, { code: code });
    if (!currency) {
      setMessage("We dont have this currency yet");
      return;
    } else setMessage("");
    let rate = currency.rate;

    setForm((prev) => ({ ...prev, x2: value, x1: rate, y1: value }));
  };

  const onHandlerChangey2 = (event) => {
    let { value } = event.target;

    if (value === form.y2) return;

    const code = value + form.y1;
    const currency = _.find(currList, { code: code });

    if (!currency) {
      setMessage("We dont have this currency yet");
      return;
    } else setMessage("");

    let rate = currency.rate;

    console.log(rate);

    setForm((prev) => ({ ...prev, x2: rate, x1: value, y2: value }));
  };

  return (
    <div className="App">
      <Navbar />
      <div className="container">
        <div className="row">
          <div className="col-8">
            <form>
              <table className="table">
                <tbody>
                  <tr>
                    <td>Base: </td>
                    <td className="form-group">
                      <input
                        type="number"
                        placeholder="1"
                        min="0"
                        value={form.x1}
                        name="x1"
                        className="form-control"
                        onChange={(e) => onHandlerChangex1(e)}
                      />
                    </td>
                    <td className="form-group">
                      <select
                        className="form-control"
                        value={form.y1}
                        name="y1"
                        onChange={(e) => onHandlerChangey1(e)}
                      >
                        {symbols &&
                          symbols.map((value, index) => (
                            <option value={value} key={index}>
                              {value}
                            </option>
                          ))}
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td>Equals: </td>
                    <td className="form-group">
                      <input
                        type="number"
                        placeholder="1"
                        min="0"
                        value={form.x2}
                        name="x2"
                        className="form-control"
                        onChange={(e) => onHandlerChangex2(e)}
                      />
                    </td>
                    <td className="form-group">
                      <select
                        className="form-control"
                        value={form.y2}
                        name="y2"
                        onChange={(e) => onHandlerChangey2(e)}
                      >
                        {symbols &&
                          symbols.map(
                            (value, index) =>
                              index > 0 && (
                                <option value={value} key={index}>
                                  {value}
                                </option>
                              )
                          )}
                      </select>
                    </td>
                  </tr>
                </tbody>
                {message.length > 0 && (
                  <tfoot>
                    <tr>
                      <td></td>
                      <td>
                        <div className="alert alert-danger">{message}</div>
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </form>
          </div>

          <div className="col-4">
            <table className="table table-condensed">
              <tbody>
                {currList &&
                  currList.map(({ base, rate, convertTo }, i) => (
                    <tr key={i}>
                      <td>1 {base}</td>
                      <td>equals</td>
                      <td> {rate + " " + convertTo}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
