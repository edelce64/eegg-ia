# -*- coding: utf-8 -*-
"""
EEGG — Pronóstico de demanda con Prophet (Facebook/Meta Prophet).

Entrada (JSON por stdin):
    {"historial": [{"ds": "2026-01-01", "y": 38000}, ...], "periodos": 14}

Salida (JSON por stdout):
    {"pronostico": [{"ds": "...", "yhat": ..., "yhat_lower": ..., "yhat_upper": ...}, ...]}

Si Prophet/pandas no están instalados, devuelve {"error": "prophet_no_instalado"}
y el servidor Node.js usa su modelo de respaldo en JavaScript.
"""
import sys
import json


def main():
    try:
        import pandas as pd
        from prophet import Prophet
    except ImportError:
        print(json.dumps({"error": "prophet_no_instalado"}))
        return

    try:
        cuerpo = json.load(sys.stdin)
        historial = cuerpo.get("historial", [])
        periodos = int(cuerpo.get("periodos", 14))

        if len(historial) < 14:
            print(json.dumps({"error": "historial_insuficiente"}))
            return

        df = pd.DataFrame(historial)
        df["ds"] = pd.to_datetime(df["ds"])
        df["y"] = pd.to_numeric(df["y"])

        m = Prophet(
            weekly_seasonality=True,
            yearly_seasonality=False,
            daily_seasonality=False,
            interval_width=0.80,
        )
        m.fit(df)

        futuro = m.make_future_dataframe(periods=periodos, freq="D")
        prev = m.predict(futuro).tail(periodos)

        salida = [
            {
                "ds": row.ds.strftime("%Y-%m-%d"),
                "yhat": round(float(row.yhat)),
                "yhat_lower": round(float(row.yhat_lower)),
                "yhat_upper": round(float(row.yhat_upper)),
            }
            for row in prev.itertuples()
        ]
        print(json.dumps({"motor": "Prophet (Python)", "pronostico": salida}))
    except Exception as exc:  # cualquier fallo → el backend usa respaldo JS
        print(json.dumps({"error": str(exc)}))


if __name__ == "__main__":
    main()
