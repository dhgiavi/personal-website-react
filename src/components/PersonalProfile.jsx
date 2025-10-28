import React, { useState } from "react";

/**
 * Robust PersonalProfile component
 * - Hiển thị lỗi trong UI nếu fetch bị lỗi
 * - Bảo vệ trước giá trị undefined từ API
 * - Avoids crashes so you won't see a white page
 */

export default function PersonalProfile() {
  const [active, setActive] = useState("");
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [usd, setUsd] = useState("");
  const [vnd, setVnd] = useState(null);

  // trạng thái hiển thị lỗi
  const [errorMsg, setErrorMsg] = useState("");

  const profile = {
    name: "Đỗ Huỳnh Gia Vĩ",
    dob: "11/09/2004",
    school: "Đại học Khoa học Tự nhiên",
    major: "Vật lý Tin học",
    hobbies: "Lập trình nhúng, IoT, tự động hóa và AI",
  };

  // Lấy dữ liệu thời tiết (an toàn, với setErrorMsg)
  async function fetchWeather() {
    setErrorMsg("");
    setWeather(null);
    if (!city) {
      setErrorMsg("Vui lòng nhập tên thành phố.");
      return;
    }

    try {
      // 1) Geocoding
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}&count=1&language=vi&format=json`
      );

      if (!geoRes.ok) {
        throw new Error(`Geocoding API lỗi: ${geoRes.status}`);
      }
      const geoJson = await geoRes.json();
      if (!geoJson?.results?.length) {
        setErrorMsg("Không tìm thấy vị trí. Thử tên khác (ví dụ: Hanoi).");
        return;
      }

      const { latitude, longitude, name, country } = geoJson.results[0];

      // 2) Weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );

      if (!weatherRes.ok) {
        throw new Error(`Weather API lỗi: ${weatherRes.status}`);
      }

      const weatherJson = await weatherRes.json();
      const cw = weatherJson?.current_weather;
      if (!cw) {
        setErrorMsg("Dữ liệu thời tiết không có phần 'current_weather'.");
        return;
      }

      setWeather({
        name: `${name}${country ? ", " + country : ""}`,
        temp: cw.temperature ?? "N/A",
        wind: cw.windspeed ?? "N/A",
      });
    } catch (err) {
      console.error("fetchWeather error:", err);
      setErrorMsg(
        err?.message || "Lỗi khi lấy dữ liệu thời tiết. Kiểm tra console."
      );
    }
  }

  // Quy đổi USD -> VND (an toàn)
  async function convertCurrency() {
    setErrorMsg("");
    setVnd(null);

    const parsed = parseFloat(usd);
    if (isNaN(parsed) || parsed < 0) {
      setErrorMsg("Vui lòng nhập số USD hợp lệ (số dương).");
      return;
    }

    try {
      const res = await fetch(
        "https://api.exchangerate.host/latest?base=USD&symbols=VND"
      );
      if (!res.ok) {
        throw new Error(`Currency API lỗi: ${res.status}`);
      }
      const data = await res.json();
      const rate = data?.rates?.VND;
      if (!rate) {
        throw new Error("Không lấy được tỷ giá VND từ API.");
      }
      const result = parsed * rate;
      setVnd(result);
    } catch (err) {
      console.error("convertCurrency error:", err);
      setErrorMsg(err?.message || "Lỗi khi lấy tỷ giá. Kiểm tra console.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fff0f6, #ffe6f9)",
        color: "#4a004f",
        padding: "2rem",
        fontFamily: "'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: "auto",
          background: "rgba(255, 250, 252, 0.95)",
          borderRadius: 16,
          padding: 20,
          textAlign: "center",
          boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
        }}
      >
        <img
          src="/vi.jpg"
          alt="avatar"
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            border: "3px solid #ff99cc",
            boxShadow: "0 6px 20px rgba(255,120,180,0.2)",
            objectFit: "cover",
          }}
          onError={(e) => {
            // nếu ảnh không có, ẩn (tránh crash)
            e.currentTarget.style.display = "none";
            console.warn("Avatar not found: /vi.jpg");
          }}
        />

        <div style={{ marginTop: 18 }}>
          <button onClick={() => setActive("info")} style={btnStyle(active === "info")}>
            👤 Profile
          </button>
          <button onClick={() => setActive("weather")} style={btnStyle(active === "weather")}>
            🌤️ Weather
          </button>
          <button onClick={() => setActive("currency")} style={btnStyle(active === "currency")}>
            💵 Currency
          </button>
        </div>

        {/* Hiện lỗi (nếu có) */}
        {errorMsg && (
          <div
            style={{
              marginTop: 16,
              background: "#fff0f6",
              color: "#b0003a",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #ffd6e8",
              textAlign: "left",
            }}
          >
            <strong>Lỗi:</strong> {errorMsg}
          </div>
        )}

        {/* Nội dung chỉ khi active */}
        {active && (
          <div
            style={{
              marginTop: 18,
              textAlign: "left",
              background: "rgba(255,255,255,0.9)",
              borderRadius: 10,
              padding: 16,
              boxShadow: "inset 0 0 6px rgba(255,200,220,0.4)",
            }}
          >
            {active === "info" && (
              <div>
                <h3 style={{ color: "#c2185b" }}>👤 Hồ sơ cá nhân</h3>
                <p><b>Họ và tên:</b> {profile.name}</p>
                <p><b>Ngày sinh:</b> {profile.dob}</p>
                <p><b>Trường:</b> {profile.school}</p>
                <p><b>Ngành:</b> {profile.major}</p>
                <p><b>Sở thích:</b> {profile.hobbies}</p>
              </div>
            )}

            {active === "weather" && (
              <div>
                <h3 style={{ color: "#c2185b" }}>🌤️ Thông tin thời tiết</h3>
                <input
                  placeholder="Nhập tên thành phố..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={inputStyle}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={fetchWeather} style={pinkBtn}>Tìm kiếm</button>
                  <button onClick={() => { setCity(""); setWeather(null); setErrorMsg(""); }} style={secondaryBtn}>Xoá</button>
                </div>

                {weather && (
                  <div style={{ marginTop: 12 }}>
                    <p><b>Thành phố:</b> {weather.name}</p>
                    <p>🌡️ <b>Nhiệt độ:</b> {weather.temp}°C</p>
                    <p>💨 <b>Gió:</b> {weather.wind} km/h</p>
                  </div>
                )}
              </div>
            )}

            {active === "currency" && (
              <div>
                <h3 style={{ color: "#c2185b" }}>💵 Quy đổi USD → VND</h3>
                <input
                  type="number"
                  placeholder="Nhập số USD"
                  value={usd}
                  onChange={(e) => setUsd(e.target.value)}
                  style={inputStyle}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={convertCurrency} style={pinkBtn}>Quy đổi</button>
                  <button onClick={() => { setUsd(""); setVnd(null); setErrorMsg(""); }} style={secondaryBtn}>Xoá</button>
                </div>
                {vnd != null && (
                  <p style={{ marginTop: 12, fontSize: 16 }}>
                    💰 <b>{usd}</b> USD ≈ <b>{Number(vnd).toLocaleString("vi-VN")}</b> VND
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// style helpers
function btnStyle(active) {
  return {
    margin: "0 8px",
    padding: "10px 18px",
    borderRadius: 10,
    background: active ? "#ffb6d9" : "#ffe6f9",
    color: "#4a004f",
    border: "1px solid #ff99cc",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.15s ease",
  };
}

const inputStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ffd6ea",
  marginBottom: 6,
  outline: "none",
};

const pinkBtn = {
  background: "#ffb6d9",
  border: "none",
  borderRadius: 8,
  padding: "8px 14px",
  fontWeight: "600",
  cursor: "pointer",
  color: "#4a004f",
};

const secondaryBtn = {
  background: "#fff",
  border: "1px solid #ffd6ea",
  borderRadius: 8,
  padding: "8px 14px",
  cursor: "pointer",
};
